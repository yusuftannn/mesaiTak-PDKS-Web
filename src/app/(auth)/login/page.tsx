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
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onLogin}
        className="w-full max-w-sm border rounded-xl p-6 space-y-4 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">MesaiTak Login</h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="E-posta veya kullanıcı adı"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Şifreniz"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? "Oturum açılıyor…" : "Giriş Yap"}
        </Button>
      </form>
    </div>
  );
}
