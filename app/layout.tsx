import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyPorto — Portofolio Praktis dan Mudah Dibagikan",
  description: "Buat portofolio online sederhana untuk menampilkan proyek, pengalaman, dan perjalanan profesionalmu. Bagikan dengan satu tautan.",
  verification : {
    google: "7feoSet_bBh3tPsyrc3rt6_PfSU1keiHDQiqheFNHso",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${fontSans.variable} ${fontMono.variable} antialiased text-gray-900 dark:bg-gray-800`}>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex w-full flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
