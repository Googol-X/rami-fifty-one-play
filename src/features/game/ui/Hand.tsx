import React from 'react';
import type { Card } from "@/types/game";
import { CardView } from './CardView';

export const Hand: React.FC<{
  cards: string[];
  deck: Record<string, Card>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  size?: 'sm'|'md'|'lg';
  scale?: number; // 0.8..1.2
}> = ({ cards, deck, selected, onToggle, size='md', scale=1 }) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap">
      <div className="inline-flex gap-2" style={{ ['--card-scale' as any]: scale, transform: 'scale(var(--card-scale))', transformOrigin: 'left center' }}>
        {cards.map((id) => (
          <CardView key={id} card={deck[id]} selected={selected.has(id)} onClick={() => onToggle(id)} size={size} />
        ))}
      </div>
    </div>
  );
};
