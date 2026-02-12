export function mapFirebaseError(code: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Geçersiz email formatı.";
    case "auth/user-not-found":
      return "Bu email ile kayıtlı kullanıcı bulunamadı.";
    case "auth/wrong-password":
      return "Şifre yanlış.";
    case "auth/invalid-credential":
      return "Email veya şifre hatalı.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.";
    case "auth/network-request-failed":
      return "İnternet bağlantısı hatası.";
    default:
      return "Giriş sırasında bir hata oluştu.";
  }
}
