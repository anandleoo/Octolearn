import { OfflineIllustration } from '../illustrations/StateIllustrations';
import { Screen } from '../ui/Screen';
import { StateView } from '../ui/StateView';

/** Full-screen "no internet" page. The lesson screen uses the smaller OfflineCard in place of the video. */
export function OfflinePage({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <Screen>
      <StateView
        kind="error"
        illustration={<OfflineIllustration />}
        title="Интернэт холболт алга"
        message="Холболтоо шалгаад дахин оролдоно уу. Таны ахиц хадгалагдсан хэвээр байна."
        actionLabel="Дахин шалгах"
        onAction={onRetry}
        secondaryLabel="Буцах"
        onSecondary={onBack}
        secondaryVariant="cancel"
      />
    </Screen>
  );
}
