"use client";

import { useEffect } from "react";
import { LogOut, Menu, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/auth.store";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import { auth } from "@/lib/firebase";

function getPlanBadgeColor(planId: string) {
  if (planId.toLowerCase().includes("pro")) {
    return "bg-violet-100 text-violet-700 border-violet-200";
  }
  if (planId.toLowerCase().includes("premium")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (planId.toLowerCase().includes("free")) {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-sky-100 text-sky-700 border-sky-200";
}

function getStatusColor(status: string) {
  if (status === "active") return "text-emerald-600";
  if (status === "trial") return "text-sky-600";
  if (status === "expired") return "text-rose-600";
  return "text-slate-500";
}

type TopbarProps = {
  onOpenSidebar?: () => void;
};

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const { currentSubscription, fetchCompanySubscription } =
    useSubscriptionsStore();

  useEffect(() => {
    if (user?.companyId) {
      fetchCompanySubscription(user.companyId);
    }
  }, [fetchCompanySubscription, user?.companyId]);

  const handleLogout = async () => {
    if (!confirm("Cikis yapmak istediginize emin misiniz?")) return;
    await auth.signOut();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/72 px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.8)] transition hover:text-slate-950 md:hidden"
              aria-label="Menüyü aç"
            >
              <Menu size={18} />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                <Sparkles size={14} />
                Premium Workspace
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                Guvenli oturum
              </span>
            </div>

            <div className="mt-2">
              <p className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                Merhaba {user?.name || "Admin"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Rol:{" "}
                <span className="font-medium capitalize text-slate-700">
                  {user?.role || "admin"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          {currentSubscription && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.7)]">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPlanBadgeColor(
                  currentSubscription.planName || "",
                )}`}
              >
                {currentSubscription.planName?.toUpperCase() || "PLAN"}
              </span>

              <span
                className={`text-xs font-semibold uppercase tracking-[0.14em] ${getStatusColor(
                  currentSubscription.status,
                )}`}
              >
                {currentSubscription.status.toUpperCase()}
              </span>
            </div>
          )}

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
            className="h-11 rounded-2xl bg-red px-4 text-red-600 shadow-[0_16px_30px_-24px_rgba(220,38,38,0.7)] hover:bg-red-50"
          >
            Cikis
          </Button>
        </div>
      </div>
    </header>
  );
}
