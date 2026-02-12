import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (
    t: Omit<ToastItem, "id" | "duration"> & { duration?: number },
  ) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (t) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: crypto.randomUUID(),
          duration: t.duration ?? 4000,
          ...t,
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
