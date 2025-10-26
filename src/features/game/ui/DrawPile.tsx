import React from 'react';
import { motion } from 'framer-motion';

interface DrawPileProps {
  count: number;
  onDraw?: () => void;
  disabled?: boolean;
}

export const DrawPile: React.FC<DrawPileProps> = ({ 
  count, 
  onDraw,
  disabled = false 
}) => {
  return (
    <motion.button 
      className="w-16 h-24 md:w-20 md:h-28 rounded-xl border-3 border-primary bg-gradient-to-br from-primary/30 to-primary/10 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm hover:ring-2 hover:ring-primary/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={count > 0 ? "Piocher une carte" : "Pioche vide"}
      onClick={onDraw}
      disabled={count === 0 || disabled}
      whileHover={count > 0 && !disabled ? { 
        scale: 1.08, 
        boxShadow: "0 0 30px hsl(var(--primary) / 0.6)",
        transition: { duration: 0.2 }
      } : undefined}
    >
      <div className="text-[9px] md:text-xs text-primary font-bold mb-1 uppercase tracking-wider">
        Pioche
      </div>
      <div className="text-2xl md:text-4xl font-bold text-primary drop-shadow-lg">
        {count}
      </div>
      <div className="text-[8px] md:text-xs text-primary/70 mt-1">
        cartes
      </div>
    </motion.button>
  );
};
