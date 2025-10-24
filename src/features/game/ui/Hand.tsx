import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Card } from "@/types/game";
import { CardView } from './CardView';
import { cardDealVariants } from './animations';
import { audioService } from '@/utils/audioService';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = (id: string) => {
    audioService.playClick();
    onToggle(id);
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

  return (
    <div className="w-full overflow-x-auto pb-4">
      {onReorder && (
        <div className="flex items-center justify-center gap-2 mb-2 text-xs text-muted-foreground">
          <GripVertical className="w-3 h-3" />
          <span>Glissez-déposez pour réorganiser vos cartes</span>
          <GripVertical className="w-3 h-3" />
        </div>
      )}
      <motion.div 
        ref={containerRef}
        className="inline-flex gap-2 px-2"
        style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
      >
        {cards.map((id, index) => (
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
            title={onReorder ? "Glissez pour déplacer cette carte" : undefined}
            className={cn(
              "relative transition-all duration-200 group",
              onReorder && "cursor-grab active:cursor-grabbing hover:scale-105 hover:z-10",
              dragIndex === index && "opacity-30 scale-90 cursor-grabbing",
              dropTarget === index && dragIndex !== index && "ml-6 scale-105"
            )}
          >
            <motion.div
              custom={index}
              variants={cardDealVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Drag indicator - always visible on hover when reorder is enabled */}
              {onReorder && dragIndex !== index && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background/90 rounded-full p-1 border border-border shadow-lg">
                    <GripVertical className="w-3 h-3 text-primary" />
                  </div>
                </div>
              )}
              
              {/* Drop indicator with animation */}
              {dropTarget === index && dragIndex !== index && (
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full shadow-lg shadow-primary/50"
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
        ))}
      </motion.div>
    </div>
  );
};
