import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

import { findStep } from '@/lib/curriculum';
import { parseRouteId } from '@/lib/security';
import { useProgress } from '@/store/progressStore';
import type { NodeState, Step, StepKind } from '@/types';

import { LockedIllustration, NotFoundIllustration } from '../illustrations/StateIllustrations';
import { Screen } from '../ui/Screen';
import { StateView } from '../ui/StateView';

interface StepGateProps {
  kind: StepKind;
  /** The raw value from the URL. Treated as untrusted. */
  rawId: string | string[] | undefined;
  children: (step: Step, state: NodeState) => ReactNode;
}

/**
 * The route guard for lesson and quiz screens.
 * A deep link like octolearn://lesson/u2-l5 must not skip the path, and a made-up id must not crash.
 * So: (1) the id must look like an id, (2) it must exist, (3) it must not be locked.
 * Only then are the children rendered.
 */
export function StepGate({ kind, rawId, children }: StepGateProps) {
  const router = useRouter();
  const { states } = useProgress();
  const step = findStep(parseRouteId(rawId));
  const goHome = () => router.replace('/');

  if (!step || step.kind !== kind) {
    return (
      <Screen>
        <StateView
          kind="empty"
          illustration={<NotFoundIllustration />}
          title="Олдсонгүй"
          message={kind === 'lesson' ? 'Ийм хичээл байхгүй байна.' : 'Ийм шалгалт байхгүй байна.'}
          actionLabel="Нүүр рүү буцах"
          onAction={goHome}
        />
      </Screen>
    );
  }

  const state = states.get(step.id) ?? 'locked';
  if (state === 'locked') {
    return (
      <Screen>
        <StateView
          kind="empty"
          illustration={<LockedIllustration />}
          title="Түгжээтэй байна"
          message="Өмнөх хичээлээ эхлээд дуусгана уу."
          actionLabel="Нүүр рүү буцах"
          onAction={goHome}
        />
      </Screen>
    );
  }

  return <>{children(step, state)}</>;
}
