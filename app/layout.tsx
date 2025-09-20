import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientPageWrapper } from "./components/ClientPageWrapper";
import { MaintenanceChecker } from "./components/MaintenanceChecker";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CBRC - Coiffeur by Rabia Cayli",
  description: "Professional hair salon services",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  
  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  return (
    <html lang="de">
      <body className={inter.className}>
        {isAdminRoute ? (
          children
        ) : (
          <MaintenanceChecker>
            <ClientPageWrapper>
              {children}
            </ClientPageWrapper>
          </MaintenanceChecker>
        )}
      </body>
    </html>
  );
}