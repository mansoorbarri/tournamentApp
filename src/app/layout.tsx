// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Next.js Mongoose App',
  description: 'A Next.js app with Mongoose integration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
