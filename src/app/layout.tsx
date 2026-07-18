import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Toast from "@/components/ui/Toast";
import Providers from "./providers";
import { ConfirmDialog } from "@/components/ui/Confirm";
import FaqWidget from "@/components/FaqWidget";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <Toast />
          <ConfirmDialog />
          <FaqWidget />
          {children}
        </Providers>
      </body>
    </html>
  );
}
