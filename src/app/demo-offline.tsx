import { useExit } from '@/hooks/useExit';
import { checkOnline } from '@/hooks/useOnline';
import { OfflinePage } from '@/components/feedback/OfflinePage';
import { showToast } from '@/store/toastStore';

/**
 * Demo only (opened from Settings): shows the "no internet" page without turning the phone's connection off.
 * "Дахин шалгах" does a real connection check, and goes back once the phone is online.
 */
export default function DemoOfflineScreen() {
  const exit = useExit();
  const retry = async () => {
    if (await checkOnline()) {
      showToast('Интернэт холболттой байна', 'success');
      exit();
    } else {
      showToast('Одоогоор интернэт холболт алга', 'danger');
    }
  };
  return <OfflinePage onRetry={retry} onBack={exit} />;
}
