import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { AppText } from '../ui/AppText';
import { OctoMark } from '../ui/OctoMark';
import { Reveal } from '../ui/Reveal';
import { Screen } from '../ui/Screen';

interface AuthShellProps {
  title: string;
  subtitle: string;
  /** Name of the screen, so its entrance plays once per session. */
  screen: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared frame of the sign-in and sign-up pages: logo, heading, the form, and the "switch page" link underneath. */
export function AuthShell({ title, subtitle, screen, children, footer }: AuthShellProps) {
  const { colors } = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Reveal once={screen} style={styles.header}>
            <View style={styles.brand} accessibilityLabel="OctoLearn">
              <View style={[styles.logo, { backgroundColor: colors.accent }]}>
                <OctoMark size={34} color={colors.onAccent} />
              </View>
              <AppText variant="title" style={{ color: colors.text }}>
                OctoLearn
              </AppText>
            </View>
            <AppText variant="display" accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="body" color="textMuted">
              {subtitle}
            </AppText>
          </Reveal>
          <Reveal once={screen} index={1} style={styles.form}>
            {children}
          </Reveal>
          <Reveal once={screen} index={2} style={styles.footer}>
            {footer}
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, gap: 28 },
  header: { gap: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logo: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 16 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
});
