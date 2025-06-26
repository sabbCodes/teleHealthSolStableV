import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { W3sProvider } from "@/providers/W3sProvider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "teleHealthSol - Healthcare Without Borders",
  description:
    "Connect with world-class doctors from anywhere. Secure your medical records on blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>teleHealthSol - Healthcare Without Borders</title>
        <meta
          name="description"
          content="Secure telemedicine platform with blockchain-powered health records"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <W3sProvider>
              {children}
              <Toaster />
            </W3sProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
