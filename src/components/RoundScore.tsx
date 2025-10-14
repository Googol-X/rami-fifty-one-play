import { Card, RANK_VALUES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoundScoreProps {
  playerHand: Card[];
  botHand: Card[];
  winner: 'player' | 'bot';
  onNextRound: () => void;
  onNewGame: () => void;
  playerTotal: number;
  botTotal: number;
  isGameOver: boolean;
  gameWinner?: 'player' | 'bot' | null;
}

export function RoundScore({
  playerHand,
  botHand,
  winner,
  onNextRound,
  onNewGame,
  playerTotal,
  botTotal,
  isGameOver,
  gameWinner
}: RoundScoreProps) {
  const playerPenalty = playerHand.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
  const botPenalty = botHand.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border-2 border-border rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center">
          {isGameOver ? (
            <>
              <h2 className="text-4xl font-bold mb-2">
                {gameWinner === 'player' ? '🏆 Victoire finale !' : '😢 Défaite finale'}
              </h2>
              <p className="text-muted-foreground">
                {gameWinner === 'player' 
                  ? 'Félicitations ! Vous avez gagné la partie !' 
                  : 'Le bot a gagné la partie. Retentez votre chance !'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">
                {winner === 'player' ? '🎉 Manche gagnée !' : '😔 Manche perdue'}
              </h2>
              <p className="text-muted-foreground">
                {winner === 'player' 
                  ? 'Vous avez vidé votre main en premier !' 
                  : 'Le bot a vidé sa main en premier.'}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-secondary/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Pénalités de cette manche</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Vous :</span>
                <Badge variant={winner === 'player' ? 'default' : 'destructive'}>
                  {winner === 'player' ? '0 points' : `${playerPenalty} points`}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bot :</span>
                <Badge variant={winner === 'bot' ? 'default' : 'destructive'}>
                  {winner === 'bot' ? '0 points' : `${botPenalty} points`}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Score total</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Vous :</span>
                <span className="text-xl font-bold">{playerTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Bot :</span>
                <span className="text-xl font-bold">{botTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isGameOver ? (
            <Button onClick={onNewGame} size="lg" className="w-full">
              Nouvelle partie
            </Button>
          ) : (
            <Button onClick={onNextRound} size="lg" className="w-full">
              Manche suivante
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
