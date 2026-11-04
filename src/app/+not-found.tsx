import { useRouter } from 'expo-router';

import { NotFoundIllustration } from '@/components/illustrations/StateIllustrations';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';

/** Any unknown link (octolearn://anything-else) lands here instead of a blank screen. */
export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <StateView
        kind="empty"
        illustration={<NotFoundIllustration />}
        title="Хуудас олдсонгүй"
        message="Таны хайсан хуудас байхгүй эсвэл устсан байна."
        actionLabel="Нүүр рүү буцах"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
