import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArchiGold Terminal v2",
  description: "Portfolio Data Analyst Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning ditambahkan untuk mencegah error akibat ekstensi browser
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#020617] text-slate-100`}>
        <div className="flex min-h-screen">
          {/* Sidebar navigasi utama */}
          <Sidebar />
          
          {/* Area Konten Utama */}
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}