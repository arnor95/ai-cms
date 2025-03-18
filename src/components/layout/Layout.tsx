import React, { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  
  // Determine if the current route is active
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <Head>
        <title>AI CMS</title>
        <meta name="description" content="AI CMS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`min-h-screen bg-background ${inter.className}`}>
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="font-semibold text-lg">AI CMS</div>
            <nav className="flex items-center space-x-4">
              <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') && !isActive('/projects') && !isActive('/brand') && !isActive('/agent-status') ? 'text-primary font-semibold' : ''}`}>
                Home
              </Link>
              <Link href="/projects" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/projects') ? 'text-primary font-semibold' : ''}`}>
                Projects
              </Link>
              <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/brand') ? 'text-primary font-semibold' : ''}`}>
                Vörumerki
              </Link>
              <Link href="/generate" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/generate') ? 'text-primary font-semibold' : ''}`}>
                Búa til kóða
              </Link>
              <Link href="/agent-status" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/agent-status') ? 'text-primary font-semibold' : ''}`}>
                Agent Status
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
    </>
  );
};

export default Layout; 