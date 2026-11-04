import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortly — URL Shortener",
  description: "긴 링크를 간단한 주소로 바꿔보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
