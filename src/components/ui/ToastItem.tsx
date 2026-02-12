"use client";

import { useEffect } from "react";
import { useToastStore, ToastItem as ToastType } from "@/lib/ui/toast.store";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  const iconMap = {
    success: {
      icon: <CheckCircle size={20} />,
      color: "text-green-600",
      bar: "bg-green-500",
    },
    error: {
      icon: <XCircle size={20} />,
      color: "text-red-600",
      bar: "bg-red-500",
    },
    info: {
      icon: <Info size={20} />,
      color: "text-blue-600",
      bar: "bg-blue-500",
    },
  };

  const config = iconMap[toast.type];

  return (
    <div className="relative w-80 bg-white rounded-xl shadow-xl border overflow-hidden animate-slide-in">
      <div className="flex items-start gap-3 p-4">
        <div className={config.color}>{config.icon}</div>

        <div className="flex-1">
          <p className="font-semibold text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-gray-600">{toast.message}</p>
          )}
        </div>

        <button onClick={() => removeToast(toast.id)}>
          <X size={16} className="text-gray-400 hover:text-gray-700" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200">
        <div
          className={`h-1 ${config.bar} animate-progress`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}
