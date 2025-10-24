import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { CardView } from './CardView';
import { cardDealVariants } from './animations';

export const Hand: React.FC<{
  cards: string[];
  deck: Record<string, Card>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  size?: 'sm'|'md'|'lg';
  scale?: number;
}> = ({ cards, deck, selected, onToggle, size='md', scale=1 }) => {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <motion.div 
        className="inline-flex gap-2 px-2"
        style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
      >
        {cards.map((id, index) => (
          <motion.div
            key={id}
            custom={index}
            variants={cardDealVariants}
            initial="hidden"
            animate="visible"
          >
            <CardView 
              card={deck[id]} 
              selected={selected.has(id)} 
              onClick={() => onToggle(id)} 
              size={size} 
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
