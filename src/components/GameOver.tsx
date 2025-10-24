import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Target, Clock, Zap, Home } from 'lucide-react';
import { useEffect } from 'react';
import { audioService } from '@/utils/audioService';

interface GameOverStats {
  totalRounds: number;
  playerWins: number;
  botWins: number;
  playerFinalScore: number;
  botFinalScore: number;
  averageRoundDuration?: number;
  biggestCombo?: number;
  perfectRounds?: number; // rounds won with 0 points
}

interface GameOverProps {
  winner: 'player' | 'bot';
  stats: GameOverStats;
  onNewGame: () => void;
  onBackToMenu?: () => void;
}

export function GameOver({ winner, stats, onNewGame, onBackToMenu }: GameOverProps) {
  useEffect(() => {
    if (winner === 'player') {
      audioService.playWin();
    } else {
      audioService.playLose();
    }
  }, [winner]);

  const playerWinRate = ((stats.playerWins / stats.totalRounds) * 100).toFixed(0);
  const isPlayerWinner = winner === 'player';

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-br from-card via-card to-card/80 border-2 border-border rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Trophy Icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className={`p-6 rounded-full ${isPlayerWinner ? 'bg-primary/20' : 'bg-destructive/20'}`}>
              <Trophy className={`w-16 h-16 ${isPlayerWinner ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </motion.div>

          {/* Winner announcement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-3">
              {isPlayerWinner ? '🎉 Victoire !' : '😔 Défaite'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {isPlayerWinner 
                ? 'Félicitations ! Vous avez remporté la partie !' 
                : 'Le bot a gagné cette fois. Retentez votre chance !'}
            </p>
          </motion.div>

          {/* Final scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary/30 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-center mb-4 text-muted-foreground">Score final</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className={`text-center p-4 rounded-xl ${isPlayerWinner ? 'bg-primary/20 border-2 border-primary' : 'bg-background/50'}`}>
                <p className="text-sm text-muted-foreground mb-2">Vous</p>
                <p className="text-4xl font-bold">{stats.playerFinalScore}</p>
                <Badge variant={isPlayerWinner ? 'default' : 'secondary'} className="mt-2">
                  {stats.playerWins} {stats.playerWins > 1 ? 'manches' : 'manche'}
                </Badge>
              </div>
              <div className={`text-center p-4 rounded-xl ${!isPlayerWinner ? 'bg-destructive/20 border-2 border-destructive' : 'bg-background/50'}`}>
                <p className="text-sm text-muted-foreground mb-2">Bot</p>
                <p className="text-4xl font-bold">{stats.botFinalScore}</p>
                <Badge variant={!isPlayerWinner ? 'default' : 'secondary'} className="mt-2">
                  {stats.botWins} {stats.botWins > 1 ? 'manches' : 'manche'}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Detailed stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            <h3 className="text-lg font-semibold text-center mb-4">Statistiques de la partie</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Taux de victoire"
                value={`${playerWinRate}%`}
                delay={0.6}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Total manches"
                value={stats.totalRounds.toString()}
                delay={0.65}
              />
              {stats.averageRoundDuration && (
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Durée moyenne"
                  value={`${Math.round(stats.averageRoundDuration)}s`}
                  delay={0.7}
                />
              )}
              {stats.biggestCombo !== undefined && stats.biggestCombo > 0 && (
                <StatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Plus grand combo"
                  value={`${stats.biggestCombo} pts`}
                  delay={0.75}
                />
              )}
              {stats.perfectRounds !== undefined && stats.perfectRounds > 0 && (
                <StatCard
                  icon={<Trophy className="w-5 h-5" />}
                  label="Manches parfaites"
                  value={stats.perfectRounds.toString()}
                  delay={0.8}
                  highlight
                />
              )}
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button 
              onClick={onNewGame} 
              size="lg" 
              className="flex-1 text-lg py-6"
            >
              Nouvelle partie
            </Button>
            {onBackToMenu && (
              <Button 
                onClick={onBackToMenu} 
                variant="outline" 
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <Home className="w-4 h-4 mr-2" />
                Menu
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}

function StatCard({ icon, label, value, delay, highlight }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={`bg-background/50 rounded-xl p-4 flex flex-col items-center ${
        highlight ? 'border-2 border-primary' : 'border border-border'
      }`}
    >
      <div className={`mb-2 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-1 text-center">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </motion.div>
  );
}
