import { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Theme>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Chronos</h1>
          </div>
        </header>
        <main className="container mx-auto px-5 py-8">
          {children}
        </main>
      </div>
    </Theme>
  );
} 