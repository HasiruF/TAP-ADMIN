import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Cormorant_Garamond, Inter } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: "TAP Admin",
  description: "TAP Administration Dashboard",
  icons: {
    icon: "/primary.svg",
  },
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${cormorant.variable} ${inter.variable} min-h-full flex flex-col`}>{children}</body>
      
    </html>
  );
}
