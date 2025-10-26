import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface DevOverlayProps {
  onDistributeTest?: () => void;
  onForceBotDiscard?: () => void;
  onToggleDifficulty?: () => void;
  onResetTimers?: () => void;
}

export function DevOverlay({
  onDistributeTest,
  onForceBotDiscard,
  onToggleDifficulty,
  onResetTimers,
}: DevOverlayProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(60);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const rafRef = useRef<number>();
  const frameTimesRef = useRef<number[]>([]);

  // FPS counter
  useEffect(() => {
    let lastTime = performance.now();
    
    const measureFPS = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      
      if (delta > 0) {
        frameTimesRef.current.push(1000 / delta);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }
      }
      
      if (frameTimesRef.current.length >= 10) {
        const avgFps = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        setFps(Math.round(avgFps));
      }
      
      rafRef.current = requestAnimationFrame(measureFPS);
    };
    
    rafRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <motion.div
      className={cn(
        "fixed z-[9999] bg-background/95 backdrop-blur-lg border-2 border-primary rounded-lg shadow-2xl",
        isDragging && "cursor-grabbing"
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isExpanded ? 300 : 200,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - draggable */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20",
          "cursor-grab active:cursor-grabbing select-none"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary">DEV MODE</span>
          <span className={cn(
            "text-xs font-mono",
            fps >= 55 ? "text-success" : fps >= 40 ? "text-accent" : "text-destructive"
          )}>
            {fps} FPS
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-2">
          {/* Action buttons */}
          <div className="space-y-1.5">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => {
                onDistributeTest?.();
                addLog('Main test distribuée');
              }}
            >
              🎴 Main test
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => {
                onForceBotDiscard?.();
                addLog('Bot forcé à défausser');
              }}
            >
              🤖 Forcer défausse bot
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => {
                onToggleDifficulty?.();
                addLog('Difficulté changée');
              }}
            >
              🎯 Changer difficulté
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => {
                onResetTimers?.();
                addLog('Timers réinitialisés');
              }}
            >
              ⏱️ Reset timers
            </Button>
          </div>

          {/* Console logs */}
          <div className="border-t border-border pt-2">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">CONSOLE</p>
            <div className="bg-secondary/30 rounded p-2 h-24 overflow-y-auto text-[10px] font-mono space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-muted-foreground/50 italic">Aucun événement</p>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className="text-foreground/80 leading-tight">{log}</p>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
