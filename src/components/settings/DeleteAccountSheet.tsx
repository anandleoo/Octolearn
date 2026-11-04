import { useState } from 'react';

import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/store/toastStore';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { TextField } from '../ui/TextField';

/** Permanent deletion. Asks for the password so it can't happen by accident or from a borrowed phone. */
export function DeleteAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const confirm = async () => {
    if (!password) {
      setError('Нууц үгээ оруулна уу');
      return;
    }
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      haptic('error');
      return;
    }
    // The account is gone and the router has already sent the user back to sign-in.
    haptic('warning');
    showToast('Бүртгэл устгагдлаа');
  };

  return (
    <Sheet visible={visible} title="Бүртгэл устгах" onClose={close}>
      <AppText variant="body" color="textMuted">
        Таны бүртгэл, XP, дууссан хичээл болон шалгалтын дүн бүрмөсөн устах бөгөөд сэргээх боломжгүй.
      </AppText>
      <TextField
        label="Баталгаажуулахын тулд нууц үгээ оруулна уу"
        icon="lock"
        secure
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        error={error}
        autoCapitalize="none"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={confirm}
        maxLength={64}
      />
      <Button label="Бүртгэлээ устгах" variant="danger" onPress={confirm} loading={busy} />
      <Button label="Цуцлах" variant="secondary" onPress={close} />
    </Sheet>
  );
}
