"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useToastStore } from "@/lib/ui/toast.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { ExternalLink } from "lucide-react";
import { useBranchesStore } from "@/features/branches/branches.store";
import { QRCodeCanvas } from "qrcode.react";
import { createRoot } from "react-dom/client";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import MapModal from "@/components/maps/MapModal";
import { confirm } from "@/components/ui/Confirm";

export default function BranchesPage() {
  const showToast = useToastStore((s) => s.showToast);

  const companyId = useAuthStore((s) => s.user?.companyId);

  const {
    branches,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    loading,
  } = useBranchesStore();

  const [branchName, setBranchName] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const onCreate = async () => {
    if (!branchName.trim() || !companyId) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Şube adı boş olamaz.",
      });
      return;
    }
    if (!selectedLocation) {
      showToast({
        type: "info",
        title: "Konum seç",
      });
      return;
    }

    try {
      await createBranch(
        branchName,
        selectedLocation.lat,
        selectedLocation.lng,
      );
      setBranchName("");

      showToast({
        type: "success",
        title: "Şube Oluşturuldu",
      });
    } catch (error) {
      console.log("createBranch error:", error);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şube eklenemedi",
      });
    }
  };

  const onRemove = (branchId: string, branchName: string) => {
    confirm({
      title: "Şube silinsin mi?",
      description: `"${branchName}" şubesi kalıcı olarak silinecek.`,
      confirmText: "Sil",
      cancelText: "Vazgeç",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteBranch(branchId);

          showToast({
            type: "success",
            title: "Şube Silindi",
          });
        } catch {
          showToast({
            type: "error",
            title: "Hata",
            message: "Silme başarısız",
          });
        }
      },
    });
  };

  const onUpdate = async (branchId: string) => {
    if (!editingName.trim()) return;

    try {
      await updateBranch(branchId, editingName.trim());

      setEditingId(null);
      setEditingName("");

      showToast({
        type: "success",
        title: "Güncellendi",
      });
    } catch {
      showToast({
        type: "error",
        title: "Hata",
        message: "Güncellenemedi",
      });
    }
  };

  const filtered = branches
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );

  const downloadQR = (canvas: HTMLCanvasElement | null, name: string) => {
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}-qr.png`;
    link.click();
  };

  const generateQRBase64 = (value: string): Promise<string> => {
    return new Promise((resolve) => {
      const rootEl = document.createElement("div");
      document.body.appendChild(rootEl);

      const root = createRoot(rootEl);

      root.render(<QRCodeCanvas value={value} size={512} includeMargin />);

      setTimeout(() => {
        const qrCanvas = rootEl.querySelector("canvas") as HTMLCanvasElement;

        const base64 = qrCanvas.toDataURL("image/png");

        root.unmount();
        document.body.removeChild(rootEl);

        resolve(base64);
      }, 200);
    });
  };

  const downloadQRPoster = async (qrValue: string, name: string) => {
    const base64 = await generateQRBase64(qrValue);

    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;

    pdfMake.vfs = pdfFonts.vfs;

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      content: [
        {
          text: "MesaiTak Check-in",
          alignment: "center",
          margin: [0, 20, 0, 20],
          fontSize: 20,
          bold: true,
        },
        {
          image: base64,
          width: 300,
          alignment: "center",
          margin: [0, 10, 0, 20],
        },
        {
          text: name,
          alignment: "center",
          fontSize: 14,
        },
      ],
    };

    pdfMake.createPdf(docDefinition).download(`${name}-qr-poster.pdf`);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6">Şubeler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700">Yeni Şube</h3>

          <input
            className="w-full border rounded-lg px-4 py-2 text-sm"
            placeholder="Şube adı"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
          {selectedLocation && (
            <div className="text-xs text-green-600">
              Seçildi: {selectedLocation.lat.toFixed(5)},{" "}
              {selectedLocation.lng.toFixed(5)}
            </div>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setMapOpen(true)}
          >
            Konum Seç
          </Button>

          <Button fullWidth onClick={onCreate}>
            Şube Ekle
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <input
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 rounded-lg text-sm flex-1"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setSortOrder("asc");
              }}
            >
              Temizle
            </Button>

            <div className="text-xs text-gray-500">{filtered.length}</div>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Yükleniyor…</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-sm text-gray-500">
              Eklenmiş Şube bulunmamaktadır.
            </div>
          ) : (
            <div className="bg-white border rounded-xl divide-y">
              {filtered.map((b) => (
                <div
                  key={b.branchId}
                  className="p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      {editingId === b.branchId ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border px-3 py-1 rounded-lg text-sm w-full"
                        />
                      ) : (
                        <div className="flex items-center gap-4">
                          <QRCodeCanvas
                            value={b.qrValue}
                            size={32}
                            ref={(el) => {
                              qrRefs.current[b.branchId] = el;
                            }}
                          />
                          <div className="font-medium">{b.name}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() =>
                        downloadQR(qrRefs.current[b.branchId], b.name)
                      }
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="PNG indir"
                    >
                      <Image
                        src="/icons/png-icon.png"
                        alt="png"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </button>

                    <button
                      onClick={() => downloadQRPoster(b.qrValue, b.name)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="PDF indir"
                    >
                      <Image
                        src="/icons/pdf-icon.png"
                        alt="pdf"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </button>

                    <a
                      href={b.qrValue}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Check-in sayfasına git"
                    >
                      <ExternalLink size={18} />
                    </a>

                    {editingId === b.branchId ? (
                      <>
                        <Button size="sm" onClick={() => onUpdate(b.branchId)}>
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          İptal
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(b.branchId);
                            setEditingName(b.name);
                          }}
                        >
                          Düzenle
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onRemove(b.branchId, b.name)}
                        >
                          Sil
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSave={(lat, lng) => {
          setSelectedLocation({ lat, lng });
        }}
      />
    </div>
  );
}
