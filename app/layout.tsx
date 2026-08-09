import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { NameModalProvider } from "@/components/name-modal-provider";
import { StudyToolsProvider } from "@/components/tools/study-tools-provider";
import { GlobalToolsMount } from "@/components/tools/global-tools-mount";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coursify | Cambridge Notes & Past Papers",
  description:
    "Notes, past papers, mark schemes, practice mode, and study tools for Cambridge O Level, AS Level, and A Level students — all in one place.",
};

// Applied before React hydrates so the saved theme never flashes.
const THEME_SCRIPT = `try{var t=localStorage.getItem("coursify:theme");if(t==="dark"||t==="amoled"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <StudyToolsProvider>
            <NameModalProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <GlobalToolsMount />
              <BackToTop />
            </NameModalProvider>
          </StudyToolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}