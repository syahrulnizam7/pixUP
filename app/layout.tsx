import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PixUp - Image Enhancer",
    template: "%s | PixUp",
  },
  description:
    "Transform your ordinary photos into stunning visuals with PixUp advanced image enhancement technology.",
  keywords: [
    "AI image enhancer",
    "photo quality improvement",
    "image upscaler",
    "photo enhancer",
    "AI photo editor",
  ],
  openGraph: {
    title: "PixUp - AI Image Enhancer",
    description:
      "Transform your ordinary photos into stunning visuals with PixUp AI",
    url: "pixup.alangkun.my.id",
    siteName: "PixUp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PixUp AI Image Enhancer",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixUp - AI Image Enhancer",
    description:
      "Transform your ordinary photos into stunning visuals with PixUp AI",
    images: ["/twitter-image.jpg"],
    creator: "@Alangni",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
