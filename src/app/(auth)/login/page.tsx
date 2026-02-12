"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth } from "@/lib/firebase";
import { mapFirebaseError } from "@/lib/auth/firebaseError";
import { useToastStore } from "@/lib/ui/toast.store";
import { useAuthStore } from "@/lib/auth/auth.store";

export default function LoginPage() {
  const router = useRouter();

  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const authError = useAuthStore((s) => s.authError);
  const setAuthError = useAuthStore((s) => s.setAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initializing && user) {
      router.replace("/dashboard");
    }
  }, [user, initializing, router]);

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

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast({
        type: "error",
        title: "Eksik Bilgi",
        message: "Email ve şifre zorunludur.",
      });
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        <h1 className="text-xl font-semibold text-center">
          MesaiTak Manager Login
        </h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg p-3 disabled:opacity-60"
        >
          {loading ? "Oturum açılıyor…" : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
