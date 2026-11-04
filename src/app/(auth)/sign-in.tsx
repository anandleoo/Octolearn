import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthShell } from '@/components/auth/AuthShell';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { TextLink } from '@/components/ui/TextLink';
import { haptic } from '@/lib/haptics';
import { validateEmail } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';

/** Sign in with email + password. When it succeeds the root layout swaps to the app by itself. */
export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  // Last remembered account pre-fills the form, and Remember me starts ticked.
  const rememberedEmail = useAuthStore((s) => s.rememberedEmail);
  const [email, setEmail] = useState(rememberedEmail ?? '');
  const [remember, setRemember] = useState(true);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const emailError = validateEmail(email);
    const passwordError = password ? undefined : 'Нууц үгээ оруулна уу';
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError });
      haptic('error');
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await signIn({ email, password, remember });
    setBusy(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      haptic('error');
    }
  };

  return (
    <AuthShell
      screen="sign-in"
      title="Тавтай морил"
      subtitle="Сурлагын замаа үргэлжлүүлэхийн тулд нэвтэрнэ үү."
      footer={
        <>
          <AppText variant="body" color="textMuted">
            Бүртгэлгүй юу?
          </AppText>
          <TextLink label="Бүртгүүлэх" onPress={() => router.replace('/sign-up')} />
        </>
      }
    >
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
        returnKeyType="next"
        maxLength={254}
      />
      <TextField
        label="Нууц үг"
        icon="lock"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Нууц үгээ оруулна уу"
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
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
      <Button label="Нэвтрэх" onPress={submit} loading={busy} />
    </AuthShell>
  );
}
