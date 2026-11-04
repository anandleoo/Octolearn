import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { TextLink } from '@/components/ui/TextLink';
import { haptic } from '@/lib/haptics';
import { NAME_MAX_LENGTH } from '@/lib/security';
import { PASSWORD_MIN, validateEmail, validateName, validatePassword } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';

type Errors = { name?: string; email?: string; password?: string; confirm?: string; form?: string };

/** Create an account. Every field is checked here for fast feedback and again inside the auth store. */
export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const found: Errors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: password !== confirm ? 'Нууц үг таарахгүй байна' : undefined,
    };
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      haptic('error');
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await signUp({ name, email, password, remember });
    setBusy(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      haptic('error');
    }
  };

  return (
    <AuthShell
      screen="sign-up"
      title="Бүртгүүлэх"
      subtitle="Хэдхэн секундэд шинэ бүртгэл үүсгээд суралцаж эхлээрэй."
      footer={
        <>
          <AppText variant="body" color="textMuted">
            Бүртгэлтэй юу?
          </AppText>
          <TextLink label="Нэвтрэх" onPress={() => router.replace('/sign-in')} />
        </>
      }
    >
      <TextField
        label="Нэр"
        icon="user"
        value={name}
        onChangeText={setName}
        error={errors.name}
        placeholder="Таны нэр"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        maxLength={NAME_MAX_LENGTH}
      />
      <TextField
        label="Имэйл"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={254}
      />
      <TextField
        label="Нууц үг"
        icon="lock"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder={`Дор хаяж ${PASSWORD_MIN} тэмдэгт, үсэг + тоо`}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        maxLength={64}
      />
      <TextField
        label="Нууц үг давтах"
        icon="lock"
        secure
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        placeholder="Нууц үгээ дахин оруулна уу"
        autoCapitalize="none"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        maxLength={64}
      />
      <Checkbox label="Намайг сана" checked={remember} onChange={setRemember} />
      {errors.form ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {errors.form}
        </AppText>
      ) : null}
      <Button label="Бүртгүүлэх" onPress={submit} loading={busy} />
    </AuthShell>
  );
}
