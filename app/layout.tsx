import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Printer",
  description: "Ding om dingen te printen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
