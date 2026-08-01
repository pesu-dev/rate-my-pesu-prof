import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { Component as GradientBackground } from "../components/ui/gradient-background-4";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rate My Prof – PES Edition",
  description:
    "A platform for PES students to view, search, and anonymously rate professors.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        className="antialiased flex flex-col min-h-screen"
        suppressHydrationWarning
      >
      {/*
        Gradient background layer — fixed, full-viewport, z-0.
        GradientBackground uses `absolute inset-0` so it needs a
        positioned ancestor; we give it a fixed full-screen wrapper.
        Light: soft indigo bloom. Dark: translucent indigo via dark: variant.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <GradientBackground />
      </div>

        <ThemeProvider>
          <Navbar />
          <main className="relative z-10 flex-grow flex flex-col">
            {children}
          </main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
