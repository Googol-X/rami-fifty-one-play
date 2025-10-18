import React from 'react';
import type { Card } from "@/types/game";

function suitColor(s: string) {
  return s === '♥' || s === '♦' ? 'text-red-600' : 'text-black';
}

export const CardView: React.FC<{ card: Card; selected?: boolean; onClick?: () => void; }>
= ({ card, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-lg px-2 py-1 shadow-sm bg-white hover:shadow ${selected ? 'ring-2 ring-blue-500' : ''}`}
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
