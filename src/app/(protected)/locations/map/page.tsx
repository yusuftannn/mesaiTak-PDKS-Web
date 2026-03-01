"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  listAttendanceByDate,
  AttendanceWithLocation,
} from "@/lib/db/attendance";
import { listUsers } from "@/lib/db/users";
import { useAuthStore } from "@/lib/auth/auth.store";

const AttendanceMap = dynamic(
  () => import("@/components/maps/AttendanceMap"),
  { ssr: false },
);

export default function LocationsPage() {
  const { user } = useAuthStore();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [data, setData] = useState<AttendanceWithLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const attendance = await listAttendanceByDate(date);
      const users = await listUsers();

      const merged: AttendanceWithLocation[] = attendance.map((a) => {
        const u = users.find((x) => x.uid === a.uid);

        return {
          ...a,
          userName: u?.name ?? a.uid,
        };
      });

      setData(merged);
      setLoading(false);
    }

    load();
  }, [date]);

  if (!user) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          Harita Görünümü
        </h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border rounded-2xl p-4 max-h-[600px] overflow-auto">
            <h2 className="font-semibold mb-3">Liste</h2>

            {data.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-3 mb-2"
              >
                <div className="font-medium">
                  {item.userName}
                </div>

                <div className="text-sm text-gray-600">
                  Status: {item.status}
                </div>

                {item.checkInAt && (
                  <div className="text-sm">
                    🟢 {item.checkInAt.toLocaleTimeString("tr-TR")}
                  </div>
                )}

                {item.checkOutAt && (
                  <div className="text-sm">
                    🔴 {item.checkOutAt.toLocaleTimeString("tr-TR")}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <AttendanceMap data={data} />
          </div>
        </div>
      )}
    </div>
  );
}