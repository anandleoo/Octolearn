import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { AppText } from './AppText';
import { BlurBackdrop } from './BlurBackdrop';
import { IconButton } from './IconButton';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom sheet over a blurred backdrop, for short forms and option lists. Tapping outside closes it. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <BlurBackdrop onPress={onClose} />
        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[styles.sheet, { backgroundColor: colors.surface }]}
        >
          <View style={styles.header}>
            <AppText variant="heading" style={styles.title}>
              {title}
            </AppText>
            <IconButton icon="close" label="Хаах" onPress={onClose} size={22} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, maxHeight: '90%', paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingTop: 8 },
  title: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
});
