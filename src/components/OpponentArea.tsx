import { Card as CardType } from '@/types/game';

interface OpponentAreaProps {
  cards: CardType[];
  title?: string;
}

export default function OpponentArea({ cards, title = 'Adversaire' }: OpponentAreaProps) {
  const maxPerRow = 12;
  const rows = Math.ceil(cards.length / maxPerRow);
  return (
    <section role="region" aria-label={title} className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-2">{title} ({cards.length})</h3>
      <div className="flex flex-col gap-1 items-center">
        {Array.from({ length: rows }).map((_, r) => {
          const slice = cards.slice(r * maxPerRow, (r + 1) * maxPerRow);
          return (
            <div key={r} className="flex items-center justify-center gap-1">
              {slice.map((c, i) => (
                <div
                  key={c.id ?? `${r}-${i}`}
                  aria-label="Carte de l'adversaire (dos)"
                  className="w-12 h-18 sm:w-14 sm:h-20 rounded-md border border-border bg-gradient-to-br from-slate-700 to-slate-900 shadow-md"
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
