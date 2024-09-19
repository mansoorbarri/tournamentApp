// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: "Newman Tournament App",
  description: "A webapp to manage tournaments at Cardinal Newman College",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
