import { router } from 'expo-router';

import { PageErrorIllustration } from '../illustrations/StateIllustrations';
import { Screen } from '../ui/Screen';
import { StateView } from '../ui/StateView';

/**
 * The full-screen "page failed to load" page. Used for crashes caught by the error boundary and by Expo Router.
 * The real error is intentionally NOT shown (stack traces can reveal internals).
 */
export function ErrorPage({ onRetry, onHome }: { onRetry: () => void; onHome?: () => void }) {
  return (
    <Screen>
      <StateView
        kind="error"
        illustration={<PageErrorIllustration />}
        title="Хуудас ачаалагдсангүй"
        message="Гэнэтийн алдаа гарлаа. Дахин оролдоно уу. Таны ахиц хадгалагдсан хэвээр байна."
        actionLabel="Дахин оролдох"
        onAction={onRetry}
        secondaryLabel="Нүүр рүү буцах"
        onSecondary={
          onHome ??
          (() => {
            // Bring the screens back first, then navigate: the navigator is not mounted while this page is showing.
            onRetry();
            setTimeout(() => router.replace('/'), 120);
          })
        }
      />
    </Screen>
  );
}
