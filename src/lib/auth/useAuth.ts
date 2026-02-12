"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuthStore, AuthUserDoc } from "@/lib/auth/auth.store";

export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const setAuthError = useAuthStore((s) => s.setAuthError);

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
          await auth.signOut();
          setUser(null);
          return;
        }

        const data = snap.data() as Omit<AuthUserDoc, "uid" | "email">;

        if (data.role !== "manager") {
          setAuthError("unauthorized");
          await auth.signOut();
          setUser(null);
          return;
        }

        if (data.status !== "active") {
          await auth.signOut();
          setUser(null);
          return;
        }

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
  }, [setUser, setInitializing, setAuthError]);
}
