import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Table2, BookOpen } from 'lucide-react';

interface NavbarProps {
  gameInProgress?: boolean;
}

export function Navbar({ gameInProgress }: NavbarProps) {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/table', label: 'Table', icon: Table2 },
    { to: '/regles', label: 'Règles', icon: BookOpen },
  ];

  return (
    <nav className="bg-secondary/50 border-b border-border backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <span className="text-xl font-bold text-primary">Rami 51</span>
          </Link>

          <div className="flex items-center gap-6">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-primary/10 hover:text-primary",
                  location.pathname === to
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-foreground/80"
                )}
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

          {gameInProgress && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-medium text-primary">Partie en cours</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
