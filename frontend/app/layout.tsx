import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import Header from "@/app/ui/header";
import Sidebar from "@/app/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Promptory",
  description: "Your AI conversations, archived.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary`}>
        <AuthProvider>
          <Header />
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}