import { VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LessonPlayback } from '@/hooks/useLessonPlayback';
import { haptic } from '@/lib/haptics';
import { CHAIN_TAP_MS, DOUBLE_TAP_MS, NO_TAP, readTap, type TapSide } from '@/lib/videoSkip';
import { useSettingsStore } from '@/store/settingsStore';
import { fonts, radius, useTheme } from '@/theme';

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

interface VideoPlayerProps {
  playback: LessonPlayback;
  /** Fills the whole screen. It is our own layout, so every control below works there too. */
  fullscreen?: boolean;
  onToggleFullscreen: () => void;
}

/**
 * Video with our own controls: play/pause, seek, skip, time, fullscreen.
 * Double-tapping the left or right half skips by the amount chosen in Settings; more taps keep skipping.
 */
export function VideoPlayer({ playback, fullscreen = false, onToggleFullscreen }: VideoPlayerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const skipSeconds = useSettingsStore((s) => s.skipSeconds);
  const { player, status, isPlaying, position, duration, toggle, seekTo, skipBy } = playback;

  // The lesson screen shows a separate error card when the video fails, so only loading is handled here.
  // Android also reports "idle" once a video ends, so this only counts before the video's length is known;
  // otherwise the placeholder would cover the finished video and hide the replay button.
  const loading = (status === 'loading' || status === 'idle') && duration === 0;

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

  // A run of skips adds up on one badge: "+30 сек".
  const [badge, setBadge] = useState<{ side: TapSide; seconds: number } | null>(null);
  const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skip = (side: TapSide) => {
    skipBy(side === 'forward' ? skipSeconds : -skipSeconds);
    haptic('select');
    setBadge((b) => ({ side, seconds: (b?.side === side ? b.seconds : 0) + skipSeconds }));
    if (badgeTimer.current) clearTimeout(badgeTimer.current);
    badgeTimer.current = setTimeout(() => setBadge(null), CHAIN_TAP_MS + 150);
  };

  // A tap only counts as "show the controls" once it's clear no second tap is coming.
  const tap = useRef(NO_TAP);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTap = (side: TapSide) => {
    const result = readTap(tap.current, side, Date.now());
    tap.current = result.state;
    if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    if (result.skip) skip(side);
    else singleTapTimer.current = setTimeout(show, DOUBLE_TAP_MS);
  };

  useEffect(
    () => () => {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      if (badgeTimer.current) clearTimeout(badgeTimer.current);
    },
    [],
  );

  const edges = fullscreen ? { left: insets.left + 12, right: insets.right + 4, bottom: insets.bottom + 8 } : null;
  const hint = `Хоёр удаа товшиж ${skipSeconds} секунд гүйлгэнэ`;

  return (
    <View style={[styles.box, fullscreen && styles.boxFull, { backgroundColor: fullscreen ? '#000000' : colors.video }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        accessibilityLabel="Хичээлийн видео"
      />
      <View style={[StyleSheet.absoluteFill, styles.zones]}>
        <Pressable
          style={styles.zone}
          onPress={() => onTap('back')}
          accessibilityLabel="Видеоны зүүн хэсэг"
          accessibilityHint={hint}
        />
        <Pressable
          style={styles.zone}
          onPress={() => onTap('forward')}
          accessibilityLabel="Видеоны баруун хэсэг"
          accessibilityHint={hint}
        />
      </View>
      {loading && <VideoSkeleton />}
      {badge && (
        <Animated.View
          entering={FadeIn.duration(120)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={[styles.badge, badge.side === 'forward' ? styles.badgeRight : styles.badgeLeft]}
        >
          <AppText variant="heading" style={styles.white}>
            {badge.side === 'forward' ? '+' : '−'}
            {badge.seconds} сек
          </AppText>
        </Animated.View>
      )}
      <Animated.View pointerEvents={controlsOn ? 'box-none' : 'none'} style={[StyleSheet.absoluteFill, overlay]}>
        <View pointerEvents="box-none" style={styles.center}>
          {!loading && (
            <>
              <SkipButton
                icon="refresh"
                seconds={skipSeconds}
                label={`${skipSeconds} секунд буцаах`}
                onPress={() => {
                  skip('back');
                  show();
                }}
              />
              <PressableScale
                onPress={toggle}
                accessibilityLabel={isPlaying ? 'Түр зогсоох' : 'Тоглуулах'}
                style={styles.playButton}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#FFFFFF" />
              </PressableScale>
              <SkipButton
                icon="forward"
                seconds={skipSeconds}
                label={`${skipSeconds} секунд урагшлуулах`}
                onPress={() => {
                  skip('forward');
                  show();
                }}
              />
            </>
          )}
        </View>
        <View style={[styles.bottom, edges]}>
          <AppText variant="caption" style={styles.time}>
            {formatTime(position)} / {formatTime(duration)}
          </AppText>
          <Scrubber
            ratio={duration > 0 ? position / duration : 0}
            onSeek={(r) => seekTo(r * duration)}
            onScrubChange={setScrubbing}
          />
          <IconButton
            icon={fullscreen ? 'shrink' : 'expand'}
            label={fullscreen ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэцээр харах'}
            size={20}
            tone="overlay"
            onPress={onToggleFullscreen}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function SkipButton({
  icon,
  seconds,
  label,
  onPress,
}: {
  icon: 'refresh' | 'forward';
  seconds: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} feedback={false} hitSlop={6} style={styles.skipButton}>
      <Icon name={icon} size={34} color="#FFFFFF" strokeWidth={1.8} />
      <AppText allowFontScaling={false} style={styles.skipNumber}>
        {seconds}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  boxFull: { flex: 1, aspectRatio: undefined, borderRadius: 0 },
  zones: { flexDirection: 'row' },
  zone: { flex: 1 },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipNumber: {
    position: 'absolute',
    color: '#FFFFFF',
    fontFamily: fonts.heavy,
    fontSize: 11,
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: '12%',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  badgeLeft: { left: '8%' },
  badgeRight: { right: '8%' },
  white: { color: '#FFFFFF' },
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
