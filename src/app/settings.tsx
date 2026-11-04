import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch } from 'react-native';

import { ChangePasswordSheet } from '@/components/settings/ChangePasswordSheet';
import { DeleteAccountSheet } from '@/components/settings/DeleteAccountSheet';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { AppText } from '@/components/ui/AppText';
import { type Option, OptionSheet } from '@/components/ui/OptionSheet';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useExit } from '@/hooks/useExit';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';
import { confirmDialog } from '@/store/confirmStore';
import { useProgress, useProgressStore } from '@/store/progressStore';
import { type AppearanceMode, useSettingsStore } from '@/store/settingsStore';
import { showToast } from '@/store/toastStore';
import { spacing, useTheme } from '@/theme';

const SCREEN = 'settings';
const DEMO_FAILING_VIDEO = 'fail=1';
type SheetName = 'password' | 'delete' | 'appearance' | null;

const APPEARANCE_OPTIONS: Option<AppearanceMode>[] = [
  { value: 'system', label: 'Системийн', description: 'Утасныхаа тохиргоог дагана', icon: 'phone' },
  { value: 'light', label: 'Цайвар', description: 'Үргэлж цайвар дэвсгэртэй', icon: 'light' },
  { value: 'dark', label: 'Харанхуй', description: 'Шөнийн тохиромжтой, нүдэнд амар', icon: 'dark' },
];

/** Settings: account details, app preferences, and the (collapsible) danger zone: reset progress, delete account. */
export default function SettingsScreen() {
  const { colors } = useTheme();
  const exit = useExit();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const resetProgress = useProgressStore((s) => s.reset);
  const { appearance, haptics, setAppearance, setHaptics } = useSettingsStore();
  const course = useProgress().course;
  const [sheet, setSheet] = useState<SheetName>(null);
  if (!user) return null;

  const confirmSignOut = async () => {
    const yes = await confirmDialog({
      title: 'Системээс гарах уу?',
      message: 'Ахиц таны бүртгэлд хадгалагдсан хэвээр үлдэнэ.',
      confirmLabel: 'Гарах',
      tone: 'danger',
      icon: 'logout',
    });
    if (yes) void signOut();
  };

  const confirmReset = async () => {
    const yes = await confirmDialog({
      title: 'Ахицаа дахин эхлүүлэх үү?',
      message: 'Бүх XP, дууссан хичээл, шалгалтын дүн устна. Бүртгэл хэвээр үлдэнэ.',
      confirmLabel: 'Дахин эхлүүлэх',
      tone: 'danger',
      icon: 'refresh',
    });
    if (!yes) return;
    resetProgress();
    haptic('success');
    showToast('Ахиц дахин эхэллээ', 'success');
  };

  const appearanceLabel = APPEARANCE_OPTIONS.find((o) => o.value === appearance)?.label;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Тохиргоо" onBack={exit} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal once={SCREEN}>
          <SettingsGroup title="БҮРТГЭЛ">
            <SettingsRow icon="user" label="Профайл засах" value={user.name} onPress={() => router.push('/edit-profile')} />
            <SettingsRow icon="mail" label="Имэйл" value={user.email} />
            <SettingsRow icon="key" label="Нууц үг солих" onPress={() => setSheet('password')} />
            <SettingsRow tone="danger" icon="logout" label="Системээс гарах" onPress={confirmSignOut} />
          </SettingsGroup>
        </Reveal>

        <Reveal once={SCREEN} index={1}>
          <SettingsGroup title="ТОХИРГОО">
            <SettingsRow icon="appearance" label="Харагдах байдал" value={appearanceLabel} onPress={() => setSheet('appearance')} />
            <SettingsRow
              icon="vibrate"
              label="Чичиргээн хариу"
              description="Товч дарах, хариулах үед"
              trailing={
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ true: colors.accent, false: colors.locked }}
                  accessibilityLabel="Чичиргээн хариу"
                />
              }
            />
          </SettingsGroup>
        </Reveal>

        <Reveal once={SCREEN} index={2}>
          <SettingsGroup title="АППЫН ТУХАЙ">
            <SettingsRow icon="info" label="Хувилбар" value={Constants.expoConfig?.version ?? '1.0.0'} />
          </SettingsGroup>
        </Reveal>

        <Reveal once={SCREEN} index={3}>
          <SettingsGroup title="ДЕМО · АЛДАА БА АЧААЛЛЫН ТӨЛӨВ" collapsible>
            <SettingsRow
              icon="play"
              label="Видео ачаалагдахгүй"
              description="Хичээл дээр видео алдаатай үед"
              onPress={() => {
                const first = course?.steps[0];
                if (first) router.push(`/lesson/${first.id}?${DEMO_FAILING_VIDEO}`);
                else showToast('Эхлээд курс сонгоно уу');
              }}
            />
            <SettingsRow icon="alert" label="Хуудас ачаалагдахгүй" description="Алдааны хуудсын жишээ (апп эвдрэхгүй)" onPress={() => router.push('/demo-error')} />
            <SettingsRow icon="search" label="Хуудас олдсонгүй" description="Байхгүй хаяг руу орсон үед" onPress={() => router.push('/demo/missing-page')} />
            <SettingsRow icon="clock" label="Ачаалж буй төлөв" description="Skeleton: Нүүр, Хичээл, Профайл" onPress={() => router.push('/demo-loading')} />
          </SettingsGroup>
        </Reveal>

        <Reveal once={SCREEN} index={4}>
          <SettingsGroup title="АЮУЛТАЙ БҮС" danger collapsible>
            <SettingsRow
              tone="danger"
              icon="refresh"
              label="Ахиц дахин эхлүүлэх"
              description="Бүх XP, хичээл, шалгалтын дүн устна"
              onPress={confirmReset}
            />
            <SettingsRow
              tone="danger"
              icon="trash"
              label="Бүртгэл устгах"
              description="Бүртгэл болон ахиц бүрмөсөн устна"
              onPress={() => setSheet('delete')}
            />
          </SettingsGroup>
          <AppText variant="caption" color="textMuted" style={styles.note}>
            Аюултай үйлдлүүдийг буцаах боломжгүй.
          </AppText>
        </Reveal>
      </ScrollView>

      <OptionSheet
        visible={sheet === 'appearance'}
        title="Харагдах байдал"
        options={APPEARANCE_OPTIONS}
        value={appearance}
        onSelect={setAppearance}
        onClose={() => setSheet(null)}
      />
      <ChangePasswordSheet visible={sheet === 'password'} onClose={() => setSheet(null)} />
      <DeleteAccountSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: spacing.sm, paddingBottom: 32, gap: 24 },
  note: { paddingHorizontal: 4, marginTop: 8 },
});
