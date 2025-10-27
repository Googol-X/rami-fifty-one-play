import React from 'react';

interface OpponentAreaProps {
  count: number;
}

export function OpponentArea({ count }: OpponentAreaProps) {
  const maxPerRow = 12;
  const rows = Math.ceil(count / maxPerRow);
  
  return (
    <section role="region" aria-label="Adversaire" className="w-full mb-2">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Adversaire ({count})
      </h3>
      <div className="flex flex-col gap-1 items-center">
        {Array.from({ length: rows }).map((_, r) => {
          const len = r < rows - 1 ? maxPerRow : (count - (rows - 1) * maxPerRow);
          return (
            <div key={r} className="flex items-center justify-center gap-1">
              {Array.from({ length: len }).map((_, i) => (
                <div
                  key={i}
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
