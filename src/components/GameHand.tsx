import { useMemo } from 'react';
import { Card as CardType } from '@/types/game';
import { Card } from './Card';

interface GameHandProps {
  title: string;
  cards: CardType[];
  onCardClick?: (i: number) => void;
  selectedIndices?: number[];
}

export function GameHand({ title, cards, onCardClick, selectedIndices = [] }: GameHandProps) {
  const fan = useMemo(() => {
    const n = cards.length;
    if (!n) return [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 430;
    const SPREAD = isMobile ? 35 : 45;           // ouverture totale (deg)
    const RADIUS = isMobile ? 160 : 200;         // rayon
    const step = n > 1 ? SPREAD / (n - 1) : 0;
    const start = -SPREAD / 2;
    const mid = (n - 1) / 2;
    return Array.from({ length: n }, (_, i) => {
      const angle = start + i * step;
      const offsetX = (i - mid) * (isMobile ? 12 : 16);
      const z = 100 + i;
      const emphasis = Math.max(0.95, 1 - Math.abs(i - mid) * 0.02);
      return { angle, offsetX, z, emphasis, radius: RADIUS };
    });
  }, [cards.length]);

  return (
    <div className="w-full" role="region" aria-label={title}>
      <h3 className="text-lg font-semibold text-foreground mb-3">{title} {cards.length ? `(${cards.length})` : ''}</h3>

      <div className="fan relative w-full" style={{ ['--fan-radius' as any]: `${fan[0]?.radius ?? 200}px` }}>
        {cards.map((card, i) => {
          const { angle, offsetX, z, emphasis } = fan[i] ?? { angle: 0, offsetX: 0, z: 1, emphasis: 1 };
          const selected = selectedIndices.includes(i);
          return (
            <div key={card.id ?? i} className="fanCard" style={{ zIndex: z, transform: `translateX(${offsetX}px) rotate(${angle}deg)` }}>
              <Card
                card={card}
                onClick={onCardClick ? () => onCardClick(i) : undefined}
                selected={selected}
                className={selected ? 'scale-110 -translate-y-3 shadow-2xl' : `scale-[${emphasis}]`}
              />
            </div>
          );
        })}
        {cards.length === 0 && <p className="text-muted-foreground italic">Aucune carte</p>}
      </div>
    </div>
  );
}
