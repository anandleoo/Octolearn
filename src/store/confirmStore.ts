import { create } from 'zustand';

import type { IconName } from '@/components/ui/Icon';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** danger = red confirm button, for things that delete or can't be undone. */
  tone?: 'default' | 'danger';
  icon?: IconName;
}

interface ConfirmState {
  options: ConfirmOptions | null;
  resolve: ((accepted: boolean) => void) | null;
}

export const useConfirmStore = create<ConfirmState>(() => ({ options: null, resolve: null }));

/**
 * Asks a yes/no question in our own blurred dialog (instead of the system alert) and resolves with the answer:
 *   if (await confirmDialog({ title: '…', confirmLabel: 'Устгах', tone: 'danger' })) { … }
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  // Only one question at a time: a new one cancels the old one.
  useConfirmStore.getState().resolve?.(false);
  return new Promise((resolve) => {
    useConfirmStore.setState({ options, resolve });
  });
}

export function answerConfirm(accepted: boolean) {
  const { resolve } = useConfirmStore.getState();
  useConfirmStore.setState({ options: null, resolve: null });
  resolve?.(accepted);
}
