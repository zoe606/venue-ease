import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venue Ease - Find & Book Venues",
  description: "Find and book the perfect venue for your team offsite or corporate event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Venue Ease
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
