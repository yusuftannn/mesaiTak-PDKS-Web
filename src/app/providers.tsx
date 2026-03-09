"use client";

import { useAuthBootstrap } from "@/features/auth/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();

  return <>{children}</>;
}
