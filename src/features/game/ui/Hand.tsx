import React from 'react';
import type { Card } from "@/types/game";
import { CardView } from './CardView';

export const Hand: React.FC<{ cards: string[]; deck: Record<string, Card>; selected: Set<string>; onToggle: (id: string) => void; }>
= ({ cards, deck, selected, onToggle }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((id) => (
        <CardView key={id} card={deck[id]} selected={selected.has(id)} onClick={() => onToggle(id)} />
      ))}
    </div>
  );
};
