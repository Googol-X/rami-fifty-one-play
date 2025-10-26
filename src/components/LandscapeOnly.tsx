import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

export function LandscapeOnly({ children }: { children: React.ReactNode }) {
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center p-6 z-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex p-6 rounded-full bg-background/10 backdrop-blur-sm">
            <RotateCw className="w-16 h-16 text-background animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-background">
              Mode Paysage Requis
            </h2>
            <p className="text-lg text-background/90">
              Veuillez tourner votre appareil en mode paysage pour profiter pleinement du jeu
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-background/60 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 rounded-full bg-background/60 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 rounded-full bg-background/60 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
