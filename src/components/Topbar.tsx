"use client";

import { useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/auth.store";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import { auth } from "@/lib/firebase";
import { confirm } from "@/components/ui/Confirm";

function getStatusColor(status: string) {
  if (status === "active") return "text-primary-dark";
  if (status === "trial") return "text-primary";
  if (status === "expired") return "text-accent";
  return "text-text-secondary";
}
function getStatusLabel(status: string) {
  if (status === "active") return "Aktif";
  if (status === "trial") return "Deneme";
  if (status === "expired") return "Süresi Dolmuş";
  if (status === "canceled") return "İptal Edildi";
  return "Bilinmiyor";
}

function getRemainingDays(endDate: Date | null) {
  if (!endDate) return null;

  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

  const handleLogout = () => {
    confirm({
      title: "Çıkış yapmak istiyor musun?",
      description: "Oturumun sonlandırılacak.",
      confirmText: "Çıkış Yap",
      variant: "danger",
      onConfirm: async () => {
        await auth.signOut();
      },
    });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-white/72 px-3 py-3 backdrop-blur-xl sm:px-4 lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-white text-text-secondary shadow transition hover:text-secondary md:hidden"
            >
              <Menu size={18} />
            </button>
          )}

          <div>
            <p className="text-lg font-semibold text-secondary">
              Merhaba {user?.name || "Admin"}
            </p>
            <p className="text-sm text-text-secondary">
              Rol:{" "}
              <span className="font-medium capitalize text-text-primary">
                {user?.role || "admin"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentSubscription &&
            (() => {
              const remainingDays = getRemainingDays(
                currentSubscription.endDate,
              );

              return (
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2">
                  <span
                    className={`text-xs font-semibold uppercase ${getStatusColor(
                      currentSubscription.status,
                    )}`}
                  >
                    {getStatusLabel(currentSubscription.status)}
                  </span>

                  {remainingDays !== null &&
                    (remainingDays <= 0 ? (
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                        Süresi doldu
                      </span>
                    ) : remainingDays <= 7 ? (
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                        {remainingDays} gün kaldı
                      </span>
                    ) : (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
                        {remainingDays} gün
                      </span>
                    ))}
                </div>
              );
            })()}

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
          >
            Çıkış
          </Button>
        </div>
      </div>
    </header>
  );
}
