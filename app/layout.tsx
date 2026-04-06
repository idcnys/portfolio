import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitto Saha - Portfolio",
  description:
    "Computer Science student at RUET with expertise in AI and Cyber Security",
  keywords: [
    "Bitto Saha",
    "Portfolio",
    "RUET",
    "Computer Science",
    "AI",
    "Cyber Security",
  ],
  authors: [{ name: "Bitto Saha", url: "https://bittosaha.com" }],
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
                background-color: var(--loading-bg) !important;
                color: var(--loading-gear-color);
                transition: background-color 0.8s ease, color 0.8s ease;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
              }

              .dark,
              .dark body {
                --loading-bg: #0f0f0f !important;
                --loading-gear-bg: #1f1f1f !important;
                --loading-gear-color: #ffffff !important;
                background-color: var(--loading-bg) !important;
                color: var(--loading-gear-color) !important;
                transition: background-color 0.8s ease, color 0.8s ease;
              }
              
              *, *::before, *::after {
                transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease !important;
              }
              
              .transitioning * {
                transition: all 0.8s ease !important;
              }
              
              .fade-in {
                opacity: 0;
                animation: fadeIn 1s ease forwards;
                animation-delay: 0.5s;
              }
              
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              
              .custom-context-menu {
                animation: fadeIn 0.15s ease-out;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                background: rgba(255, 255, 255, 0.85);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{
          backgroundColor: "var(--loading-bg, #ffffff)",
          color: "var(--loading-gear-color, #263238)",
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
