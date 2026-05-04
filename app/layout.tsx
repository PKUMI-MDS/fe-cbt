import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAT/CBT TOAFL - Platform Ujian Online",
  description:
    "Simulasi end-to-end platform ujian CAT/CBT TOAFL dan TOEFL untuk presentasi client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
