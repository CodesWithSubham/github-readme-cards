import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub README Cards — Beautiful Profile Cards",
  description:
    "Generate beautiful, dynamic, and self-hostable GitHub profile cards. Stats, Streaks, Languages, Repos and more.",
  keywords: ["github", "readme", "cards", "stats", "profile", "open-source"],
  openGraph: {
    title: "GitHub README Cards",
    description: "Beautiful, dynamic GitHub profile cards for your README",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="px-5 pt-20 pb-5">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
