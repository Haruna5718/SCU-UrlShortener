import "./globals.css";

export const metadata = {
  title: "Shortly · URL Shortener",
  description: "짧은 링크 만들기",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
