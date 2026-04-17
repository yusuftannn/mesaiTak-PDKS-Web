"use client";

import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/features/auth/auth.store";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEffect } from "react";

function getPlanBadgeColor(planId: string) {
  if (planId.toLowerCase().includes("pro"))
    return "bg-purple-100 text-purple-700 border-purple-200";
  if (planId.toLowerCase().includes("premium"))
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (planId.toLowerCase().includes("free"))
    return "bg-gray-100 text-gray-600 border-gray-200";

  return "bg-blue-100 text-blue-700 border-blue-200";
}

function getStatusColor(status: string) {
  if (status === "active") return "text-green-600";
  if (status === "trial") return "text-blue-600";
  if (status === "expired") return "text-red-600";
  return "text-gray-500";
}

export default function Topbar() {
  const user = useAuthStore((s) => s.user);

  const { currentSubscription, fetchCompanySubscription } =
    useSubscriptionsStore();

  useEffect(() => {
    if (user?.companyId) {
      fetchCompanySubscription(user.companyId);
    }
  }, [user?.companyId, fetchCompanySubscription]);

  const handleLogout = async () => {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;
    await auth.signOut();
  };

  return (
    <header className="border-b px-6 py-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div>
          Merhaba{" "}
          <b>
            {user?.name} - {user?.role}
          </b>
        </div>

        {currentSubscription && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPlanBadgeColor(
                currentSubscription.planName || "",
              )}`}
            >
              {currentSubscription.planName?.toUpperCase() || "PLAN"}
            </span>

            <span
              className={`text-xs font-medium ${getStatusColor(
                currentSubscription.status,
              )}`}
            >
              {currentSubscription.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <Button
        variant="danger"
        size="md"
        onClick={handleLogout}
        icon={<LogOut size={16} />}
        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        Çıkış
      </Button>
    </header>
  );
}
