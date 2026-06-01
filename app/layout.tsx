import type { Metadata } from "next";
import { Inter, Jersey_10 } from "next/font/google";
import { Patrick_Hand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "../lib/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-playwrite",
  weight: "400",
  display: "swap",
});
const jersey = Jersey_10({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight:"400",
  display:"swap",
});

export const metadata: Metadata = {
  title: "Bitto Saha - Portfolio",
  description:
    "Undergraduate Computer Science student with expertise in programming.",
  keywords: [
    "Bitto Saha",
    "Portfolio",
    "Computer Science Student",
    "a.k.a idcnys",
  ],
  authors: [{ name: "Bitto Saha", url: "https://ibitto.vercel.app" }],
  icons: {
    icon: "/avatar.png",
    shortcut: "/avatar.png",
    apple: "/avatar.png",
  },
  openGraph: {
    title: "Bitto Saha - Portfolio",
    description:
      "Computer Science student at RUET with expertise in AI and Cyber Security",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://img.shields.io" crossOrigin="" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="preload" href="/avatar.png" as="image" fetchPriority="high" />
      </head>
      <body
        className={`${inter.className} ${patrickHand.variable} ${jersey.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
