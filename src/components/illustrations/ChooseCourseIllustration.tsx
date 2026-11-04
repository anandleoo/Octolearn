import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * Drawn by hand as SVG (no stock art): an open book with a dotted trail rising out of it toward a flag,
 * the same "path to a goal" idea as the Home screen. Uses theme colours, so it follows light and dark mode.
 */
export function ChooseCourseIllustration({ width = 240 }: { width?: number }) {
  const { colors } = useTheme();
  const ink = colors.text;
  const height = (width * 170) / 220;
  return (
    <Svg width={width} height={height} viewBox="0 0 220 170" accessibilityElementsHidden>
      <Ellipse cx={110} cy={158} rx={84} ry={11} fill={colors.accentSoft} />

      {/* trail rising out of the book, ending at a flag */}
      <Path
        d="M110 100 C 110 84, 78 84, 78 68 C 78 52, 128 56, 128 40"
        fill="none"
        stroke={colors.lockedIcon}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray="0.1 8"
      />
      <Circle cx={110} cy={96} r={7} fill={colors.accent} />
      <Circle cx={78} cy={68} r={7} fill={colors.surface} stroke={colors.lockedIcon} strokeWidth={2.5} />
      <Circle cx={128} cy={40} r={7} fill={colors.surface} stroke={colors.lockedIcon} strokeWidth={2.5} />
      <Path d="M152 12 V40" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M152 12 L174 19 L152 26 Z" fill={colors.accent} stroke={colors.accent} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={152} cy={42} r={3} fill={ink} />

      {/* open book */}
      <Path
        d="M110 148 V112 Q78 100 36 108 V146 Q78 138 110 148 Z"
        fill={colors.surface}
        stroke={ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M110 148 V112 Q142 100 184 108 V146 Q142 138 110 148 Z"
        fill={colors.surfaceAlt}
        stroke={ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M50 122 Q70 118 96 124 M50 133 Q70 129 96 135 M124 124 Q150 118 170 122 M124 135 Q150 129 170 133"
        fill="none"
        stroke={colors.border}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path d="M100 112 V132 L104 128 L108 132 V113" fill={colors.accent} stroke={colors.accent} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}
