import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { isAllowedVideoUrl } from '@/lib/security';
import { skipTarget } from '@/lib/videoSkip';

/** Passing this many seconds between two updates means the user jumped (seeked), not watched. */
const MAX_PLAYBACK_STEP = 1.5;
/** The "Дуусгах" button unlocks after this share of the video was genuinely watched. */
export const WATCH_THRESHOLD = 0.9;
const BUCKETS_PER_SECOND = 2;

/**
 * Everything the lesson screen needs to know about the video:
 * playing or not, position, duration, loading/error, and how much was *really* watched.
 *
 * "Watched" is counted in half-second pieces that were reached by normal playback.
 * Dragging the scrubber to the end does not count, and replaying the same part does not count twice.
 */
export function useLessonPlayback(videoUrl: string, autoplay = false) {
  const safeUrl = isAllowedVideoUrl(videoUrl) ? videoUrl : null;
  const player = useVideoPlayer(safeUrl ? { uri: safeUrl } : null, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    // Arriving from "next lesson" starts the video right away.
    if (autoplay) p.play();
  });

  const { status, error } = useEvent(player, 'statusChange', { status: player.status });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedRatio, setWatchedRatio] = useState(0);
  const [ended, setEnded] = useState(false);

  const watched = useRef(new Set<number>());
  const lastTime = useRef(0);

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const total = player.duration;
    setPosition(currentTime);
    if (total > 0) setDuration(total);

    const delta = currentTime - lastTime.current;
    lastTime.current = currentTime;
    if (total <= 0 || delta <= 0 || delta > MAX_PLAYBACK_STEP) return;

    const buckets = Math.max(1, Math.ceil(total * BUCKETS_PER_SECOND));
    watched.current.add(Math.min(buckets - 1, Math.floor(currentTime * BUCKETS_PER_SECOND)));
    setWatchedRatio(Math.min(1, watched.current.size / buckets));
  });

  useEventListener(player, 'playToEnd', () => setEnded(true));

  // Pause when the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') player.pause();
    });
    return () => sub.remove();
  }, [player]);

  const toggle = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      // Pressing play after the video finished starts it again.
      if (ended || (player.duration > 0 && player.currentTime >= player.duration - 0.1)) {
        player.currentTime = 0;
        lastTime.current = 0;
        setEnded(false);
      }
      player.play();
    }
  }, [player, ended]);

  const seekTo = useCallback(
    (seconds: number) => {
      const target = Math.max(0, Math.min(seconds, player.duration || seconds));
      player.currentTime = target;
      lastTime.current = target; // so the jump is not counted as watched time
      setPosition(target);
      setEnded(false);
    },
    [player],
  );

  // Uses the player's live time, so quick repeated skips add up. It goes through seekTo, so skipping never counts as watching.
  const skipBy = useCallback(
    (delta: number) => seekTo(skipTarget(player.currentTime, player.duration, delta)),
    [player, seekTo],
  );

  const retry = useCallback(() => {
    if (!safeUrl) return;
    watched.current.clear();
    lastTime.current = 0;
    setPosition(0);
    setWatchedRatio(0);
    setEnded(false);
    player.replaceAsync({ uri: safeUrl }).then(() => player.play()).catch(() => {});
  }, [player, safeUrl]);

  return {
    player,
    blocked: safeUrl === null,
    /** The video can't be shown: its address was refused, or loading it failed. */
    failed: safeUrl === null || status === 'error',
    status,
    errorMessage: error?.message,
    isPlaying,
    position,
    duration,
    watchedRatio,
    canFinish: watchedRatio >= WATCH_THRESHOLD,
    toggle,
    seekTo,
    skipBy,
    retry,
    pause: () => player.pause(),
  };
}

export type LessonPlayback = ReturnType<typeof useLessonPlayback>;
