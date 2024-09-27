// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Footer from '@/app/components/footer';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: "Newman Tournament App",
  description: "A webapp to manage tournaments at Cardinal Newman College",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        {children}
        <Toaster />
      <Footer />
      </body>
    </html>
  );
}
