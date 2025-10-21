import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from '@/components/ClientSessionProvider'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CDLP Linesheet Generator",
  description: "Generate professional wholesale linesheets from your Shopify products",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}
