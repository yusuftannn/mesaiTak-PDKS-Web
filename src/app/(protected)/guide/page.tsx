import {
  BookOpenText,
  CalendarCheck,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";

const quickStart = [
  "Dashboard ekranından günlük durumu ve personel hareketlerini izleyin.",
  "Şubeler ve vardiyaları tanımlayarak sistemin temel yapısını tamamlayın.",
  "Kullanıcılar sayfasından personelleri ekleyip ilgili şube ve vardiyaya bağlayın.",
  "İzin talepleri, şüpheli işlemler ve konum ekranlarından operasyonu takip edin.",
];

const sections = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    description: "Bugüne ait özet istatistikleri ve hızlı durum takibini sunar.",
    items: [
      "İşe gelen, geç kalan, molada olan ve devamsız personeli anlık görün.",
      "Kartların altındaki personel listeleriyle hangi kullanıcının hangi durumda olduğunu kontrol edin.",
    ],
  },
  {
    title: "Şubeler ve Konumlar",
    icon: MapPin,
    description:
      "Lokasyon yapısını oluşturur ve personel hareketlerini konum bazlı izlemeyi sağlar.",
    items: [
      "Şubeler ekranından iş yeri noktalarını tanımlayın.",
      "Konumlar menüsündeki harita ve liste görünümleriyle kayıtları detaylı inceleyin.",
    ],
  },
  {
    title: "Kullanıcılar",
    icon: Users,
    description:
      "Personel kayıtlarını oluşturma, düzenleme ve yetkilendirme alanıdır.",
    items: [
      "Yeni personel eklerken şube, vardiya ve temel kimlik bilgilerini eksiksiz girin.",
      "Güncelleme yaparken aktif durum ve rol bilgisini kontrol ederek veri tutarlılığını koruyun.",
    ],
  },
  {
    title: "Vardiya ve İzin",
    icon: Clock,
    description: "Çalışma düzeni ile izin yönetimini aynı operasyonda toplar.",
    items: [
      "Vardiya ekranından başlangıç, bitiş ve mola kurallarını tanımlayın.",
      "İzin Talepleri ekranında bekleyen talepleri onaylayıp reddedebilir, filtrelerle hızlı arama yapabilirsiniz.",
    ],
  },
  {
    title: "Şüpheli İşlemler",
    icon: ShieldAlert,
    description:
      "Sistem tarafından riskli görülen hareketlerin kontrol merkezidir.",
    items: [
      "Olağandışı saatler, uyumsuz hareketler veya konum farklılıklarını buradan inceleyin.",
      "Kaydı değerlendirirken kullanıcı, zaman ve olay ayrıntısını birlikte yorumlayın.",
    ],
  },
  {
    title: "Raporlar ve Etiketler",
    icon: FileText,
    description:
      "Analiz, denetim ve toplu yönetim süreçlerinde kullanılan alanları özetler.",
    items: [
      "Aylık Rapor ve Detaylı Puantaj ekranlarından kontrol ve dışa aktarım işlemlerini yürütün.",
      "Grup etiketleriyle belirli personel kümelerini sınıflandırarak toplu yönetimi kolaylaştırın.",
    ],
  },
];

const tips = [
  {
    title: "Kuruluma şubelerden başlayın",
    text: "Personel ve vardiya tanımlarından önce şube yapısını netleştirmek veri girişini hızlandırır.",
  },
  {
    title: "Filtreleri aktif kullanın",
    text: "İzinler, raporlar ve şüpheli işlemler ekranında arama ve filtreleme ile yoğun listeleri daha rahat yönetebilirsiniz.",
  },
  {
    title: "Rapor öncesi veri kontrolü yapın",
    text: "Doğru sonuç almak için vardiya, kullanıcı ve grup etiketlerinin güncel olduğundan emin olun.",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-black p-3 text-white">
            <BookOpenText size={24} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Kullanım Kılavuzu
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-gray-600">
              Bu ekran, MesaiTak panelindeki temel bölümleri hızlıca tanımanız
              ve günlük kullanım akışınızı netleştirmeniz için hazırlandı.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <ClipboardList className="text-gray-700" size={20} />
            <h2 className="text-lg font-semibold">Hızlı Başlangıç</h2>
          </div>

          <div className="space-y-3">
            {quickStart.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <CalendarCheck className="text-gray-700" size={20} />
            <h2 className="text-lg font-semibold">İyi Kullanım Notları</h2>
          </div>

          <div className="space-y-4">
            {tips.map((tip) => (
              <div key={tip.title} className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {tip.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gray-100 p-2 text-gray-800">
                  <Icon size={18} />
                </div>
                <h2 className="text-base font-semibold">{section.title}</h2>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                {section.description}
              </p>

              <div className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
