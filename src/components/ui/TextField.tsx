import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { fonts, HIT, radius, typography, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface TextFieldProps
  extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'maxLength'
    | 'autoCapitalize'
    | 'keyboardType'
    | 'textContentType'
    | 'autoComplete'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'autoFocus'
    | 'multiline'
    | 'numberOfLines'
  > {
  label: string;
  icon?: IconName;
  /** Error message shown under the field. Setting it also turns the border red. */
  error?: string | null;
  /** Password field with a show/hide eye. */
  secure?: boolean;
}

/** Labelled text input used by every form (sign in, sign up, settings). Handles focus colour, errors and the password eye. */
export function TextField({ label, icon, error, secure, ...input }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const border = error ? colors.danger : focused ? colors.accent : colors.border;

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.box, { borderColor: border, backgroundColor: colors.surface }]}>
        {icon && <Icon name={icon} size={20} color={focused ? colors.accent : colors.textMuted} />}
        <TextInput
          {...input}
          secureTextEntry={secure && hidden}
          autoCorrect={false}
          spellCheck={false}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[typography.body, styles.input, input.multiline && styles.multiline, { color: colors.text, fontFamily: fonts.semibold }]}
        />
        {secure && (
          <PressableScale
            feedback={false}
            onPress={() => setHidden((h) => !h)}
            accessibilityLabel={hidden ? 'Нууц үг харуулах' : 'Нууц үг нуух'}
            hitSlop={8}
            style={styles.eye}
          >
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color={colors.textMuted} />
          </PressableScale>
        )}
      </View>
      {error ? (
        <Animated.View entering={FadeIn.duration(160)}>
          <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.bold },
  box: {
    minHeight: HIT + 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, paddingVertical: 10 },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  eye: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
