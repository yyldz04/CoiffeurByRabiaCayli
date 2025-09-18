import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coiffeur by Rabia Cayli",
  description: "Dein Coiffeur in Vorarlberg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
