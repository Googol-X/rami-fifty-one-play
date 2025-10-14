import { useState, useRef, useEffect } from 'react';
import { Card as CardType, Rank } from '@/types/game';
import { Card } from './Card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface HandReorderProps {
  hand: CardType[];
  selected: number[];
  onToggle: (index: number) => void;
  onReorder: (newHand: CardType[]) => void;
}

const RANK_ORDER: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13
};

const SUIT_ORDER = ['♣', '♦', '♥', '♠'];

export function HandReorder({ hand, selected, onToggle, onReorder }: HandReorderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [pointerDrag, setPointerDrag] = useState<{ index: number; startX: number; startY: number } | null>(null);
  const [liveMsg, setLiveMsg] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Remapper sélection après réordonnancement
  const remapSelection = (oldHand: CardType[], newHand: CardType[], oldSelected: number[]): number[] => {
    const selectedCards = oldSelected.map(i => oldHand[i]);
    return selectedCards.map(card => {
      const idx = newHand.findIndex(c => c.id === card.id);
      return idx >= 0 ? idx : -1;
    }).filter(i => i >= 0);
  };

  // Trier la main
  const handleSort = () => {
    const sorted = [...hand].sort((a, b) => {
      const suitCmp = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
      if (suitCmp !== 0) return suitCmp;
      return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
    });
    const newSelected = remapSelection(hand, sorted, selected);
    onReorder(sorted);
    // Vider proprement la sélection ou la re-mapper
    newSelected.forEach((idx, i) => {
      if (idx !== selected[i]) onToggle(selected[i]); // clear
      if (idx >= 0) onToggle(idx); // reselect
    });
    setLiveMsg('Main triée par couleur puis rang');
  };

  // Déplacer une carte
  const moveCard = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= hand.length) return;
    
    const newHand = [...hand];
    const [moved] = newHand.splice(fromIdx, 1);
    newHand.splice(toIdx, 0, moved);
    
    const newSelected = remapSelection(hand, newHand, selected);
    onReorder(newHand);
    
    // Re-mapper sélection
    selected.forEach(i => onToggle(i)); // clear old
    newSelected.forEach(i => onToggle(i)); // set new
    
    setLiveMsg(`${moved.rank}${moved.suit} déplacée de position ${fromIdx + 1} à ${toIdx + 1}`);
    console.log(`🃏 Déplacement: ${fromIdx} → ${toIdx}`);
    
    // Focus sur la carte déplacée
    setTimeout(() => cardRefs.current[toIdx]?.focus(), 50);
  };

  // === Desktop: HTML5 Drag & Drop ===
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    if (cardRefs.current[index]) {
      cardRefs.current[index]!.setAttribute('aria-grabbed', 'true');
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      moveCard(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDropTarget(null);
    if (cardRefs.current[dragIndex!]) {
      cardRefs.current[dragIndex!]!.removeAttribute('aria-grabbed');
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropTarget(null);
    cardRefs.current.forEach(ref => ref?.removeAttribute('aria-grabbed'));
  };

  // === Mobile: Pointer Events ===
  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    if (e.pointerType === 'touch') {
      setPointerDrag({ index, startX: e.clientX, startY: e.clientY });
      setDragIndex(index);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerDrag || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const cards = containerRef.current.querySelectorAll('[data-card-index]');
    
    let targetIdx = pointerDrag.index;
    cards.forEach((el, idx) => {
      const cardRect = el.getBoundingClientRect();
      if (e.clientX > cardRect.left && e.clientX < cardRect.right &&
          e.clientY > cardRect.top && e.clientY < cardRect.bottom) {
        targetIdx = idx;
      }
    });
    
    setDropTarget(targetIdx);
  };

  const handlePointerUp = () => {
    if (pointerDrag !== null && dropTarget !== null && pointerDrag.index !== dropTarget) {
      moveCard(pointerDrag.index, dropTarget);
    }
    setPointerDrag(null);
    setDragIndex(null);
    setDropTarget(null);
  };

  // === Keyboard navigation ===
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      moveCard(index, index - 1);
    } else if (e.key === 'ArrowRight' && index < hand.length - 1) {
      e.preventDefault();
      moveCard(index, index + 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(index);
    }
  };

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, hand.length);
  }, [hand.length]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Glissez pour réordonner • ←/→ au clavier
        </div>
        <Button variant="outline" size="sm" onClick={handleSort}>
          Trier ma main
        </Button>
      </div>
      
      <div 
        ref={containerRef}
        className="flex flex-wrap gap-2 justify-center md:justify-start"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {hand.map((card, index) => (
          <div
            key={card.id}
            ref={el => cardRefs.current[index] = el}
            data-card-index={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onPointerDown={(e) => handlePointerDown(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="button"
            aria-label={`Carte ${card.rank}${card.suit}, position ${index + 1}`}
            aria-pressed={selected.includes(index)}
            className={cn(
              "relative group touch-none select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              dragIndex === index && "opacity-50",
              dropTarget === index && "ml-8"
            )}
          >
            {/* Drag handle mobile */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 md:hidden">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {/* Indicateur de drop */}
            {dropTarget === index && dragIndex !== index && (
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full" />
            )}
            
            <div className={cn(dragIndex === index ? "cursor-grabbing" : "cursor-grab")}>
              <Card
                card={card}
                onClick={() => onToggle(index)}
                selected={selected.includes(index)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live region pour accessibilité */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMsg}
      </div>
    </div>
  );
}
