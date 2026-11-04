import { useEffect, useState } from 'react';

import { CoursesSkeleton } from '@/components/skeletons/CoursesSkeleton';
import { HomeSkeleton } from '@/components/skeletons/HomeSkeleton';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useExit } from '@/hooks/useExit';

const PAGES = [
  { title: 'Нүүр: ачаалж байна', view: <HomeSkeleton /> },
  { title: 'Хичээл: ачаалж байна', view: <CoursesSkeleton /> },
  { title: 'Профайл: ачаалж байна', view: <ProfileSkeleton /> },
];
const SECONDS_EACH = 2;

/** Demo only (opened from Settings): shows each skeleton loading screen for a couple of seconds, then goes back. */
export default function DemoLoadingScreen() {
  const exit = useExit();
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => (page + 1 < PAGES.length ? setPage(page + 1) : exit()), SECONDS_EACH * 1000);
    return () => clearTimeout(timer);
  }, [page, exit]);

  const current = PAGES[page] ?? PAGES[0];
  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title={current?.title ?? ''} onBack={exit} />
      {current?.view}
    </Screen>
  );
}
