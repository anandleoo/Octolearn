import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useExit } from '@/hooks/useExit';
import { haptic } from '@/lib/haptics';
import { BIO_MAX_LENGTH, NAME_MAX_LENGTH, sanitizeBio, sanitizeName } from '@/lib/security';
import { normalizeEmail, validateEmail, validateName } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';
import { confirmDialog } from '@/store/confirmStore';
import { showToast } from '@/store/toastStore';

type Errors = { name?: string; email?: string; password?: string; form?: string };

/** Edit profile: name, email and a short bio. Changing the email asks for the password first. */
export default function EditProfileScreen() {
  const exit = useExit();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  if (!user) return null;

  const emailChanged = normalizeEmail(email) !== user.email;
  const dirty = (sanitizeName(name) ?? '') !== user.name || emailChanged || sanitizeBio(bio) !== user.bio;

  const back = async () => {
    if (!dirty) return exit();
    const leave = await confirmDialog({
      title: 'Өөрчлөлтийг хадгалахгүй гарах уу?',
      message: 'Хадгалаагүй өөрчлөлтүүд устана.',
      confirmLabel: 'Гарах',
      cancelLabel: 'Үргэлжлүүлэх',
      tone: 'danger',
      icon: 'edit',
    });
    if (leave) exit();
  };

  const save = async () => {
    if (busy || !dirty) return;
    const found: Errors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: emailChanged && !password ? 'Имэйл солихын тулд нууц үгээ оруулна уу' : undefined,
    };
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      haptic('error');
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await updateProfile({ name, email, bio, password });
    setBusy(false);
    if (!result.ok) {
      // Wrong password belongs under the password box; everything else under the form.
      setErrors(emailChanged && result.error.includes('нууц үг') ? { password: result.error } : { form: result.error });
      haptic('error');
      return;
    }
    haptic('success');
    showToast('Профайл шинэчлэгдлээ', 'success');
    exit();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Профайл засах" onBack={back} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatar}>
            <Avatar name={sanitizeName(name) ?? user.name} size={88} />
          </View>
          <TextField
            label="Нэр"
            icon="user"
            value={name}
            onChangeText={setName}
            error={errors.name}
            maxLength={NAME_MAX_LENGTH}
            autoCapitalize="words"
            textContentType="name"
          />
          <TextField
            label="Имэйл"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            maxLength={254}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
          {emailChanged && (
            <TextField
              label="Нууц үг (имэйл солихын тулд)"
              icon="lock"
              secure
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              autoCapitalize="none"
              textContentType="password"
              maxLength={64}
            />
          )}
          <View style={styles.bio}>
            <TextField
              label="Тайлбар"
              icon="edit"
              value={bio}
              onChangeText={setBio}
              placeholder="Өөрийнхөө тухай хэдхэн үг"
              maxLength={BIO_MAX_LENGTH}
              multiline
              numberOfLines={3}
            />
            <AppText variant="caption" color="textMuted" align="right">
              {bio.length} / {BIO_MAX_LENGTH}
            </AppText>
          </View>
          {errors.form ? (
            <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
              {errors.form}
            </AppText>
          ) : null}
          <Button label="Хадгалах" onPress={save} disabled={!dirty} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 16 },
  avatar: { alignItems: 'center', marginBottom: 4 },
  bio: { gap: 4 },
});
