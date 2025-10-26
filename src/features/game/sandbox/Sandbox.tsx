import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import type { Move } from '@/types/game';
import { Hand } from '../ui/Hand';
import { Table } from '../ui/Table';
import { PlayersArea } from '../ui/PlayersArea';
import { ActionBar } from '../ui/ActionBar';
import { Scoreboard } from '../ui/Scoreboard';
import { BotDifficulty as BotDifficultyPanel } from '../ui/BotDifficulty';
import { OrientationGuard } from '@/components/OrientationGuard';
import { AdvancedBotAI, BotDifficulty } from '@/utils/advancedBotAI';
import { RoundScore } from '@/components/RoundScore';
import { GameOver } from '@/components/GameOver';
import { RANK_VALUES } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { LandscapeOnly } from '@/components/LandscapeOnly';

const P1 = { id: 'p1', displayName: 'Toi' };
const P2 = { id: 'p2', displayName: 'Bot' };

type MeldKind = 'set' | 'run';

// Instance de l'IA avancée
const botAI = new AdvancedBotAI('medium');

export default function Sandbox() {
  const { state, deck, initLocal, dispatch, reorderHand } = useGame();
  const { toast } = useToast();
  const [meldKind, setMeldKind] = React.useState<MeldKind>('run');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [handScale, setHandScale] = React.useState(0.88);
  const [playersCount, setPlayersCount] = React.useState(2);
  const [roundNumber, setRoundNumber] = React.useState(1);
  const [botDifficulty, setBotDifficulty] = React.useState<BotDifficulty>('medium');
  const [isBotThinking, setIsBotThinking] = React.useState(false);
  const [showBot, setShowBot] = React.useState(true);
  const [botStarted, setBotStarted] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  
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

  // Reset bot panel when game state changes
  React.useEffect(() => {
    setShowBot(true);
  }, [state?.id]);

  // Responsive window width tracking
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Update bot difficulty
  React.useEffect(() => {
    if (botStarted) {
      botAI.setDifficulty(botDifficulty);
    }
  }, [botDifficulty, botStarted]);
  
  const pick = (level: BotDifficulty) => {
    setShowBot(false);
    setBotDifficulty(level);
    setBotStarted(true); // bot: draw -> try meld -> discard
  };

  // Bot AI automatic turn
  React.useEffect(() => {
    if (!state || !botStarted || state.activePlayer !== P2.id || isBotThinking || showRoundScore || showGameOver) return;
    
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
  }, [state, dispatch, deck, botDifficulty, isBotThinking, showRoundScore, showGameOver, botAI, botStarted]);

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
    try {
      dispatch(move);
      if (move.kind === 'END_TURN') {
        setRoundNumber(prev => prev + 1);
      }
      setSelected(new Set());
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

  const layOpen = () => {
    if (selected.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_OPEN', playerId: P1.id, melds: [meld] } as Move);
  };

  const layMeld = () => {
    if (selected.size < 3) {
      toast({
        title: 'Sélection insuffisante',
        description: 'Sélectionnez au moins 3 cartes',
        variant: 'destructive',
      });
      return;
    }
    const meld = { type: meldKind, cards: Array.from(selected) } as any;
    doMove({ kind: 'LAY_MELD', playerId: P1.id, meld } as Move);
  };

  const discardOne = () => {
    const [first] = Array.from(selected);
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

  const handleAddToMeld = (meldId: string) => {
    if (!me.hasOpened) {
      toast({
        title: 'Action impossible',
        description: 'Vous devez d\'abord ouvrir avec 51 points',
        variant: 'destructive',
      });
      return;
    }
    
    if (selected.size === 0) {
      toast({
        title: 'Aucune carte sélectionnée',
        description: 'Sélectionnez au moins une carte à ajouter',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Add each selected card to the meld
      const cards = Array.from(selected);
      for (const cardId of cards) {
        doMove({ 
          kind: 'ADD_TO_MELD', 
          playerId: P1.id, 
          meldId, 
          cardId 
        } as Move);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter les cartes',
        variant: 'destructive',
      });
    }
  };

  return (
    <LandscapeOnly>
      <OrientationGuard>
        <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Scoreboard */}
      <Scoreboard
        meldsCount={state.melds.length}
        stockCount={state.piles.draw.length}
        roundNumber={roundNumber}
        onQuit={() => window.location.href = '/'}
      />

      {/* Bot difficulty selector */}
      {showBot && (
        <BotDifficultyPanel onSelect={pick} />
      )}

      {/* Main game table */}
      <div className="pt-16 h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <Table
            state={state}
            deck={deck}
            currentPlayerId={P1.id}
            onDrawStock={handleDrawStock}
            onDrawDiscard={handleDrawDiscard}
          />
        </div>
        
        {/* Players melds area */}
        <PlayersArea
          state={state}
          deck={deck}
          currentPlayerId={P1.id}
          selectedCards={selected}
          onAddToMeld={handleAddToMeld}
        />
      </div>

      {/* Player's hand - WSOP style sticky bottom */}
      <div className="fixed bottom-[60px] md:bottom-[72px] left-0 right-0 z-30 pointer-events-none">
        <div className="container mx-auto px-2 md:px-4">
          <div className="bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-md rounded-t-3xl border-t-2 border-x-2 border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] pointer-events-auto">
            <div className="flex items-center justify-between px-3 md:px-4 py-1.5 md:py-2 border-b border-primary/10">
              <h3 className="text-xs md:text-base font-bold text-primary flex items-center gap-2">
                <span className="text-lg md:text-xl">🎴</span>
                <span className="hidden sm:inline">Ta main</span>
                <span className="sm:inline md:hidden">Main</span>
                <span className="text-muted-foreground">({me.hand.length})</span>
              </h3>
              <div className="flex items-center gap-2 md:gap-6">
                <div className="hidden md:flex items-center gap-2 md:gap-3 bg-secondary/30 rounded-lg px-2 md:px-3 py-1 md:py-1.5 border border-primary/20">
                  <label className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="radio" 
                      name="meld" 
                      checked={meldKind==='run'} 
                      onChange={()=>setMeldKind('run')}
                      className="accent-primary" 
                    />
                    <span>Suite</span>
                  </label>
                  <label className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="radio" 
                      name="meld" 
                      checked={meldKind==='set'} 
                      onChange={()=>setMeldKind('set')}
                      className="accent-primary" 
                    />
                    <span>Brelan</span>
                  </label>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <span className="text-[11px] opacity-80">Zoom</span>
                  <input 
                    type="range" 
                    min={0.75} 
                    max={1.15} 
                    step={0.05}
                    value={handScale}
                    onChange={(e) => setHandScale(parseFloat(e.target.value))}
                    style={{ accentColor: '#FFD54A' }}
                    className="w-16 md:w-28 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="px-1 md:px-2 py-2 md:py-3">
              <Hand 
                cards={me.hand} 
                deck={deck} 
                selected={selected} 
                onToggle={toggle}
                onReorder={(newCards) => {
                  reorderHand(P1.id, newCards);
                }}
                radius={280}
                spread={68}
                overlap={48}
                scale={handScale}
                size="md" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <ActionBar
        onDrawStock={handleDrawStock}
        onDrawDiscard={handleDrawDiscard}
        onLayOpen={layOpen}
        onLayMeld={layMeld}
        onDiscard={discardOne}
        onEndTurn={() => doMove({ kind: 'END_TURN', playerId: P1.id })}
        hasOpened={me.hasOpened}
        canAct={isMyTurn}
        deck={deck}
        topDiscard={state.piles.discard.at(-1)}
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
    </LandscapeOnly>
  );
}
