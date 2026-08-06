import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZODA Campaign Dashboard",
  description: "Internal campaign performance dashboard for ZODA.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
