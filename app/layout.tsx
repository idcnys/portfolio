import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Patrick_Hand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "../lib/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-playwrite",
  weight: "400",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                --loading-bg: #ffffff;
                --loading-gear-bg: #fff;
                --loading-gear-color: #263238;
                background-color: var(--loading-bg);
                color: var(--loading-gear-color);
              }

              .dark,
              .dark body {
                --loading-bg: #0f0f0f;
                --loading-gear-bg: #1f1f1f;
                --loading-gear-color: #ffffff;
                background-color: var(--loading-bg);
                color: var(--loading-gear-color);
              }
              
              .fade-in {
                opacity: 0;
                animation: fadeIn 0.6s ease forwards;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              .custom-context-menu {
                animation: fadeIn 0.1s ease-out;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                background: rgba(255, 255, 255, 0.85);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              .dark .custom-context-menu {
                background: rgba(31, 41, 55, 0.85);
                border: 1px solid rgba(75, 85, 99, 0.3);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2);
              }
              
              .custom-context-menu button:hover {
                transform: translateX(2px);
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} ${patrickHand.variable} antialiased`}
        style={{
          backgroundColor: "var(--loading-bg, #ffffff)",
          color: "var(--loading-gear-color, #263238)",
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
