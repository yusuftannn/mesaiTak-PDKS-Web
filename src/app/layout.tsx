import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toast from "@/components/ui/Toast";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MesaiTak - Personel Mesai Takip Sistemi",
  description:
    "MesaiTak, personel mesai takibi için geliştirilmiş bir sistemdir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Providers>
          <Toast />
          {children}
        </Providers>
      </body>
    </html>
  );
}
