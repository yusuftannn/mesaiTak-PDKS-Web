"use client";

import { useToastStore } from "@/lib/ui/toast.store";
import ToastItem from "./ToastItem";

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
