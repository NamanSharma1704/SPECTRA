import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FaviconAnimator } from "@/components/layout/FaviconAnimator";

const equinox = localFont({
  src: [
    {
      path: "./fonts/Equinox Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Equinox Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-equinox",
});

const deltha = localFont({
  src: "./fonts/Deltha.ttf",
  variable: "--font-deltha",
});

export const metadata: Metadata = {
  title: "SPECTRA | Meta Intelligence Platform",
  description: "Advanced Division 2 meta-analysis platform and tactical command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${equinox.variable} ${deltha.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className={`min-h-full flex flex-col bg-background font-sans`}>
        <FaviconAnimator />
        {children}
      </body>
    </html>
  );
}
