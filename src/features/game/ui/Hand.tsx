import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { CardView } from './CardView';
import { cardDealVariants } from './animations';
import { audioService } from '@/utils/audioService';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type FanHandProps = {
  cards: string[];
  deck: Record<string, Card>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onReorder?: (newCards: string[]) => void;
  radius?: number;
  spread?: number;
  tilt?: number;
  overlap?: number;
  scale?: number;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
};

export const Hand: React.FC<FanHandProps> = ({ 
  cards, 
  deck, 
  selected, 
  onToggle, 
  onReorder,
  radius = 380,
  spread = 90,
  tilt = -6,
  overlap = 38,
  scale = 0.9,
  size = 'md',
  faceDown = false
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = (id: string) => {
    audioService.playClick();
    onToggle(id);
  };

  // Move card left or right
  const moveCard = (fromIndex: number, direction: 'left' | 'right') => {
    if (!onReorder) return;
    
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= cards.length) return;
    
    const newCards = [...cards];
    const [moved] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, moved);
    onReorder(newCards);
    audioService.playClick();
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    if (!onReorder) return;
    e.preventDefault();
    
    if (dragIndex !== null && dragIndex !== toIndex) {
      const newCards = [...cards];
      const [moved] = newCards.splice(dragIndex, 1);
      newCards.splice(toIndex, 0, moved);
      onReorder(newCards);
      audioService.playClick();
    }
    
    setDragIndex(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropTarget(null);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!onReorder) return;
    setDragIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onReorder || dragIndex === null || !containerRef.current) return;
    
    const touch = e.touches[0];
    const elements = containerRef.current.querySelectorAll('[data-card-index]');
    
    elements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientX > rect.left && touch.clientX < rect.right &&
          touch.clientY > rect.top && touch.clientY < rect.bottom) {
        setDropTarget(idx);
      }
    });
  };

  const handleTouchEnd = () => {
    if (!onReorder) return;
    
    if (dragIndex !== null && dropTarget !== null && dragIndex !== dropTarget) {
      const newCards = [...cards];
      const [moved] = newCards.splice(dragIndex, 1);
      newCards.splice(dropTarget, 0, moved);
      onReorder(newCards);
      audioService.playClick();
    }
    
    setDragIndex(null);
    setDropTarget(null);
  };

  // Calculate dynamic fan parameters
  const maxCards = cards.length;
  const totalSpread = spread;
  const anglePerCard = maxCards > 1 ? totalSpread / (maxCards - 1) : 0;
  const startAngle = -totalSpread / 2 + tilt;
  
  return (
    <div className="w-full flex justify-center pb-4 px-2">
      {onReorder && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20 z-50">
          <GripVertical className="w-3 h-3" />
          <span className="font-semibold hidden sm:inline">Glissez ou utilisez ← → pour réorganiser</span>
          <span className="font-semibold sm:hidden">← → Réorganiser</span>
          <GripVertical className="w-3 h-3" />
        </div>
      )}
      <div 
        ref={containerRef}
        className="fan"
        style={{ 
          transform: `scale(${scale})`,
          '--fan-radius': `${radius}px`,
          '--overlap': `${overlap}px`
        } as React.CSSProperties}
      >
        {cards.map((id, index) => {
          const rotation = startAngle + (index * anglePerCard);
          const zIndex = faceDown ? index : (hoveredIndex === index ? 40 : selected.has(id) ? 30 : 20 + index);
          
          return (
            <div
              key={id}
              data-card-index={index}
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={onReorder ? "Glissez pour déplacer cette carte" : undefined}
              className={cn(
                "fanCard",
                !faceDown && onReorder && "cursor-grab active:cursor-grabbing",
                dragIndex === index && "opacity-30 scale-90 cursor-grabbing",
                dropTarget === index && dragIndex !== index && "scale-110",
                !faceDown && hoveredIndex === index && "-translate-y-12"
              )}
              style={{
                transform: `translateX(-50%) rotate(${rotation}deg)`,
                zIndex,
                '--fan-radius': `${radius}px`
              } as React.CSSProperties}
            >
            <motion.div
              custom={index}
              variants={cardDealVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Move buttons - visible on hover */}
              {!faceDown && onReorder && hoveredIndex === index && dragIndex === null && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(index, 'left');
                    }}
                    disabled={index === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(index, 'right');
                    }}
                    disabled={index === cards.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Drag indicator */}
              {!faceDown && onReorder && hoveredIndex === index && dragIndex === null && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20">
                  <div className="bg-background/90 rounded-full p-1 border-2 border-primary shadow-lg animate-pulse">
                    <GripVertical className="w-3 h-3 text-primary" />
                  </div>
                </div>
              )}
              
              {/* Drop indicator */}
              {dropTarget === index && dragIndex !== index && (
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className="absolute -left-2 top-0 bottom-0 w-1.5 bg-primary rounded-full shadow-lg shadow-primary/50"
                />
              )}
              
              {faceDown ? (
                <div 
                  className={cn(
                    "rounded-lg bg-gradient-to-br from-primary/80 to-primary border-2 border-primary/40 shadow-lg",
                    size === 'sm' && "w-12 h-16",
                    size === 'md' && "w-16 h-24",
                    size === 'lg' && "w-20 h-28"
                  )}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/30 text-xl font-bold">🂠</div>
                  </div>
                </div>
              ) : (
                <CardView 
                  card={deck[id]} 
                  selected={selected.has(id)} 
                  onClick={() => handleToggle(id)} 
                  size={size} 
                />
              )}
            </motion.div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
