import { useState } from 'react';

import { haptic } from '@/lib/haptics';
import { validatePassword } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { TextField } from '../ui/TextField';

type Errors = { current?: string; next?: string; confirm?: string };

/** Change the password: needs the current one first, so a stolen unlocked phone can't lock the owner out. */
export function ChangePasswordSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const close = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setErrors({});
    onClose();
  };

  const save = async () => {
    const found: Errors = {
      current: current ? undefined : 'Одоогийн нууц үгээ оруулна уу',
      next: validatePassword(next) ?? undefined,
      confirm: next !== confirm ? 'Нууц үг таарахгүй байна' : undefined,
    };
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      haptic('error');
      return;
    }
    setBusy(true);
    const result = await changePassword(current, next);
    setBusy(false);
    if (!result.ok) {
      setErrors({ current: result.error });
      haptic('error');
      return;
    }
    haptic('success');
    showToast('Нууц үг солигдлоо', 'success');
    close();
  };

  return (
    <Sheet visible={visible} title="Нууц үг солих" onClose={close}>
      <TextField
        label="Одоогийн нууц үг"
        icon="lock"
        secure
        value={current}
        onChangeText={setCurrent}
        error={errors.current}
        autoCapitalize="none"
        textContentType="password"
        maxLength={64}
      />
      <TextField
        label="Шинэ нууц үг"
        icon="key"
        secure
        value={next}
        onChangeText={setNext}
        error={errors.next}
        autoCapitalize="none"
        textContentType="newPassword"
        maxLength={64}
      />
      <TextField
        label="Шинэ нууц үг давтах"
        icon="key"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        autoCapitalize="none"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={save}
        maxLength={64}
      />
      <AppText variant="caption" color="textMuted">
        Дор хаяж 8 тэмдэгт, үсэг болон тоо агуулсан байна.
      </AppText>
      <Button label="Нууц үг солих" onPress={save} loading={busy} />
    </Sheet>
  );
}
