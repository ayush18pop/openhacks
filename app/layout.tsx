import { Metadata } from "next";
import Navbar from "../components/landing/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastProvider } from "../components/retroui/Toast";

// --- Font Definitions ---
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Metadata (Important for SEO) ---
export const metadata = {
  title: "OpenHacks - Your Hackathon Platform",
  description: "Create and join hackathons seamlessly.",
};

// --- Root Layout Component ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider should wrap the <html> tag for full app context
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} ${space.variable} antialiased`}>
          {/* QueryProvider and others go INSIDE the body */}
          <QueryProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}