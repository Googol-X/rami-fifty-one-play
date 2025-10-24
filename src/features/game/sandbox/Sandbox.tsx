import React from 'react';
import { useGame } from '@/contexts/GameContext';
import type { Move } from '@/types/game';
import { Hand } from '../ui/Hand';
import { Table } from '../ui/Table';
import { ActionBar } from '../ui/ActionBar';
import { Scoreboard } from '../ui/Scoreboard';
import { AdvancedBotAI, BotDifficulty } from '@/utils/advancedBotAI';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { RoundScore } from '@/components/RoundScore';
import { GameOver } from '@/components/GameOver';
import { RANK_VALUES } from '@/types/game';

const P1 = { id: 'p1', displayName: 'Toi' };
const P2 = { id: 'p2', displayName: 'Bot' };

type MeldKind = 'set' | 'run';

// Instance de l'IA avancée
const botAI = new AdvancedBotAI('medium');

export default function Sandbox() {
  const { state, deck, initLocal, dispatch, reorderHand } = useGame();
  const [meldKind, setMeldKind] = React.useState<MeldKind>('run');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [handScale, setHandScale] = React.useState(1);
  const [playersCount, setPlayersCount] = React.useState(2);
  const [roundNumber, setRoundNumber] = React.useState(1);
  const [botDifficulty, setBotDifficulty] = React.useState<BotDifficulty>('medium');
  const [isBotThinking, setIsBotThinking] = React.useState(false);
  
  // Game score tracking
  const [playerTotal, setPlayerTotal] = React.useState(0);
  const [botTotal, setBotTotal] = React.useState(0);
  const [showRoundScore, setShowRoundScore] = React.useState(false);
  const [showGameOver, setShowGameOver] = React.useState(false);
  const [roundWinner, setRoundWinner] = React.useState<'player' | 'bot' | null>(null);
  const [gameStats, setGameStats] = React.useState({
    totalRounds: 0,
    playerWins: 0,
    botWins: 0,
    roundStartTimes: [Date.now()] as number[],
  });

  React.useEffect(() => {
    if (!state) initLocal([P1, P2]);
  }, [state, initLocal]);

  // Check for round end (when someone's hand is empty)
  React.useEffect(() => {
    if (!state || showRoundScore || showGameOver) return;
    
    const player = state.players.find(p => p.id === P1.id);
    const bot = state.players.find(p => p.id === P2.id);
    
    if (player && bot && (player.hand.length === 0 || bot.hand.length === 0)) {
      const winner = player.hand.length === 0 ? 'player' : 'bot';
      const loserHand = winner === 'player' ? bot.hand : player.hand;
      const penalty = loserHand.reduce((sum, cid) => sum + RANK_VALUES[deck[cid].rank], 0);
      
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

  // Mettre à jour la difficulté du bot
  React.useEffect(() => {
    botAI.setDifficulty(botDifficulty);
  }, [botDifficulty]);

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

  if (!state) return <div className="p-4">Initialisation…</div>;

  const me = state.players.find((p) => p.id === P1.id)!;
  const isMyTurn = state.activePlayer === P1.id;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const doMove = (move: Move) => {
    dispatch(move);
    if (move.kind === 'END_TURN') {
      setRoundNumber(prev => prev + 1);
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

  const layOpen = () => {
    if (selected.size < 3) return alert('Sélectionne au moins 3 cartes');
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_OPEN', playerId: P1.id, melds: [meld] } as Move);
    setSelected(new Set());
  };

  const layMeld = () => {
    if (selected.size < 3) return alert('Sélectionne au moins 3 cartes');
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_MELD', playerId: P1.id, meld } as Move);
    setSelected(new Set());
  };

  const discardOne = () => {
    const [first] = Array.from(selected);
    if (!first) return alert('Sélectionne une carte à défausser');
    doMove({ kind: 'DISCARD', playerId: P1.id, cardId: first } as Move);
    setSelected(new Set());
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
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
          >
            Facile
          </Button>
          <Button
            size="sm"
            variant={botDifficulty === 'medium' ? 'default' : 'outline'}
            onClick={() => setBotDifficulty('medium')}
            className="text-xs h-7 px-2"
          >
            Moyen
          </Button>
          <Button
            size="sm"
            variant={botDifficulty === 'hard' ? 'default' : 'outline'}
            onClick={() => setBotDifficulty('hard')}
            className="text-xs h-7 px-2"
          >
            Difficile
          </Button>
        </div>
      </div>

      {/* Main game table */}
      <div className="pt-16 pb-32 h-full">
        <Table
          state={state}
          deck={deck}
          currentPlayerId={P1.id}
        />
      </div>

      {/* Player's hand - sticky at bottom above action bar */}
      <div className="fixed bottom-16 md:bottom-24 left-0 right-0 z-30 bg-gradient-to-t from-background via-background to-transparent pt-2 md:pt-6 pb-2 md:pb-4">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground">
              Ta main ({me.hand.length} cartes)
            </h3>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio" 
                    name="meld" 
                    checked={meldKind==='run'} 
                    onChange={()=>setMeldKind('run')} 
                  />
                  <span>Suite</span>
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio" 
                    name="meld" 
                    checked={meldKind==='set'} 
                    onChange={()=>setMeldKind('set')} 
                  />
                  <span>Brelan</span>
                </label>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <label className="text-sm">Zoom</label>
                <input 
                  type="range" 
                  min={0.8} 
                  max={1.2} 
                  step={0.05} 
                  value={handScale} 
                  onChange={(e)=>setHandScale(parseFloat(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <Hand 
            cards={me.hand} 
            deck={deck} 
            selected={selected} 
            onToggle={toggle}
            onReorder={(newCards) => {
              reorderHand(P1.id, newCards);
            }}
            size="md" 
            scale={handScale} 
          />
        </div>
      </div>

      {/* Action bar */}
      <ActionBar
        onDrawStock={() => doMove({ kind: 'DRAW_FROM_STOCK', playerId: P1.id })}
        onDrawDiscard={() => doMove({ kind: 'DRAW_FROM_DISCARD', playerId: P1.id })}
        onLayOpen={layOpen}
        onLayMeld={layMeld}
        onDiscard={discardOne}
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
  );
}
