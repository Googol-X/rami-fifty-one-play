import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, User, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Player } from '@/lib/matchTypes';

interface SeatingChooserProps {
  onStart: (players: Player[]) => void;
  onCancel: () => void;
}

export function SeatingChooser({ onStart, onCancel }: SeatingChooserProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [players, setPlayers] = useState<Omit<Player, 'id'>[]>([
    { name: 'Joueur 1', isBot: false },
    { name: 'Bot', isBot: true },
  ]);

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name };
    setPlayers(updated);
  };

  const toggleBot = (index: number) => {
    const updated = [...players];
    updated[index] = { 
      ...updated[index], 
      isBot: !updated[index].isBot,
      name: updated[index].isBot ? `Joueur ${index + 1}` : `Bot ${index + 1}`
    };
    setPlayers(updated);
  };

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    setPlayerCount(count);
    
    const updated = [...players];
    
    // Add or remove players as needed
    while (updated.length < count) {
      updated.push({
        name: `Joueur ${updated.length + 1}`,
        isBot: false,
      });
    }
    
    while (updated.length > count) {
      updated.pop();
    }
    
    setPlayers(updated);
  };

  const handleStart = () => {
    const playersWithIds: Player[] = players.map((p, i) => ({
      ...p,
      id: `player-${i + 1}`,
    }));
    
    onStart(playersWithIds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-background/95 backdrop-blur-lg border-2 border-primary rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Partie locale
          </h2>
          <p className="text-sm text-muted-foreground">
            Configurez votre partie Pass & Play
          </p>
        </div>

        {/* Player count selector */}
        <div className="mb-6">
          <Label className="mb-3 block">Nombre de joueurs</Label>
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((count) => (
              <button
                key={count}
                onClick={() => handlePlayerCountChange(count)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold",
                  playerCount === count
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {count} joueurs
              </button>
            ))}
          </div>
        </div>

        {/* Players configuration */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {players.map((player, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>

              <div className="flex-1">
                <Input
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`Nom du joueur ${index + 1}`}
                  className="h-9"
                  disabled={player.isBot}
                />
              </div>

              <Button
                size="sm"
                variant={player.isBot ? "default" : "outline"}
                onClick={() => toggleBot(index)}
                className="flex items-center gap-2"
              >
                {player.isBot ? (
                  <>
                    <Bot className="w-4 h-4" />
                    Bot
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Humain
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleStart}
            className="flex-1"
            disabled={players.some(p => !p.name.trim())}
          >
            Démarrer la partie
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
