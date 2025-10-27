import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

export const BotDifficulty: React.FC = () => {
  const { difficulty, setDifficulty } = useGame();

  if (difficulty !== null) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="DifficultyBar fixed top-20 right-4 z-30 bg-gradient-to-br from-secondary to-secondary/80 backdrop-blur-xl border-2 border-primary/30 rounded-xl p-4 shadow-2xl"
      data-difficulty-bar
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-bold text-primary">Niveau Bot</span>
      </div>
      <div className="flex flex-col gap-2">
        {(['easy', 'medium', 'hard'] as const).map((lvl) => (
          <Button
            key={lvl}
            size="sm"
            variant="outline"
            onClick={() => setDifficulty(lvl)}
            className="text-xs h-8 font-semibold justify-start"
          >
            {lvl === 'easy' ? '🟢 Facile' : lvl === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
