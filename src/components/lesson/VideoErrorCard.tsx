import { StyleSheet } from 'react-native';

import { VideoErrorIllustration } from '../illustrations/StateIllustrations';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/** Takes the place of the video when it can't load. Progress is safe, and one tap retries. */
export function VideoErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card style={styles.card}>
      <VideoErrorIllustration width={200} />
      <AppText variant="heading" align="center" accessibilityRole="header">
        Видео ачаалагдсангүй
      </AppText>
      <AppText variant="body" color="textMuted" align="center">
        Интернет холболтоо шалгаад дахин оролдоно уу. Таны ахиц хадгалагдсан хэвээр байна.
      </AppText>
      <Button label="Дахин оролдох" icon="refresh" onPress={onRetry} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  button: { alignSelf: 'stretch', marginTop: 8 },
});
