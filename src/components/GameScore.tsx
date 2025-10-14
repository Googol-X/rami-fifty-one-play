interface GameScoreProps {
  playerScore: number;
  botScore: number;
}

export function GameScore({ playerScore, botScore }: GameScoreProps) {
  return (
    <div className="bg-secondary/30 rounded-xl p-4 border-2 border-border">
      <h2 className="text-xl font-bold text-primary mb-3 text-center">Score</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Vous</p>
          <p className="text-3xl font-bold text-foreground">{playerScore}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Bot</p>
          <p className="text-3xl font-bold text-foreground">{botScore}</p>
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-muted-foreground">
        Objectif : 51 points
      </div>
    </div>
  );
}
