import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ChooseCourseIllustration } from '../illustrations/ChooseCourseIllustration';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';

/** Shown on Home until the learner has picked a course. The button opens the Courses tab. */
export function NoCourseState() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <Reveal once="no-course" style={styles.art}>
        <ChooseCourseIllustration />
      </Reveal>
      <Reveal once="no-course" index={1} style={styles.texts}>
        <AppText variant="title" align="center" accessibilityRole="header">
          Та курсээ сонгоогүй байна!
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          Суралцаж эхлэхийн тулд өөрт тохирох курсээ сонгоно уу.
        </AppText>
      </Reveal>
      <Reveal once="no-course" index={2} style={styles.action}>
        <Button label="Курс сонгох" icon="book" onPress={() => router.navigate('/courses')} />
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 96, gap: 24 },
  art: { alignItems: 'center' },
  texts: { gap: 8, alignItems: 'center' },
  action: { alignSelf: 'stretch' },
});
