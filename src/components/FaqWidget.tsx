"use client";

import { useState } from "react";
import { MessageCircle, X, ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Mesai nasıl oluşturulur?",
    answer:
      "Yönetici panelinden Mesailer sayfasına giderek yeni mesai kaydı oluşturabilirsiniz.",
  },
  {
    question: "Personel nasıl eklenir?",
    answer:
      "Yönetim panelindeki Personeller bölümünden yeni personel ekleyebilirsiniz.",
  },
  {
    question: "Mesai talepleri nasıl onaylanır?",
    answer:
      "Talepler ekranından bekleyen talepleri görüntüleyip onaylayabilirsiniz.",
  },
  {
    question: "Şifremi unuttum ne yapmalıyım?",
    answer:
      "Giriş ekranındaki Şifremi Unuttum bağlantısını kullanabilirsiniz.",
  },
];

export default function FaqWidget() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed
          bottom-6
          right-6
          z-999
          w-12
          h-12
          rounded-full
          bg-blue-600
          text-white
          shadow-lg
          flex
          items-center
          justify-center
          hover:scale-105
          transition
        "
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          className="
            fixed
            bottom-24
            right-6
            z-999
            w-95
            max-w-[calc(100vw-32px)]
            bg-white
            rounded-2xl
            shadow-2xl
            border
            overflow-hidden
          "
        >
          <div className="bg-blue-600 text-white px-5 py-4">
            <h3 className="font-semibold">
              Yardım Merkezi
            </h3>

            <p className="text-sm opacity-90">
              Sık sorulan sorular
            </p>
          </div>

          <div className="max-h-125 overflow-y-auto">
            {FAQS.map((item, index) => (
              <div
                key={index}
                className="border-b"
              >
                <button
                  onClick={() =>
                    setActive(
                      active === index
                        ? null
                        : index
                    )
                  }
                  className="
                    w-full
                    px-4
                    py-4
                    flex
                    items-center
                    justify-between
                    text-left
                    hover:bg-gray-50
                  "
                >
                  <span className="font-medium">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={18}
                    className={
                      active === index
                        ? "rotate-180 transition"
                        : "transition"
                    }
                  />
                </button>

                {active === index && (
                  <div className="px-4 pb-4 text-sm text-gray-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 text-xs text-gray-500">
            Sorunuzun cevabını bulamadınız mı?
            <br />
            Destek ekibiyle iletişime geçebilirsiniz.
          </div>
        </div>
      )}
    </>
  );
}