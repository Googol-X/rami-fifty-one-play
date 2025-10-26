import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { Table as GameTable } from '@/features/game/ui/Table';
import { Hand } from '@/features/game/ui/Hand';
import { ActionBar } from '@/features/game/ui/ActionBar';
import { Scoreboard } from '@/features/game/ui/Scoreboard';
import { RoundScore } from '@/components/RoundScore';
import { GameOver } from '@/components/GameOver';
import { OrientationGuard } from '@/components/OrientationGuard';
import { AvatarHud } from '@/components/AvatarHud';
import { DevOverlay } from '@/components/DevOverlay';
import { AdvancedBotAI, BotDifficulty } from '@/utils/advancedBotAI';
import type { Move } from '@/types/game';
import { RANK_VALUES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { useDevMode } from '@/hooks/useDevMode';
import { soundManager } from '@/lib/sound';

const P1 = { id: 'p1', displayName: 'Toi' };
const P2 = { id: 'p2', displayName: 'Bot' };

function TableContent() {
  const { state, deck, dispatch, initLocal, reorderHand } = useGame();
  const { toast } = useToast();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [roundNumber, setRoundNumber] = useState(1);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [handScale, setHandScale] = useState(0.9); // desktop default
  const isDevMode = useDevMode();
  
  // Timer state
  const [playerTimeLeft, setPlayerTimeLeft] = useState(30000);
  const [botTimeLeft, setBotTimeLeft] = useState(30000);
  const TURN_TIME_TOTAL = 30000;
  
  // Game score tracking
  const [playerTotal, setPlayerTotal] = useState(0);
  const [botTotal, setBotTotal] = useState(0);
  const [showRoundScore, setShowRoundScore] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [roundWinner, setRoundWinner] = useState<'player' | 'bot' | null>(null);
  const [gameStats, setGameStats] = useState({
    totalRounds: 0,
    playerWins: 0,
    botWins: 0,
    roundStartTimes: [Date.now()] as number[],
  });
  
  // Bot AI instance
  const botAI = React.useMemo(() => new AdvancedBotAI(botDifficulty), [botDifficulty]);

  React.useEffect(() => {
    if (!state) {
      // Initialize local game with 2 players
      initLocal([P1, P2]);
    }
  }, [state, initLocal]);

  // Timer countdown
  React.useEffect(() => {
    if (!state || showRoundScore || showGameOver) return;
    
    const interval = setInterval(() => {
      if (state.activePlayer === P1.id) {
        setPlayerTimeLeft(prev => Math.max(0, prev - 200));
      } else if (state.activePlayer === P2.id) {
        setBotTimeLeft(prev => Math.max(0, prev - 200));
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [state?.activePlayer, showRoundScore, showGameOver]);

  // Reset timer on turn change
  React.useEffect(() => {
    if (state?.activePlayer === P1.id) {
      setPlayerTimeLeft(TURN_TIME_TOTAL);
    } else if (state?.activePlayer === P2.id) {
      setBotTimeLeft(TURN_TIME_TOTAL);
    }
  }, [state?.activePlayer]);

  // Check for round end (when someone's hand is empty)
  React.useEffect(() => {
    if (!state || showRoundScore || showGameOver) return;
    
    const player = state.players.find(p => p.id === P1.id);
    const bot = state.players.find(p => p.id === P2.id);
    
    if (player && bot && (player.hand.length === 0 || bot.hand.length === 0)) {
      const winner = player.hand.length === 0 ? 'player' : 'bot';
      const loserHand = winner === 'player' ? bot.hand : player.hand;
      const penalty = loserHand.reduce((sum, cid) => sum + RANK_VALUES[deck[cid].rank], 0);
      
      // Play win sound
      if (winner === 'player') {
        soundManager.play('win');
      }
      
      let newPlayerTotal = playerTotal;
      let newBotTotal = botTotal;
      
      if (winner === 'player') {
        newBotTotal = botTotal + penalty;
        setBotTotal(newBotTotal);
      } else {
        newPlayerTotal = playerTotal + penalty;
        setPlayerTotal(newPlayerTotal);
      }
      
      // Update game stats
      setGameStats(prev => ({
        ...prev,
        totalRounds: prev.totalRounds + 1,
        playerWins: winner === 'player' ? prev.playerWins + 1 : prev.playerWins,
        botWins: winner === 'bot' ? prev.botWins + 1 : prev.botWins,
      }));
      
      setRoundWinner(winner);
      
      // Check if game is over (someone reached 101 points)
      if (newPlayerTotal >= 101 || newBotTotal >= 101) {
        setShowGameOver(true);
      } else {
        setShowRoundScore(true);
      }
    }
  }, [state, playerTotal, botTotal, showRoundScore, showGameOver, deck]);

  // Bot AI automatic turn
  React.useEffect(() => {
    if (!state || state.activePlayer !== P2.id || isBotThinking || showRoundScore || showGameOver) return;
    
    const bot = state.players.find(p => p.id === P2.id);
    if (!bot) return;

    const executeBot = async () => {
      setIsBotThinking(true);
      
      const thinkingDelay = botDifficulty === 'easy' ? 500 : botDifficulty === 'medium' ? 800 : 1200;
      await new Promise(resolve => setTimeout(resolve, thinkingDelay));

      try {
        // Phase 1: Draw
        if (state.phase === 'draw') {
          const topDiscard = state.piles.discard[state.piles.discard.length - 1];
          const discardCard = topDiscard ? deck[topDiscard] : null;
          const opponentMelds = state.melds.filter(m => m.owner === P1.id);
          
          const shouldDrawDiscard = discardCard && botAI.shouldDrawFromDiscard(
            discardCard,
            bot.hand.map(id => deck[id]),
            bot.hasOpened,
            opponentMelds,
            deck
          );

          if (shouldDrawDiscard && state.piles.discard.length > 0) {
            dispatch({ kind: 'DRAW_FROM_DISCARD', playerId: P2.id });
          } else {
            dispatch({ kind: 'DRAW_FROM_STOCK', playerId: P2.id });
          }
          
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Phase 2: Play (lay melds)
        if (state.phase === 'play') {
          const botHand = bot.hand.map(id => deck[id]);
          const combos = botAI.findBestCombosToLay(botHand, bot.hasOpened);

          if (!bot.hasOpened && combos.length > 0) {
            const melds = combos.map(c => ({
              type: c.type,
              cards: c.combo.map(card => card.id)
            }));
            
            try {
              dispatch({ kind: 'LAY_OPEN', playerId: P2.id, melds } as Move);
              await new Promise(resolve => setTimeout(resolve, 600));
            } catch {
              // Continue if it fails
            }
          } else if (bot.hasOpened && combos.length > 0) {
            const bestCombo = combos[0];
            try {
              dispatch({ 
                kind: 'LAY_MELD', 
                playerId: P2.id, 
                meld: {
                  type: bestCombo.type,
                  cards: bestCombo.combo.map(c => c.id)
                }
              } as Move);
              await new Promise(resolve => setTimeout(resolve, 600));
            } catch {
              // Continue if it fails
            }
          }

          // Phase 3: Discard
          const currentHand = state.players.find(p => p.id === P2.id)!.hand.map(id => deck[id]);
          const opponentMelds = state.melds.filter(m => m.owner === P1.id);
          const visibleDiscards = state.piles.discard.slice(-5).map(id => deck[id]);
          
          const cardToDiscard = botAI.selectCardToDiscard(
            currentHand,
            opponentMelds,
            deck,
            visibleDiscards
          );

          dispatch({ kind: 'DISCARD', playerId: P2.id, cardId: cardToDiscard.id });
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Phase 4: End turn
        if (state.phase === 'discard') {
          dispatch({ kind: 'END_TURN', playerId: P2.id });
        }
      } catch (error) {
        console.error('Bot error:', error);
      } finally {
        setIsBotThinking(false);
      }
    };

    executeBot();
  }, [state, dispatch, deck, botDifficulty, isBotThinking, showRoundScore, showGameOver, botAI]);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  const me = state.players.find((p) => p.id === P1.id)!;
  const isMyTurn = state.activePlayer === P1.id;

  const toggleCard = (id: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const doMove = (move: Move) => {
    try {
      dispatch(move);
      if (move.kind === 'END_TURN') {
        setRoundNumber(prev => prev + 1);
      }
      setSelectedCards(new Set());
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Mouvement invalide',
        variant: 'destructive',
      });
    }
  };

  const handleNextRound = () => {
    initLocal([P1, P2]);
    setShowRoundScore(false);
    setRoundWinner(null);
    setGameStats(prev => ({
      ...prev,
      roundStartTimes: [...prev.roundStartTimes, Date.now()],
    }));
  };

  const handleNewGame = () => {
    initLocal([P1, P2]);
    setShowRoundScore(false);
    setShowGameOver(false);
    setRoundWinner(null);
    setPlayerTotal(0);
    setBotTotal(0);
    setRoundNumber(1);
    setGameStats({
      totalRounds: 0,
      playerWins: 0,
      botWins: 0,
      roundStartTimes: [Date.now()],
    });
  };

  const handleDrawStock = () => {
    if (!isMyTurn) {
      toast({
        title: 'Ce n\'est pas votre tour',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DRAW_FROM_STOCK', playerId: P1.id });
  };

  const handleDrawDiscard = () => {
    if (!isMyTurn) {
      toast({
        title: 'Ce n\'est pas votre tour',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DRAW_FROM_DISCARD', playerId: P1.id });
  };

  const handleLayOpen = () => {
    if (selectedCards.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: 'run', cards: Array.from(selectedCards) } as any;
    doMove({ kind: 'LAY_OPEN', playerId: P1.id, melds: [meld] } as Move);
  };

  const handleLayMeld = () => {
    if (selectedCards.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: 'run', cards: Array.from(selectedCards) } as any;
    doMove({ kind: 'LAY_MELD', playerId: P1.id, meld } as Move);
  };

  const handleDiscard = () => {
    const [first] = Array.from(selectedCards);
    if (!first) {
      toast({
        title: 'Aucune carte sélectionnée',
        description: 'Sélectionnez une carte à défausser',
        variant: 'destructive',
      });
      return;
    }
    doMove({ kind: 'DISCARD', playerId: P1.id, cardId: first } as Move);
  };


  return (
    <OrientationGuard>
      <div className="relative w-full h-screen overflow-hidden bg-background">
        {/* Avatar HUDs */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
          <AvatarHud
            name="Bot"
            playerId="p2"
            isTurn={state?.activePlayer === P2.id}
            timeLeftMs={botTimeLeft}
            timeTotalMs={TURN_TIME_TOTAL}
            score={botTotal}
            position="top"
          />
        </div>

        <div className="fixed bottom-20 left-4 z-40">
          <AvatarHud
            name="Toi"
            playerId="p1"
            isTurn={state?.activePlayer === P1.id}
            timeLeftMs={playerTimeLeft}
            timeTotalMs={TURN_TIME_TOTAL}
            score={playerTotal}
            position="bottom"
          />
        </div>

        {/* Dev Overlay */}
        {isDevMode && (
          <DevOverlay
            onDistributeTest={() => {
              console.log('Test hand distribution');
            }}
            onForceBotDiscard={() => {
              if (state?.activePlayer === P2.id) {
                const bot = state.players.find(p => p.id === P2.id);
                if (bot && bot.hand.length > 0) {
                  dispatch({ kind: 'DISCARD', playerId: P2.id, cardId: bot.hand[0] });
                }
              }
            }}
            onToggleDifficulty={() => {
              const difficulties: BotDifficulty[] = ['easy', 'medium', 'hard'];
              const currentIndex = difficulties.indexOf(botDifficulty);
              const nextIndex = (currentIndex + 1) % difficulties.length;
              setBotDifficulty(difficulties[nextIndex]);
            }}
            onResetTimers={() => {
              setPlayerTimeLeft(TURN_TIME_TOTAL);
              setBotTimeLeft(TURN_TIME_TOTAL);
            }}
          />
        )}

        {/* Scoreboard */}
        <Scoreboard
          meldsCount={state.melds.length}
          stockCount={state.piles.draw.length}
          roundNumber={roundNumber}
          onQuit={() => window.location.href = '/'}
        />

      {/* Bot difficulty selector */}
      <div className="fixed top-20 right-4 z-30 bg-background/95 backdrop-blur-lg border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Difficulté Bot</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={botDifficulty === 'easy' ? 'default' : 'outline'}
            onClick={() => setBotDifficulty('easy')}
            className="text-xs h-7 px-2"
            disabled={!isMyTurn}
          >
            Facile
          </Button>
          <Button
            size="sm"
            variant={botDifficulty === 'medium' ? 'default' : 'outline'}
            onClick={() => setBotDifficulty('medium')}
            className="text-xs h-7 px-2"
            disabled={!isMyTurn}
          >
            Moyen
          </Button>
          <Button
            size="sm"
            variant={botDifficulty === 'hard' ? 'default' : 'outline'}
            onClick={() => setBotDifficulty('hard')}
            className="text-xs h-7 px-2"
            disabled={!isMyTurn}
          >
            Difficile
          </Button>
        </div>
      </div>

      {/* Main game table */}
      <div className="pt-16 pb-32 h-full">
      <GameTable
        state={state}
        deck={deck}
        currentPlayerId={P1.id}
        onDrawStock={handleDrawStock}
        onDrawDiscard={handleDrawDiscard}
      />
      </div>

      {/* Player's hand - sticky at bottom above action bar */}
      <div className="fixed bottom-16 md:bottom-24 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-transparent pt-2 md:pt-6 pb-2 md:pb-4">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground">
              Ta main ({me.hand.length} cartes)
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-80">Zoom</span>
              <input
                type="range"
                min={0.6}
                max={1.2}
                step={0.05}
                value={handScale}
                onChange={(e) => setHandScale(parseFloat(e.target.value))}
                className="w-16 md:w-28 accent-primary cursor-pointer"
              />
            </div>
          </div>
          <Hand 
            cards={me.hand} 
            deck={deck} 
            selected={selectedCards} 
            onToggle={toggleCard}
            onReorder={(newCards) => {
              reorderHand(P1.id, newCards);
            }}
            radius={320}
            spread={72}
            tilt={-8}
            overlap={46}
            scale={handScale}
            size="md" 
          />
        </div>
      </div>

      {/* Action bar */}
      <ActionBar
        onDrawStock={handleDrawStock}
        onDrawDiscard={handleDrawDiscard}
        onLayOpen={handleLayOpen}
        onLayMeld={handleLayMeld}
        onDiscard={handleDiscard}
        onEndTurn={() => doMove({ kind: 'END_TURN', playerId: P1.id })}
        hasOpened={me.hasOpened}
        canAct={isMyTurn}
      />

      {/* Game Over Screen */}
      {showGameOver && (
        <GameOver
          winner={(playerTotal >= 101 ? 'bot' : 'player') as 'player' | 'bot'}
          stats={{
            totalRounds: gameStats.totalRounds,
            playerWins: gameStats.playerWins,
            botWins: gameStats.botWins,
            playerFinalScore: playerTotal,
            botFinalScore: botTotal,
            averageRoundDuration: gameStats.roundStartTimes.length > 1
              ? (Date.now() - gameStats.roundStartTimes[0]) / gameStats.totalRounds / 1000
              : undefined,
          }}
          onNewGame={handleNewGame}
          onBackToMenu={() => window.location.href = '/'}
        />
      )}

      {/* Round Score Screen */}
      {showRoundScore && roundWinner && !showGameOver && (
        <RoundScore
          playerHand={state.players.find(p => p.id === P1.id)?.hand.map(cid => deck[cid]) || []}
          botHand={state.players.find(p => p.id === P2.id)?.hand.map(cid => deck[cid]) || []}
          winner={roundWinner}
          onNextRound={handleNextRound}
          onNewGame={handleNewGame}
          playerTotal={playerTotal}
          botTotal={botTotal}
          isGameOver={false}
        />
      )}
    </div>
    </OrientationGuard>
  );
}

export default function Table() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');

  return (
    <GameProvider roomId={gameId || undefined}>
      <TableContent />
    </GameProvider>
  );
}
