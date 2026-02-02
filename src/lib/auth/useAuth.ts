// src/lib/auth/useAuth.ts
"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthStore, AuthUserDoc } from "@/lib/auth/auth.store";

export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }

        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // Kullanıcı Auth var ama Firestore user doc yok → güvenlik için çıkış yaptıracağız.
          setUser(null);
          await auth.signOut();
          return;
        }
        const data = snap.data() as Omit<AuthUserDoc, "uid" | "email">;

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          ...data,
        });
      } finally {
        setInitializing(false);
      }
    });

    return () => unsub();
  }, [setUser, setInitializing]);
}
