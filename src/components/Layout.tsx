import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  gameInProgress?: boolean;
}

export function Layout({ children, gameInProgress }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar gameInProgress={gameInProgress} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
