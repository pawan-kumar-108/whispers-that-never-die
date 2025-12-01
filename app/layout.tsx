import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Echoes of Forgotten Whispers",
  description: "A living dream chamber where your feelings never truly vanish — they decay, distort, and return as haunted whispers.",
  keywords: ["memory", "emotions", "AI", "art", "interactive"],
  authors: [{ name: "Dreamware Hack Team" }],
  openGraph: {
    title: "Echoes of Forgotten Whispers",
    description: "Where memories become eternal, living dreams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
