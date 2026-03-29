import { useAuthStore } from "@/features/auth/auth.store";

export function getCompanyId(): string {
  const user = useAuthStore.getState().user;

  if (!user) {
    throw new Error("User bulunamadı");
  }

  if (user.role === "manager") {
    return ""; 
  }

  if (!user.companyId) {
    throw new Error("CompanyId bulunamadı");
  }

  return user.companyId;
}
