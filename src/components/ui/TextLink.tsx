import { PressableScale } from './PressableScale';
import { AppText } from './AppText';

/** Small violet text button, for "Бүртгүүлэх" style links. */
export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="link" accessibilityLabel={label} hitSlop={10} scaleTo={0.97}>
      <AppText variant="body" color="accent" style={{ fontFamily: 'Nunito_800ExtraBold' }}>
        {label}
      </AppText>
    </PressableScale>
  );
}
