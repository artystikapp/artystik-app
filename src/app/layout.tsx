import type { Metadata } from "next";
import { serif, sans, mono, calligraphy } from "@/app/fonts";

import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { StoreProvider } from "@/providers/store-provider";
import { Navbar } from "@/components/navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Artystik | Online Artworks Store",
  description: "online artworks platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={`${serif.variable} ${sans.variable} ${mono.variable} ${calligraphy.variable} antialiased`}
        >
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
            </ThemeProvider>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
