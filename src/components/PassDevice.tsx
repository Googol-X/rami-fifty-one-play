import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PassDeviceProps {
  playerName: string;
  onReady: () => void;
  countdown?: number; // Optional auto-continue countdown in seconds
}

export function PassDevice({ playerName, onReady, countdown }: PassDeviceProps) {
  const [timeLeft, setTimeLeft] = useState(countdown || 0);

  useEffect(() => {
    if (!countdown || countdown <= 0) return;

    setTimeLeft(countdown);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReady();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, onReady]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background"
    >
      <div className="w-full max-w-md text-center space-y-8">
        {/* Animation */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <Smartphone className="w-24 h-24 text-primary" />
            <motion.div
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl"
            />
          </div>
        </motion.div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            C'est ton tour !
          </h2>
          <p className="text-xl text-primary font-semibold">
            {playerName}
          </p>
          <p className="text-sm text-muted-foreground">
            Passe l'appareil au joueur suivant
          </p>
        </div>

        {/* Continue button */}
        <Button
          size="lg"
          variant="default"
          onClick={onReady}
          className="w-full max-w-xs mx-auto h-14 text-lg font-semibold"
        >
          C'est parti
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Auto-continue countdown */}
        {countdown && countdown > 0 && timeLeft > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            Démarrage automatique dans {timeLeft}s...
          </motion.p>
        )}

        {/* Privacy hint */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Les autres joueurs ne peuvent pas voir ton jeu
          </p>
        </div>
      </div>
    </motion.div>
  );
}
