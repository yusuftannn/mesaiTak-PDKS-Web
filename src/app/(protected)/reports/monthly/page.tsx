"use client";

import { useEffect, useState, useMemo } from "react";
import { listUsers, AppUser } from "@/lib/db/users";
import { getMonthlyReport } from "@/lib/db/reports";
import { AttendanceDoc, LeaveDoc } from "@/lib/db/constants/reportTypes";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { holidays2026 } from "@/lib/db/constants/holidays";

function formatDateLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function calcHours(start?: Date, end?: Date) {
  if (!start || !end) return 0;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function calcShiftHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function MonthlyReportPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [users, setUsers] = useState<AppUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceDoc[]>([]);
  const [leaves, setLeaves] = useState<LeaveDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);

      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const [u, report] = await Promise.all([
        listUsers(),
        getMonthlyReport(start, end),
      ]);

      if (!active) return;

      setUsers(u);
      setAttendance(report.attendance);
      setLeaves(report.leaves);
      setLoading(false);
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [date]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceDoc>();
    attendance.forEach((a) => {
      map.set(`${a.uid}_${a.date}`, a);
    });
    return map;
  }, [attendance]);

  const leaveMap = useMemo(() => {
    const map = new Map<string, LeaveDoc[]>();

    leaves
      .filter((l) => l.status === "onaylandı")
      .forEach((l) => {
        const start = l.startDate.toDate();
        const end = l.endDate.toDate();

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = `${l.userId}_${formatDate(d)}`;
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(l);
        }
      });

    return map;
  }, [leaves]);

  const holidaySet = useMemo(
    () => new Set(holidays2026.map((h) => h.date)),
    [],
  );

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  const days = getDaysInMonth(date);

  function getDayStatus(
    currentDate: Date,
    userId: string,
  ): { label: string; className: string; workedHours: number } {
    const dateStr = formatDateLocalISO(currentDate);
    const attendance = attendanceMap.get(`${userId}_${dateStr}`);
    const leave = leaveMap.get(`${userId}_${dateStr}`);

    // Resmi tatil
    if (holidaySet.has(dateStr)) {
      return {
        label: "RT",
        className: "bg-yellow-400 text-white",
        workedHours: 0,
      };
    }

    // İzin
    if (leave) {
      return {
        label: "İ",
        className: "bg-orange-400 text-white",
        workedHours: 0,
      };
    }

    // Hafta sonu
    if (isWeekend(currentDate)) {
      return {
        label: "HT",
        className: "bg-amber-300 text-black",
        workedHours: 0,
      };
    }

    // Çalışmadı
    if (!attendance) {
      return { label: "—", className: "bg-gray-100", workedHours: 0 };
    }

    // Hatalı giriş
    if (!attendance.checkInAt || !attendance.checkOutAt) {
      return {
        label: "H",
        className: "bg-gray-500 text-white",
        workedHours: 0,
      };
    }

    const worked = calcHours(
      attendance.checkInAt.toDate(),
      attendance.checkOutAt.toDate(),
    );

    const shiftHours =
      attendance.shiftStart && attendance.shiftEnd
        ? calcShiftHours(attendance.shiftStart, attendance.shiftEnd)
        : 9;

    // Eksik
    if (worked < shiftHours - 0.5) {
      return {
        label: worked.toFixed(1),
        className: "bg-red-500 text-white",
        workedHours: worked,
      };
    }

    // Fazla
    if (worked > shiftHours + 0.5) {
      return {
        label: worked.toFixed(1),
        className: "bg-blue-500 text-white",
        workedHours: worked,
      };
    }

    // Normal
    return {
      label: worked.toFixed(1),
      className: "bg-green-500 text-white",
      workedHours: worked,
    };
  }

  return (
    <div className="p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {date.toLocaleString("tr-TR", {
              month: "long",
              year: "numeric",
            })}{" "}
            Aylık Rapor
          </h2>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={16} />}
              onClick={() =>
                setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
              }
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() =>
                setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
              }
            />
          </div>
        </div>

        <Legend />

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="min-w-full text-xs text-center">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Ad Soyad</th>
                {Array.from({ length: days }).map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
                <th>Toplam</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, index) => {
                let total = 0;

                return (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-left">
                      {String(index + 1).padStart(4, "0")}
                    </td>

                    <td className="p-3 text-left font-medium whitespace-nowrap">
                      {u.name}
                    </td>

                    {Array.from({ length: days }).map((_, dayIndex) => {
                      const currentDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        dayIndex + 1,
                      );

                      const result = getDayStatus(currentDate, u.id);
                      total += result.workedHours;

                      return (
                        <td
                          key={dayIndex}
                          className={`text-[10px] ${result.className}`}
                        >
                          {result.label}
                        </td>
                      );
                    })}

                    <td className="font-semibold">{total.toFixed(1)} sa</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* ----------------- LEGEND COMPONENT ---------------- */
/* -------------------------------------------------- */

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-3 h-3 rounded ${color}`} />
      {label}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4">
      <LegendItem color="bg-green-500" label="Çalıştığı günler" />
      <LegendItem color="bg-gray-100" label="Çalışmadığı günler" />
      <LegendItem color="bg-red-500" label="Eksik çalışma" />
      <LegendItem color="bg-blue-500" label="Fazla çalışma" />
      <LegendItem color="bg-amber-300" label="Hafta Tatili" />
      <LegendItem color="bg-orange-400" label="İzin ve Raporlar" />
      <LegendItem color="bg-yellow-400" label="Resmi Tatil" />
      <LegendItem color="bg-gray-500" label="Hata ve Uyarı" />
    </div>
  );
}
