import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "راهنمای انتخاب لپ‌تاپ استوک",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
