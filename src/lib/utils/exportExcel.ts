"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ExportParams } from "@/features/reports/reports.types";

export async function exportMonthlyExcel({
  users,
  date,
  getDayStatus,
}: ExportParams) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Aylık Rapor");

  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const header: (string | number)[] = ["#", "Ad Soyad"];
  for (let i = 1; i <= days; i++) header.push(i);
  header.push("Toplam");

  const headerRow = sheet.addRow(header);
  headerRow.font = { bold: true };

  users.forEach((u, index) => {
    let total = 0;

    const rowData: (string | number)[] = [index + 1, u.name];
    const colors: (string | null)[] = [];

    for (let i = 1; i <= days; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);

      const result = getDayStatus(currentDate, u.id);

      rowData.push(result.label);
      total += result.workedHours;

      let color: string | null = null;

      if (result.className.includes("green")) color = "FF22C55E";
      else if (result.className.includes("red")) color = "FFEF4444";
      else if (result.className.includes("blue")) color = "FF3B82F6";
      else if (result.className.includes("orange")) color = "FFF97316";
      else if (result.className.includes("yellow")) color = "FFEAB308";
      else if (result.className.includes("gray-500")) color = "FF6B7280";
      else if (result.className.includes("amber")) color = "FFF59E0B";

      colors.push(color);
    }

    rowData.push(Number(total.toFixed(1)));

    const row = sheet.addRow(rowData);

    colors.forEach((c, i) => {
      if (!c) return;

      const cell = row.getCell(i + 3);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: c },
      };

      cell.font = { color: { argb: "FFFFFFFF" } };
    });
  });

  sheet.columns.forEach((col, i) => {
    col.width = i === 1 ? 25 : 10;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `mesaitak-${date.getFullYear()}-${date.getMonth() + 1}.xlsx`,
  );
}
