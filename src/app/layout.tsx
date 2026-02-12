import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "💧 Plouf CRM Prospector",
  description: "Advanced Agentic CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <UserProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
