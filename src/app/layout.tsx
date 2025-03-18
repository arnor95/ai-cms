import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import './globals.css';

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI CMS',
  description: 'AI-powered CMS that creates unique, responsive websites',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
} 