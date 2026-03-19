"use client";

import { ExportParams } from "@/features/reports/reports.types";

export async function exportMonthlyPdf({
  users,
  date,
  getDayStatus,
}: ExportParams) {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  const pdfMake: any = pdfMakeModule.default || pdfMakeModule;

  // 🔥 kritik fix (tüm varyasyonları handle eder)
  const vfs =
    (pdfFontsModule as any).default?.vfs ||
    (pdfFontsModule as any).default?.pdfMake?.vfs ||
    (pdfFontsModule as any).pdfMake?.vfs;

  if (!vfs) {
    console.error("pdfmake vfs bulunamadı", pdfFontsModule);
    throw new Error("PDF font yüklenemedi");
  }

  pdfMake.vfs = vfs;

  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const header: (string | number)[] = [
    "#",
    "Ad Soyad",
    ...Array.from({ length: days }, (_, i) => i + 1),
    "Toplam",
  ];

  const body: (string | number)[][] = [header];

  users.forEach((u, index) => {
    let total = 0;

    const row: (string | number)[] = [index + 1, u.name];

    for (let i = 1; i <= days; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);

      const result = getDayStatus(currentDate, u.id);

      row.push(result.label);
      total += result.workedHours;
    }

    row.push(Number(total.toFixed(1)));
    body.push(row);
  });

  const docDefinition = {
    pageOrientation: "landscape" as const,
    content: [
      { text: "MesaiTak Aylık Rapor", style: "header" },
      {
        text: date.toLocaleString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      {
        table: {
          headerRows: 1,
          body,
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
    },
    defaultStyle: { fontSize: 7 },
  };

  pdfMake
    .createPdf(docDefinition)
    .download(`mesaitak-${date.getFullYear()}-${date.getMonth() + 1}.pdf`);
}
