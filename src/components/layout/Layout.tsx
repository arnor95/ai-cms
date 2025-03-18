import React from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${inter.className}`}>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="font-semibold text-lg">AI CMS</div>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Heim
            </Link>
            <Link href="/sitemap" className="text-sm font-medium transition-colors hover:text-primary">
              Vefkort
            </Link>
            <Link href="/brand" className="text-sm font-medium transition-colors hover:text-primary">
              Vörumerki
            </Link>
            <Link href="/generate" className="text-sm font-medium transition-colors hover:text-primary">
              Búa til kóða
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Byggt með ❤️ með AI CMS
          </div>
        </div>
      </footer>
    </div>
  );
} 