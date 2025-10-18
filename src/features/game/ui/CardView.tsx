import React from 'react';
import type { Card } from "@/types/game";

function suitColor(s: string) {
  return s === '♥' || s === '♦' ? 'text-red-600' : 'text-black';
}

export const CardView: React.FC<{
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm'|'md'|'lg';
}> = ({ card, selected, onClick, size='md' }) => {
  const scale = size === 'sm' ? 'text-sm px-1 py-0.5' : size === 'lg' ? 'text-xl px-3 py-2' : 'text-base px-2 py-1';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-lg shadow-sm bg-white hover:shadow ${selected ? 'ring-2 ring-blue-500' : ''} ${scale}`}
      style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}
      title={`${card.rank}${card.joker ? ' (Joker)' : card.suit}`}
    >
      {card.joker ? (
        <div className="font-semibold">🃏 Joker</div>
      ) : (
        <div className={`flex items-center gap-1 ${suitColor(card.suit)}`}>
          <span className="font-semibold">{card.rank}</span>
          <span>{card.suit}</span>
        </div>
      )}
    </button>
  );
};
