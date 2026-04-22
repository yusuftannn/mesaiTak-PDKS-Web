"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

/* ---------------- TYPES ---------------- */

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
};

type State = {
  open: boolean;
  options: ConfirmOptions | null;
  loading: boolean;
};

/* ---------------- GLOBAL STATE ---------------- */

let state: State = {
  open: false,
  options: null,
  loading: false,
};

const listeners = new Set<() => void>();

function setState(partial: Partial<State>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

/* ---------------- PUBLIC API ---------------- */

export function confirm(options: ConfirmOptions) {
  setState({
    open: true,
    options,
    loading: false,
  });
}

/* ---------------- COMPONENT ---------------- */

export function ConfirmDialog() {
  const { open, options, loading } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  if (!open || !options) return null;

  const close = () => {
    if (loading) return;
    setState({ open: false, options: null });
  };

  const handleConfirm = async () => {
    try {
      setState({ loading: true });
      await options.onConfirm();
      setState({ open: false, options: null, loading: false });
    } catch {
      setState({ loading: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition"
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl bg-white p-6 shadow-2xl transition-all duration-200">
          {/* ICON */}
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                options.variant === "danger"
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <AlertTriangle size={22} />
            </div>
          </div>

          {/* TEXT */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              {options.title}
            </h3>

            {options.description && (
              <p className="mt-2 text-sm text-slate-500">
                {options.description}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={close}
              disabled={loading}
            >
              {options.cancelText || "Vazgeç"}
            </Button>

            <Button
              variant={options.variant === "danger" ? "danger" : "primary"}
              className="flex-1"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "İşleniyor..." : options.confirmText || "Onayla"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
