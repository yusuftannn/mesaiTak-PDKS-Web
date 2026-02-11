"use client";

import { useEffect, useState } from "react";
import {
  Leave,
  listLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "@/lib/db/leaves";
import { listUsers, AppUser } from "@/lib/db/users";
import { LEAVE_TYPES } from "../../../lib/db/constants/leaveTypes";
import { useAuthStore } from "../../../lib/auth/auth.store";
import { LEAVE_STATUS_LABEL } from "../../../lib/db/constants/leaveStatus";

function formatDate(d: Date) {
  return d.toLocaleDateString("tr-TR");
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      const [l, u] = await Promise.all([listLeaves(), listUsers()]);
      setLeaves(l);
      setUsers(u);
      setLoading(false);
    })();
  }, []);

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name ?? "—";

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">İzin Talepleri</h2>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Ad Soyad</th>
              <th className="p-3">Tür</th>
              <th className="p-3">Tarih</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Aksiyon</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{getUserName(l.userId)}</td>

                <td className="p-3 text-center font-medium">
                  {LEAVE_TYPES.find((t) => t.value === l.type)?.label}
                </td>

                <td className="p-3 text-center">
                  {formatDate(l.startDate)} – {formatDate(l.endDate)}
                </td>

                <td className="p-3 text-center">
                  {LEAVE_STATUS_LABEL[l.status]}
                </td>
                <td className="p-3 text-center space-x-2">
                  {l.status === "beklemede" && (
                    <>
                      <button
                        onClick={async () => {
                          if (!user) return;

                          await approveLeave(l.id, user.uid);

                          setLeaves((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, status: "onaylandı" } : x,
                            ),
                          );
                        }}
                        className="text-green-600"
                      >
                        Onayla
                      </button>

                      <button
                        onClick={async () => {
                          if (!user) return;

                          const reason = prompt("Red sebebi?");
                          if (!reason) return;

                          await rejectLeave(l.id, user.uid, reason);

                          setLeaves((prev) =>
                            prev.map((x) =>
                              x.id === l.id
                                ? {
                                    ...x,
                                    status: "reddedildi",
                                    rejectReason: reason,
                                  }
                                : x,
                            ),
                          );
                        }}
                        className="text-red-600"
                      >
                        Reddet
                      </button>
                    </>
                  )}

                  {(l.status === "beklemede" || l.status === "reddedildi") && (
                    <button
                      onClick={async () => {
                        if (!confirm("Bu izin silinsin mi?")) return;

                        await deleteLeave(l.id);
                        setLeaves((prev) => prev.filter((x) => x.id !== l.id));
                      }}
                      className="text-gray-500 hover:text-red-600 ml-2"
                    >
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
