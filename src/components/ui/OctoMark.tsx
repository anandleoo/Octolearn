import Svg, { Path } from 'react-native-svg';

interface OctoMarkProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** The OctoLearn logo: an octagram (8-pointed star), drawn as one outline so it works at any size and colour. */
export function OctoMark({ size = 28, color, strokeWidth = 7 }: OctoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Path
        d="M60 14 L92.53 92.53 L14 60 L92.53 27.47 L60 106 L27.47 27.47 L106 60 L27.47 92.53 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
