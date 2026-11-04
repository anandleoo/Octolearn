import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { TAB_BAR_CLEARANCE } from '@/components/navigation/FloatingTabBar';
import { CollapsingHeader } from '@/components/navigation/CollapsingHeader';
import { AchievementList } from '@/components/profile/AchievementList';
import { WeeklyChart } from '@/components/profile/WeeklyChart';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatTile } from '@/components/ui/StatTile';
import { useScreenScroll } from '@/hooks/useTabBarCollapse';
import { monthYearMn } from '@/lib/dates';
import { achievementsFrom, lastSevenDays, XP_PER_LEVEL } from '@/lib/gamification';
import { useAuthStore } from '@/store/authStore';
import { useProgress } from '@/store/progressStore';
import { useTheme } from '@/theme';

const SCREEN = 'profile';

/** Profile: who you are, your numbers, this week's activity and badges. Account changes live in Settings. */
export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { onScroll, scrollY } = useScreenScroll();
  const p = useProgress();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.progressReady);
  if (!user) return null;
  if (!ready) {
    return (
      <Screen>
        <ProfileSkeleton />
      </Screen>
    );
  }

  return (
    <Screen>
      <CollapsingHeader
        title="Профайл"
        scrollY={scrollY}
        right={<IconButton icon="settings" label="Тохиргоо" tone="circle" size={22} onPress={() => router.push('/settings')} />}
      />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_CLEARANCE }]}
      >
        <Reveal once={SCREEN} index={1}>
          <Card style={styles.hero}>
            <View style={styles.identity}>
              <Avatar name={user.name} size={72} />
              <View style={styles.identityText}>
                <AppText variant="title" numberOfLines={1}>
                  {user.name}
                </AppText>
                <AppText variant="caption" color="textMuted" numberOfLines={1}>
                  {user.email}
                </AppText>
                <View style={styles.joined}>
                  <Icon name="calendar" size={14} color={colors.textMuted} />
                  <AppText variant="caption" color="textMuted">
                    {monthYearMn(user.createdAt)}-аас хойш
                  </AppText>
                </View>
              </View>
            </View>
            {user.bio ? <AppText variant="body">{user.bio}</AppText> : null}
            <Button label="Профайл засах" icon="edit" variant="secondary" onPress={() => router.push('/edit-profile')} />
            <View style={styles.level}>
              <View style={styles.levelRow}>
                <Pill icon="level" tone="accent" label={`Түвшин ${p.level}`} />
                <AppText variant="caption" color="textMuted">
                  Дараагийн түвшин хүртэл {XP_PER_LEVEL - p.intoLevel} XP
                </AppText>
              </View>
              <ProgressBar value={p.ratio} height={8} label="Дараагийн түвшин хүртэл" />
            </View>
          </Card>
        </Reveal>

        <Reveal once={SCREEN} index={2} style={styles.grid}>
          <View style={styles.gridRow}>
            <StatTile icon="xp" value={`${p.xp}`} label="Нийт XP" />
            <StatTile icon="flame" value={`${p.streak} өдөр`} label="Streak" />
          </View>
          <View style={styles.gridRow}>
            <StatTile icon="book" value={`${p.lessonsDone}`} label="Дууссан хичээл" />
            <StatTile icon="trophy" value={`${p.quizzesPassed}`} label="Тэнцсэн шалгалт" />
          </View>
          <View style={styles.gridRow}>
            <StatTile icon="level" value={p.averageScore === null ? '—' : `${p.averageScore}%`} label="Шалгалтын дундаж" />
            <StatTile icon="check" value={`${p.percent}%`} label="Курсийн ахиц" />
          </View>
        </Reveal>

        <Reveal once={SCREEN} index={3}>
          <Card style={styles.card}>
            <AppText variant="heading">Энэ долоо хоног</AppText>
            <WeeklyChart days={lastSevenDays(p.activity, new Date())} />
          </Card>
        </Reveal>

        <Reveal once={SCREEN} index={4}>
          <Card style={styles.card}>
            <AppText variant="heading">Амжилтууд</AppText>
            <AchievementList items={achievementsFrom(p)} />
          </Card>
        </Reveal>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  hero: { gap: 18 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  identityText: { flex: 1, gap: 2 },
  joined: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  level: { gap: 10 },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  grid: { gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  card: { gap: 16 },
});
