import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { answerConfirm, useConfirmStore } from '@/store/confirmStore';
import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { BlurBackdrop } from '../ui/BlurBackdrop';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

/** Mounted once in the root layout. Anything in the app can call confirmDialog({...}) to use it. */
export function ConfirmHost() {
  const options = useConfirmStore((s) => s.options);
  const { colors } = useTheme();
  const danger = options?.tone === 'danger';

  return (
    <Modal
      visible={options !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => answerConfirm(false)}
    >
      <View style={styles.center}>
        <BlurBackdrop onPress={() => answerConfirm(false)} />
        {options && (
          <Animated.View
            entering={FadeInDown.duration(220)}
            accessibilityViewIsModal
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            {options.icon && (
              <View style={[styles.icon, { backgroundColor: danger ? colors.dangerSoft : colors.accentSoft }]}>
                <Icon name={options.icon} size={26} color={danger ? colors.danger : colors.accent} />
              </View>
            )}
            <AppText variant="heading" align="center" accessibilityRole="header">
              {options.title}
            </AppText>
            {options.message ? (
              <AppText variant="body" color="textMuted" align="center">
                {options.message}
              </AppText>
            ) : null}
            <View style={styles.buttons}>
              <Button
                label={options.cancelLabel ?? 'Цуцлах'}
                variant="secondary"
                onPress={() => answerConfirm(false)}
                style={styles.button}
              />
              <Button
                label={options.confirmLabel}
                variant={danger ? 'danger' : 'primary'}
                onPress={() => answerConfirm(true)}
                style={styles.button}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: radius.lg, padding: 20, gap: 12, alignItems: 'stretch' },
  icon: { alignSelf: 'center', width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  button: { flex: 1 },
});
