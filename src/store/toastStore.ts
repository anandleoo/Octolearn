import { create } from 'zustand';

export type ToastTone = 'info' | 'danger' | 'success';

interface ToastState {
  /** Changes on every show() so the same message twice still re-triggers the animation. */
  id: number;
  message: string | null;
  tone: ToastTone;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  message: null,
  tone: 'info',
  show: (message, tone = 'info') => set((s) => ({ id: s.id + 1, message, tone })),
  hide: () => set({ message: null }),
}));

export const showToast = (message: string, tone?: ToastTone) =>
  useToastStore.getState().show(message, tone);
