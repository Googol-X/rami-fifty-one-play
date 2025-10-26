import React from 'react';

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
    <button 
      className="rounded-xl border-2 border-primary bg-gradient-to-br from-primary/30 to-primary/10 px-3 py-2 shadow-xl backdrop-blur-sm hover:ring-2 hover:ring-primary/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={count > 0 ? "Piocher une carte" : "Pioche vide"}
      onClick={onDraw}
      disabled={count === 0 || disabled}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="text-[9px] md:text-xs text-primary font-bold uppercase tracking-wider">
          Pioche
        </div>
        <div className="text-2xl md:text-3xl font-bold text-primary drop-shadow-lg">
          {count}
        </div>
        <div className="text-[8px] md:text-xs text-primary/70">
          cartes
        </div>
      </div>
    </button>
  );
};
