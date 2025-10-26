import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import type { BotDifficulty as DifficultyType } from '@/utils/advancedBotAI';

interface BotDifficultyProps {
  onSelect: (level: DifficultyType) => void;
}

export const BotDifficulty: React.FC<BotDifficultyProps> = ({ onSelect }) => {
  const [selectedLevel, setSelectedLevel] = React.useState<DifficultyType | null>(null);

  const handleSelect = (level: DifficultyType) => {
    setSelectedLevel(level);
    onSelect(level);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-20 right-4 z-30 bg-gradient-to-br from-secondary to-secondary/80 backdrop-blur-xl border-2 border-primary/30 rounded-xl p-4 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-bold text-primary">Niveau Bot</span>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant={selectedLevel === 'easy' ? 'default' : 'outline'}
          onClick={() => handleSelect('easy')}
          className="text-xs h-8 font-semibold justify-start"
        >
          🟢 Facile
        </Button>
        <Button
          size="sm"
          variant={selectedLevel === 'medium' ? 'default' : 'outline'}
          onClick={() => handleSelect('medium')}
          className="text-xs h-8 font-semibold justify-start"
        >
          🟡 Moyen
        </Button>
        <Button
          size="sm"
          variant={selectedLevel === 'hard' ? 'default' : 'outline'}
          onClick={() => handleSelect('hard')}
          className="text-xs h-8 font-semibold justify-start"
        >
          🔴 Difficile
        </Button>
      </div>
    </motion.div>
  );
};
