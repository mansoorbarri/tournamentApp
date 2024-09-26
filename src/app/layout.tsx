// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Footer from '@/app/components/footer';

export const metadata = {
  title: "Newman Tournament App",
  description: "A webapp to manage tournaments at Cardinal Newman College",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <div>
          {children}
        </div>
      <Footer />
      </body>
    </html>
  );
}
