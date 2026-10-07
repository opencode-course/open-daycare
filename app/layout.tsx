import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDayCare",
  description: "El día a día de Sala Soles, en un solo lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen bg-background">
          <div className="hidden shrink-0 lg:block">
            <Sidebar />
          </div>
          <main className="min-w-0 flex-1 pt-16 lg:pt-0">
            <MobileNavigation>
              <Sidebar variant="drawer" />
            </MobileNavigation>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
