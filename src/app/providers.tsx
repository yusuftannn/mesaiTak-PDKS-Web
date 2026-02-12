"use client";

import { useAuthBootstrap } from "@/lib/auth/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();

  return <>{children}</>;
}
