import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editor demo",
  description: "Lightweight online code editor with file explorer and terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
