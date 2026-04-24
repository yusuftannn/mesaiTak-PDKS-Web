"use client";

import { FormEvent, useEffect, useState } from "react";
import { Megaphone, Pencil, Send, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToastStore } from "@/lib/ui/toast.store";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "@/features/announcements/announcements.service";
import { Announcement } from "@/features/announcements/announcements.types";
import { confirm } from "@/components/ui/Confirm";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AnnouncementsPage() {
  const showToast = useToastStore((s) => s.showToast);
  const currentUser = useAuthStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshAnnouncements = async () => {
    const data = await listAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await listAnnouncements();
        if (!mounted) return;
        setAnnouncements(data);
      } catch (error) {
        console.error(error);
        showToast({
          type: "error",
          title: "Veri Hatası",
          message: "Duyurular yüklenemedi.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Lütfen başlık ve metin alanlarını doldurun.",
      });
      return;
    }

    try {
      setSending(true);

      if (editingId) {
        await updateAnnouncement(editingId, {
          title: cleanTitle,
          message: cleanMessage,
        });

        showToast({
          type: "success",
          title: "Duyuru Güncellendi",
          message: "Duyuru başarıyla güncellendi.",
        });
      } else {
        await createAnnouncement({
          title: cleanTitle,
          message: cleanMessage,
          createdByUid: currentUser?.uid ?? null,
          createdByName: currentUser?.name ?? currentUser?.userName ?? null,
        });

        showToast({
          type: "success",
          title: "Duyuru Kaydedildi",
          message: "Duyuru Firestore koleksiyonuna eklendi.",
        });
      }

      await refreshAnnouncements();
      resetForm();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Kayıt Hatası",
        message: "Duyuru kaydedilirken bir hata oluştu.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
  };

  const handleDelete = (announcement: Announcement) => {
    confirm({
      title: "Duyuru silinsin mi?",
      description: `"${announcement.title}" başlıklı duyuru kalıcı olarak silinecek.`,
      confirmText: "Sil",
      cancelText: "Vazgeç",
      variant: "danger",
      onConfirm: async () => {
        await deleteAnnouncement(announcement.id);

        if (editingId === announcement.id) {
          resetForm();
        }

        await refreshAnnouncements();

        showToast({
          type: "success",
          title: "Duyuru Silindi",
          message: "Duyuru kalıcı olarak silindi.",
        });
      },
    });
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Toplu Duyuru</h1>
            <p className="mt-2 text-sm text-gray-500">
              Mobil uygulamada kullanılmak üzere başlık ve metin içeren
              duyurular oluşturun.
            </p>
          </div>

          <div className="hidden rounded-2xl border bg-gray-50 p-4 text-gray-600 md:block">
            <Megaphone size={28} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">
                  {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru"}
                </div>
                <div className="text-sm text-gray-500">
                  {editingId
                    ? "Seçili duyuruda başlık ve metni güncelleyebilirsiniz."
                    : "Mobil uygulamada kullanılacak yeni bir duyuru oluşturun."}
                </div>
              </div>

              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<X size={14} />}
                  onClick={resetForm}
                >
                  İptal
                </Button>
              )}
            </div>

            <div>
              <label
                htmlFor="announcement-title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Başlık
              </label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Duyuru başlığını yazın"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black"
                maxLength={120}
              />
            </div>

            <div>
              <label
                htmlFor="announcement-message"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Metin
              </label>
              <textarea
                id="announcement-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Duyuru içeriğini yazın"
                className="min-h-65 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <div className="text-xs text-gray-500">
                Başlık: {title.trim().length}/120
              </div>

              <Button
                type="submit"
                loading={sending}
                className="min-w-42.5"
                icon={<Send size={16} />}
              >
                {editingId ? "Güncellemeyi Kaydet" : "Duyuruyu Kaydet"}
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border bg-gray-50 p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">
              Anlık Önizleme
            </div>

            <div className="mt-4 rounded-2xl border bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Başlık
              </div>
              <div className="mt-1 text-base font-semibold text-gray-900">
                {title.trim() || "Henüz başlık girilmedi"}
              </div>

              <div className="mt-4 text-xs uppercase tracking-wide text-gray-500">
                Metin
              </div>
              <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {message.trim() || "Henüz duyuru metni girilmedi"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Kaydedilen Duyurular
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Duyurular yükleniyor...</div>
          ) : announcements.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              Henüz kaydedilmiş duyuru bulunmuyor.
            </div>
          ) : (
            <div className="divide-y">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="space-y-3 px-6 py-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {announcement.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Oluşturan: {announcement.createdByName ?? "Sistem"}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatDate(announcement.updatedAt ?? announcement.createdAt)}
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {announcement.message}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      icon={<Pencil size={14} />}
                      onClick={() => handleEdit(announcement)}
                    >
                      Düzenle
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDelete(announcement)}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
