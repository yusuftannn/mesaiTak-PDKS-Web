"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToastStore } from "@/lib/ui/toast.store";

export default function RegisterPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Tüm alanları doldurun.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      try {
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          name,
          email,
          phone: null,
          role: "manager",
          companyId: null,
          branchId: null,
          country: "Turkiye",
          status: "active",
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        await auth.signOut();
        throw firestoreErr;
      }

      showToast({
        type: "success",
        title: "Kayıt Başarılı",
        message: "Başarıyla kayıt yapıldı.",
      });

      router.replace("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={onRegister}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8 space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center">
          Yönetici Hesabı Oluştur
        </h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Kayıt Ol"}
        </Button>
      </form>
    </div>
  );
}
