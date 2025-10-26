import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { CardView } from './CardView';
import { cardDealVariants } from './animations';
import { audioService } from '@/utils/audioService';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Hand: React.FC<{
  cards: string[];
  deck: Record<string, Card>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onReorder?: (newCards: string[]) => void;
  size?: 'sm'|'md'|'lg';
  scale?: number;
}> = ({ cards, deck, selected, onToggle, onReorder, size='md', scale=1 }) => {
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

  // Calculate dynamic fan spread to avoid horizontal scroll
  const maxCards = cards.length;
  const baseSpacing = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;
  const maxSpacing = Math.min(baseSpacing, (typeof window !== 'undefined' ? window.innerWidth * 0.75 : 1200) / Math.max(maxCards, 1));
  
  // Fan rotation angle - more cards = tighter fan
  const fanSpread = maxCards > 10 ? 8 : maxCards > 7 ? 12 : 15;
  const fanRadius = 900;
  
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
      <motion.div 
        ref={containerRef}
        className="relative flex items-end justify-center"
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'center bottom',
          minHeight: '160px',
          paddingTop: '50px',
          maxWidth: '100%'
        }}
      >
        {cards.map((id, index) => {
          // Calculate fan positioning with dynamic spacing
          const totalCards = cards.length;
          const centerIndex = (totalCards - 1) / 2;
          const offsetFromCenter = index - centerIndex;
          const rotation = offsetFromCenter * fanSpread;
          const yOffset = Math.abs(offsetFromCenter) * 10;
          
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
                "absolute transition-all duration-300 group",
                onReorder && "cursor-grab active:cursor-grabbing",
                dragIndex === index && "opacity-30 scale-90 cursor-grabbing z-50",
                dropTarget === index && dragIndex !== index && "scale-110",
                hoveredIndex === index && "z-40 -translate-y-12"
              )}
              style={{
                transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                transformOrigin: `center ${fanRadius}px`,
                left: `${index * maxSpacing}px`,
                zIndex: hoveredIndex === index ? 40 : selected.has(id) ? 30 : 20 - Math.abs(offsetFromCenter)
              }}
            >
            <motion.div
              custom={index}
              variants={cardDealVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Move buttons - visible on hover */}
              {onReorder && hoveredIndex === index && dragIndex === null && (
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
              {onReorder && hoveredIndex === index && dragIndex === null && (
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
              
              <CardView 
                card={deck[id]} 
                selected={selected.has(id)} 
                onClick={() => handleToggle(id)} 
                size={size} 
              />
            </motion.div>
          </div>
          );
        })}
      </motion.div>
    </div>
  );
};
