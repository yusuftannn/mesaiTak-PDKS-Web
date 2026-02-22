"use client";

interface LegendRowProps {
  code: string;
  text: string;
}

function LegendRow({ code, text }: LegendRowProps) {
  return (
    <tr>
      <td className="border px-3 py-2 font-semibold w-24">{code}</td>
      <td className="border px-3 py-2">{text}</td>
    </tr>
  );
}

export default function LegendTable() {
  return (
    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border mt-6">

      <div>
        <h3 className="font-semibold mb-3 text-gray-700">
          Süre Hesaplamaları
        </h3>

        <table className="w-full text-sm border">
          <tbody>
            <LegendRow code="TÇ" text="Toplam Çalışma (Beklenen)" />
            <LegendRow code="NM" text="Normal Mesai (Beklenen)" />
            <LegendRow code="TÇ" text="Toplam Çalışma" />
            <LegendRow code="NM" text="Normal Mesai" />
            <LegendRow code="FM" text="Fazla Mesai" />
            <LegendRow code="FM (RT)" text="Fazla Mesai (Resmi Tatilde)" />
            <LegendRow code="EM" text="Eksik Mesai" />
            <LegendRow code="DZ" text="Devamsız" />
            <LegendRow code="HT" text="Hafta Tatili" />
            <LegendRow code="RT" text="Resmi Tatil" />
            <LegendRow code="Yİ" text="Yıllık İzin" />
            <LegendRow code="MZ" text="Mazeret ve Diğer" />
            <LegendRow code="R" text="Raporlu" />
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-gray-700">
          Gün Hesaplamaları
        </h3>

        <table className="w-full text-sm border">
          <tbody>
            <LegendRow code="ÇG" text="Çalışma Günü (Beklenen)" />
            <LegendRow code="TÇ" text="Toplam Çalışma (Beklenen)" />
            <LegendRow code="NM" text="Normal Mesai (Beklenen)" />
            <LegendRow code="TÇ" text="Toplam Çalışma" />
            <LegendRow code="NM" text="Normal Mesai" />
            <LegendRow code="DZ" text="Devamsız" />
            <LegendRow code="HT" text="Hafta Tatili" />
            <LegendRow code="RT" text="Resmi Tatil" />
            <LegendRow code="Yİ" text="Yıllık İzin" />
            <LegendRow code="MZ" text="Mazeret ve Diğer" />
            <LegendRow code="Üİ" text="Ücretsiz İzin" />
            <LegendRow code="R" text="Raporlu" />
          </tbody>
        </table>
      </div>

    </div>
  );
}