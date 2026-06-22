import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
      className={`${inter.variable} ${robotoMono.variable} ${equinox.variable} ${deltha.variable} h-full antialiased dark`}
    >
      <body className={`min-h-full flex flex-col bg-background font-sans`}>
        {children}
      </body>
    </html>
  );
}
