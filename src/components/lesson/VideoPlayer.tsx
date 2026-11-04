import { VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { LessonPlayback } from '@/hooks/useLessonPlayback';
import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { PressableScale } from '../ui/PressableScale';
import { VideoSkeleton } from '../skeletons/VideoSkeleton';
import { Scrubber } from './Scrubber';

const HIDE_AFTER_MS = 2500;

const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Video with our own controls: play/pause, seek, time, fullscreen.
 * Also shows what the user should see while it loads and when it cannot load (brief section 6).
 */
export function VideoPlayer({ playback }: { playback: LessonPlayback }) {
  const { colors } = useTheme();
  const { player, status, isPlaying, position, duration, toggle, seekTo } = playback;
  const viewRef = useRef<VideoView>(null);

  // The lesson screen shows a separate error card when the video fails, so only loading is handled here.
  const loading = status === 'loading' || status === 'idle';

  // Controls fade out a moment after playback starts, and come back on tap.
  const [scrubbing, setScrubbing] = useState(false);
  const visible = useSharedValue(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [controlsOn, setControlsOn] = useState(true);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    visible.value = withTiming(1, { duration: 160 });
    setControlsOn(true);
    if (isPlaying && !scrubbing) {
      hideTimer.current = setTimeout(() => {
        visible.value = withTiming(0, { duration: 260 });
        setControlsOn(false);
      }, HIDE_AFTER_MS);
    }
  }, [isPlaying, scrubbing, visible]);

  useEffect(() => {
    // Re-show the controls whenever play/pause/scrubbing changes, then auto-hide after a moment.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    show();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  const overlay = useAnimatedStyle(() => ({ opacity: visible.value }));

  return (
    <View style={[styles.box, { backgroundColor: colors.video }]}>
      <>
        <VideoView
          ref={viewRef}
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          nativeControls={false}
          fullscreenOptions={{ enable: true }}
          accessibilityLabel="Хичээлийн видео"
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={show}
          accessibilityLabel={isPlaying ? 'Видеоны удирдлагыг харуулах' : 'Видеоны удирдлага'}
        />
        {loading && <VideoSkeleton />}
        <Animated.View pointerEvents={controlsOn ? 'box-none' : 'none'} style={[StyleSheet.absoluteFill, overlay]}>
          <View pointerEvents="box-none" style={styles.center}>
            {!loading && (
              <PressableScale
                onPress={toggle}
                accessibilityLabel={isPlaying ? 'Түр зогсоох' : 'Тоглуулах'}
                style={styles.playButton}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#FFFFFF" />
              </PressableScale>
            )}
          </View>
          <View style={styles.bottom}>
            <AppText variant="caption" style={styles.time}>
              {formatTime(position)} / {formatTime(duration)}
            </AppText>
            <Scrubber
              ratio={duration > 0 ? position / duration : 0}
              onSeek={(r) => seekTo(r * duration)}
              onScrubChange={setScrubbing}
            />
            <IconButton
              icon="expand"
              label="Бүтэн дэлгэцээр харах"
              size={20}
              tone="overlay"
              onPress={() => viewRef.current?.enterFullscreen().catch(() => {})}
            />
          </View>
        </Animated.View>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    position: 'absolute',
    left: 12,
    right: 4,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: { color: '#FFFFFF', minWidth: 78 },
});
