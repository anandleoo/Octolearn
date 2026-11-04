import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

interface ScrubberProps {
  /** 0 to 1 */
  ratio: number;
  onSeek: (ratio: number) => void;
  onScrubChange?: (scrubbing: boolean) => void;
}

const THUMB = 16;

/**
 * Video seek bar: tap anywhere on it or drag the knob. Built on React Native's PanResponder,
 * so it needs no extra gesture library. The touch area is 48dp tall even though the line is thin.
 */
export function Scrubber({ ratio, onSeek, onScrubChange }: ScrubberProps) {
  const [width, setWidth] = useState(0);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  // PanResponder is created once, so it reads the newest values through refs.
  const live = useRef({ width: 0, onSeek, onScrubChange });
  useEffect(() => {
    live.current = { width, onSeek, onScrubChange };
  });

  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
  const responder = useMemo(
    () =>
      // `live` is only read inside the touch callbacks below, never while rendering.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          live.current.onScrubChange?.(true);
          setDragRatio(clamp01(e.nativeEvent.locationX / (live.current.width || 1)));
        },
        onPanResponderMove: (e) => {
          setDragRatio(clamp01(e.nativeEvent.locationX / (live.current.width || 1)));
        },
        onPanResponderRelease: (e) => {
          live.current.onSeek(clamp01(e.nativeEvent.locationX / (live.current.width || 1)));
          setDragRatio(null);
          live.current.onScrubChange?.(false);
        },
        onPanResponderTerminate: () => {
          setDragRatio(null);
          live.current.onScrubChange?.(false);
        },
      }),
    [],
  );

  const shown = clamp01(dragRatio ?? ratio);
  return (
    <View
      {...responder.panHandlers}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Видеоны байрлал"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(shown * 100) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onSeek(clamp01(shown + (e.nativeEvent.actionName === 'increment' ? 0.1 : -0.1)))
      }
      style={styles.touchArea}
    >
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.fill, { width: `${shown * 100}%` }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.thumb, { left: shown * width - THUMB / 2, transform: [{ scale: dragRatio === null ? 1 : 1.3 }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { flex: 1, height: 48, justifyContent: 'center' },
  track: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FFFFFF' },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
  },
});
