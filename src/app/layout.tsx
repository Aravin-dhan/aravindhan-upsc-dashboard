// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Background from '@/components/Background';

import { DashboardProvider } from '@/context/DashboardContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'UPSC CSE 2027 Dashboard',
  description: 'Track your UPSC preparation with a premium modern UI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-backgroundStart text-foreground min-h-screen flex flex-col`}>
        {/* Background Texture */}
        <Background />
        {/* Main content */}
        <DashboardProvider>
          <div className="relative z-10 flex-1 w-full max-w-[95%] mx-auto p-4">
            {children}
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
