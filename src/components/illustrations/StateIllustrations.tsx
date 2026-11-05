import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * Hand-drawn SVG scenes for the error and empty pages (no stock art).
 * They share one style with ChooseCourseIllustration: ink outlines, a soft ground shadow,
 * violet as the only accent, and red used only for the thing that went wrong. Colours come from the theme, so dark mode works.
 */
function Scene({ width, children }: { width: number; children: (c: ReturnType<typeof useTheme>['colors']) => ReactNode }) {
  const { colors } = useTheme();
  return (
    <Svg width={width} height={(width * 170) / 220} viewBox="0 0 220 170" accessibilityElementsHidden>
      <Ellipse cx={110} cy={158} rx={84} ry={11} fill={colors.accentSoft} />
      {children(colors)}
    </Svg>
  );
}

/** A TV-style player whose video would not load: dotted red ring around the play button and an × badge. */
export function VideoErrorIllustration({ width = 220 }: { width?: number }) {
  return (
    <Scene width={width}>
      {(c) => (
        <>
          <Rect x={30} y={30} width={160} height={104} rx={12} fill={c.surface} stroke={c.text} strokeWidth={2.5} />
          <Rect x={40} y={40} width={140} height={84} rx={6} fill={c.surfaceAlt} />
          <Circle cx={110} cy={82} r={26} fill="none" stroke={c.danger} strokeWidth={3} strokeLinecap="round" strokeDasharray="0.1 8" />
          <Path d="M96 66 L96 98 L124 82 Z" fill={c.surface} stroke={c.lockedIcon} strokeWidth={3} strokeLinejoin="round" />
          <Path d="M90 134 V146 M130 134 V146 M78 148 H142" stroke={c.text} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={190} cy={32} r={13} fill={c.danger} />
          <Path d="M185 27 L195 37 M195 27 L185 37" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        </>
      )}
    </Scene>
  );
}

/** A browser-style window with an exclamation mark: the page itself failed to load. */
export function PageErrorIllustration({ width = 220 }: { width?: number }) {
  return (
    <Scene width={width}>
      {(c) => (
        <>
          <Rect x={28} y={24} width={164} height={112} rx={10} fill={c.surface} stroke={c.text} strokeWidth={2.5} />
          <Path d="M28 48 H192" stroke={c.text} strokeWidth={2.5} />
          <Circle cx={42} cy={36} r={3.5} fill={c.danger} />
          <Circle cx={54} cy={36} r={3.5} fill={c.lockedIcon} />
          <Circle cx={66} cy={36} r={3.5} fill={c.lockedIcon} />
          <Path d="M84 36 H168" stroke={c.border} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={110} cy={82} r={21} fill={c.accentSoft} stroke={c.accent} strokeWidth={3.5} />
          <Path d="M110 72 V84" stroke={c.accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={110} cy={92} r={2.6} fill={c.accent} />
          <Path d="M74 112 H146 M90 124 H130" stroke={c.border} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
    </Scene>
  );
}

/** A signpost with a question mark and a trail that leads nowhere: the page does not exist. */
export function NotFoundIllustration({ width = 220 }: { width?: number }) {
  return (
    <Scene width={width}>
      {(c) => (
        <>
          <Path d="M110 22 V150" stroke={c.text} strokeWidth={5} strokeLinecap="round" />
          <Path d="M110 34 H164 L176 46 L164 58 H110 Z" fill={c.surface} stroke={c.text} strokeWidth={2.5} strokeLinejoin="round" />
          <Path d="M110 68 H56 L44 80 L56 92 H110 Z" fill={c.accentSoft} stroke={c.text} strokeWidth={2.5} strokeLinejoin="round" />
          <Path
            d="M130 42 Q130 38 134 38 Q139 38 139 42 Q139 45 135 47 Q134 48 134 51"
            fill="none"
            stroke={c.accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Circle cx={134} cy={55} r={1.8} fill={c.accent} />
          <Path d="M74 80 H96" stroke={c.lockedIcon} strokeWidth={3} strokeLinecap="round" strokeDasharray="0.1 7" />
          <Path
            d="M40 150 C 60 138, 78 154, 98 146"
            fill="none"
            stroke={c.lockedIcon}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="0.1 8"
          />
        </>
      )}
    </Scene>
  );
}

/** A padlock at the end of a trail: this step is not unlocked yet. */
export function LockedIllustration({ width = 220 }: { width?: number }) {
  return (
    <Scene width={width}>
      {(c) => (
        <>
          <Path
            d="M26 138 C 44 120, 52 142, 70 124"
            fill="none"
            stroke={c.lockedIcon}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="0.1 8"
          />
          <Circle cx={26} cy={138} r={7} fill={c.accent} />
          <Path d="M88 78 V62 A22 22 0 0 1 132 62 V78" fill="none" stroke={c.text} strokeWidth={7} strokeLinecap="round" />
          <Rect x={74} y={76} width={72} height={58} rx={11} fill={c.accent} stroke={c.text} strokeWidth={2.5} />
          <Circle cx={110} cy={100} r={7} fill="#FFFFFF" />
          <Rect x={107.5} y={104} width={5} height={14} rx={2.5} fill="#FFFFFF" />
        </>
      )}
    </Scene>
  );
}

/** A cloud with a crossed-out Wi-Fi signal: there is no internet connection. */
export function OfflineIllustration({ width = 220 }: { width?: number }) {
  return (
    <Scene width={width}>
      {(c) => (
        <>
          <G translateY={20}>
            <Path
              d="M62 120 C36 120 28 92 50 82 C46 58 78 48 93 64 C102 38 142 40 149 67 C176 63 190 96 166 110 C161 118 153 120 147 120 Z"
              fill={c.surface}
              stroke={c.text}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <Path
              d="M102.9 100.9 A10 10 0 0 1 117.1 100.9 M95.9 93.9 A20 20 0 0 1 124.1 93.9 M88.8 86.8 A30 30 0 0 1 131.2 86.8"
              fill="none"
              stroke={c.lockedIcon}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Circle cx={110} cy={108} r={3} fill={c.lockedIcon} />
            <Path d="M66 46 L154 130" stroke={c.bg} strokeWidth={13} strokeLinecap="round" />
            <Path d="M66 46 L154 130" stroke={c.danger} strokeWidth={5} strokeLinecap="round" />
          </G>
          <Circle cx={34} cy={140} r={2.5} fill={c.lockedIcon} />
          <Circle cx={186} cy={136} r={2.5} fill={c.lockedIcon} />
          <Circle cx={170} cy={48} r={2.5} fill={c.lockedIcon} />
        </>
      )}
    </Scene>
  );
}
