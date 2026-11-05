import { StyleSheet } from 'react-native';

import { OfflineIllustration } from '../illustrations/StateIllustrations';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/** Takes the place of the video when the phone has no internet. Progress is safe, and one tap checks the connection again. */
export function OfflineCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card style={styles.card}>
      <OfflineIllustration width={200} />
      <AppText variant="heading" align="center" accessibilityRole="header">
        Интернэт холболт алга
      </AppText>
      <AppText variant="body" color="textMuted" align="center">
        Видео үзэхэд интернэт хэрэгтэй. Холбогдсон даруйдаа дахин оролдоно уу. Таны ахиц хадгалагдсан хэвээр байна.
      </AppText>
      <Button label="Дахин шалгах" icon="refresh" onPress={onRetry} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  button: { alignSelf: 'stretch', marginTop: 8 },
});
