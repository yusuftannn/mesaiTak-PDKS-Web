"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth } from "@/lib/firebase";
import { mapFirebaseError } from "@/lib/auth/firebaseError";
import { useToastStore } from "@/lib/ui/toast.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { getEmailByUsername } from "@/features/auth/auth.service";

import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();

  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const authError = useAuthStore((s) => s.authError);
  const setAuthError = useAuthStore((s) => s.setAuthError);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initializing && user) {
      showToast({
        type: "success",
        title: "Giriş Başarılı",
        message: "Başarıyla giriş yapıldı.",
      });
      router.replace("/dashboard");
    }
  }, [user, initializing, router, showToast]);

  useEffect(() => {
    if (authError === "unauthorized") {
      showToast({
        type: "error",
        title: "Yetkisiz erişim",
        message: "Bu panele sadece yöneticiler giriş yapabilir.",
      });

      setAuthError(null);
    }
  }, [authError, showToast, setAuthError]);

  const isEmail = (value: string) => value.includes("@");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      showToast({
        type: "error",
        title: "Eksik Bilgi",
        message: "Email/Username ve şifre zorunludur.",
      });
      return;
    }

    setLoading(true);

    try {
      let emailToUse = identifier;

      if (!isEmail(identifier)) {
        const foundEmail = await getEmailByUsername(identifier);

        if (!foundEmail) {
          showToast({
            type: "error",
            title: "Kullanıcı bulunamadı",
            message: "Böyle bir kullanıcı adı yok.",
          });
          return;
        }

        emailToUse = foundEmail;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        showToast({
          type: "error",
          title: "Giriş başarısız",
          message: mapFirebaseError(err.code),
        });
      } else {
        showToast({
          type: "error",
          title: "Beklenmeyen hata",
          message: "Lütfen tekrar deneyin.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={onLogin}
          className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 space-y-6 transition-all"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              MesaiTak
            </h1>
            <p className="text-sm text-gray-500">
              Hesabınıza giriş yapın
            </p>
          </div>

          <div className="space-y-4">
            <input
              className="w-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-xl px-4 py-3 text-sm transition"
              placeholder="E-posta veya kullanıcı adı"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <input
              className="w-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-xl px-4 py-3 text-sm transition"
              placeholder="Şifreniz"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            className="rounded-xl h-12 text-sm font-medium"
          >
            {loading ? "Oturum açılıyor…" : "Giriş Yap"}
          </Button>

          <div className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MesaiTak
          </div>
        </form>
      </div>
    </div>
  );
}