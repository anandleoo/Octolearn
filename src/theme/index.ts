import { useColorScheme } from 'react-native';

/**
 * One accent colour (violet) for everything interactive. White surfaces, thin borders, no gradients.
 * Green/red/amber appear only as meaning (correct / wrong / reward), never as decoration.
 */
const light = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F6FA',
  text: '#1A1A24',
  textMuted: '#6A6A7C',
  border: '#E5E5EE',
  accent: '#6C47E0',
  accentSoft: '#F1EDFD',
  onAccent: '#FFFFFF',
  success: '#17A468',
  successSoft: '#DDF4E8',
  danger: '#E5484D',
  dangerSoft: '#FDE8E8',
  reward: '#F0A020',
  rewardSoft: '#FFF0C2',
  locked: '#EAEAF1',
  lockedIcon: '#A3A3B5',
  video: '#15141C',
  shadow: '#1A1A24',
};

const dark: typeof light = {
  bg: '#101016',
  surface: '#1A1A23',
  surfaceAlt: '#23232E',
  text: '#F3F1FC',
  textMuted: '#A8A4C0',
  border: '#2E2E3B',
  accent: '#8D74F5',
  accentSoft: '#272244',
  onAccent: '#FFFFFF',
  success: '#2BC584',
  successSoft: '#163027',
  danger: '#F2686C',
  dangerSoft: '#3A2024',
  reward: '#F7B84B',
  rewardSoft: '#3A2F17',
  locked: '#292933',
  lockedIcon: '#6F6B88',
  video: '#000000',
  shadow: '#000000',
};

export type Colors = typeof light;
export type ColorName = keyof Colors;

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}

/** Very light shadow, used only for things that float (the tab bar). */
export function cardShadow(color: string, strength = 1) {
  return {
    shadowColor: color,
    shadowOpacity: 0.08 * strength,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3 * strength,
  } as const;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** Minimum size of anything tappable (≥ 48dp / 44pt, as the brief requires). */
export const HIT = 48;

/** Nunito supports Mongolian Cyrillic including Ү and Ө. Loaded in the root layout. */
export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.heavy, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.heavy, fontSize: 22, lineHeight: 30 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.heavy, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
} as const;

export type TextVariant = keyof typeof typography;

/** Shared spring/timing settings so every animation in the app has the same feel. */
export const motion = {
  // Damping is high on purpose: these settle quickly with almost no overshoot (low bounce).
  spring: { damping: 26, stiffness: 260, mass: 0.8 },
  softSpring: { damping: 28, stiffness: 170, mass: 1 },
  fast: 160,
  base: 280,
} as const;
