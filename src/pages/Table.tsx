import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card as CardType, Player, RANK_VALUES } from '@/types/game';
import { 
  createDeck, 
  shuffleDeck, 
  deal, 
  draw, 
  discard as addToDiscard,
  pickFromDiscard,
  peekDiscard 
} from '@/utils/deck';
import { validateMeld } from '@/utils/validation';
import { GameHand } from '@/components/GameHand';
import { GamePile } from '@/components/GamePile';
import { GameScore } from '@/components/GameScore';
import { GameControls } from '@/components/GameControls';
import { ComboPreview } from '@/components/ComboPreview';
import { RoundScore } from '@/components/RoundScore';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useGameScore } from '@/hooks/useGameScore';

export default function Table() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gameScore, addRound, resetGame, isGameOver: isFullGameOver, winner: gameWinner } = useGameScore();
  
  const [drawPile, setDrawPile] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    name: 'Vous',
    hand: [],
    laid: [],
    score: 0
  });
  const [bot, setBot] = useState<Player>({
    id: 'bot',
    name: 'Bot',
    hand: [],
    laid: [],
    score: 0
  });
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [roundWinner, setRoundWinner] = useState<'player' | 'bot' | null>(null);
  const [playerHasInitialMeld, setPlayerHasInitialMeld] = useState(false);
  const [botHasInitialMeld, setBotHasInitialMeld] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Créer et mélanger le paquet avec seed aléatoire
    const shuffled = shuffleDeck(createDeck(), Date.now());
    
    // Distribuer 10 cartes au joueur
    const [playerHand, afterPlayer] = deal(shuffled, 10);
    
    // Distribuer 10 cartes au bot
    const [botHand, afterBot] = deal(afterPlayer, 10);
    
    // Première carte de la défausse
    const [firstDiscard, remaining] = draw(afterBot);
    
    setPlayer(prev => ({ ...prev, hand: playerHand, laid: [], score: 0 }));
    setBot(prev => ({ ...prev, hand: botHand, laid: [], score: 0 }));
    setDiscardPile(firstDiscard ? [firstDiscard] : []);
    setDrawPile(remaining);
    setSelectedCards([]);
    setHasDrawn(false);
    setRoundOver(false);
    setRoundWinner(null);
    setPlayerHasInitialMeld(false);
    setBotHasInitialMeld(false);
    
    console.log('🎲 Nouvelle manche initialisée:', {
      pioche: remaining.length,
      défausse: firstDiscard?.id,
      joueur: playerHand.length,
      bot: botHand.length
    });
  };

  const checkRoundEnd = (currentPlayer: Player, isBot: boolean) => {
    if (currentPlayer.hand.length === 0) {
      const winner = isBot ? 'bot' : 'player';
      const loserHand = isBot ? player.hand : bot.hand;
      const penalty = loserHand.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
      
      setRoundWinner(winner);
      setRoundOver(true);
      
      // Ajouter le score de la manche
      if (winner === 'player') {
        addRound(0, penalty, 'player');
      } else {
        addRound(penalty, 0, 'bot');
      }
      
      toast({
        title: winner === 'player' ? '🎉 Manche gagnée !' : '😔 Manche perdue',
        description: `${winner === 'player' ? 'Vous avez' : 'Le bot a'} vidé sa main en premier`
      });
      
      return true;
    }
    return false;
  };

  const handleDrawCard = () => {
    if (hasDrawn || roundOver) return;
    
    const [drawnCard, newDrawPile] = draw(drawPile);
    
    if (!drawnCard) {
      toast({ 
        title: "Pioche vide", 
        description: "Aucune carte à piocher",
        variant: "destructive"
      });
      return;
    }

    setPlayer(prev => ({ ...prev, hand: [...prev.hand, drawnCard] }));
    setDrawPile(newDrawPile);
    setHasDrawn(true);
    toast({ 
      title: "✓ Carte piochée", 
      description: `${drawnCard.rank}${drawnCard.suit} ajoutée à votre main` 
    });
  };

  const handlePickDiscard = () => {
    if (hasDrawn || roundOver) return;
    
    const [pickedCard, newDiscardPile] = pickFromDiscard(discardPile);
    
    if (!pickedCard) {
      toast({ 
        title: "Défausse vide", 
        description: "Aucune carte à récupérer",
        variant: "destructive"
      });
      return;
    }

    setPlayer(prev => ({ ...prev, hand: [...prev.hand, pickedCard] }));
    setDiscardPile(newDiscardPile);
    setHasDrawn(true);
    toast({ 
      title: "✓ Défausse prise", 
      description: `${pickedCard.rank}${pickedCard.suit} ajoutée à votre main` 
    });
  };

  const handleCardClick = (index: number) => {
    if (!hasDrawn || roundOver) return;
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  const handleLayCombo = () => {
    if (!hasDrawn) {
      toast({ 
        title: "Action impossible", 
        description: "Piochez d'abord une carte", 
        variant: "destructive" 
      });
      return;
    }

    const combo = selectedCards.map(i => player.hand[i]);
    const validation = validateMeld(combo);

    if (!validation.valid) {
      toast({ 
        title: validation.error || "Combinaison invalide",
        description: validation.details,
        variant: "destructive" 
      });
      return;
    }

    const points = validation.points || 0;

    // Vérifier le seuil de 51 pour le dépôt initial
    if (!playerHasInitialMeld && points < 51) {
      toast({ 
        title: "Dépôt initial insuffisant",
        description: `Premier dépôt requis: minimum 51 points (actuellement ${points})`,
        variant: "destructive" 
      });
      return;
    }

    const newScore = player.score + points;

    const newHand = player.hand.filter((_, i) => !selectedCards.includes(i));
    
    setPlayer(prev => ({
      ...prev,
      hand: newHand,
      laid: [...prev.laid, combo],
      score: newScore
    }));

    // Marquer que le joueur a fait son dépôt initial
    if (!playerHasInitialMeld) {
      setPlayerHasInitialMeld(true);
    }

    setSelectedCards([]);
    
    const message = !playerHasInitialMeld 
      ? `🎯 Dépôt initial réussi ! ${validation.details} : +${points} points`
      : `${validation.details} : +${points} points (total: ${newScore})`;
    
    toast({ 
      title: "✓ Combinaison déposée", 
      description: message
    });

    // Vérifier si le joueur a vidé sa main
    if (newHand.length === 0) {
      setTimeout(() => checkRoundEnd({ ...player, hand: newHand }, false), 300);
    }
  };

  const handleDiscard = () => {
    if (!hasDrawn) {
      toast({ 
        title: "Action impossible", 
        description: "Piochez d'abord une carte", 
        variant: "destructive" 
      });
      return;
    }

    if (player.hand.length === 0) {
      toast({ 
        title: "Main vide", 
        description: "Vous n'avez plus de cartes", 
        variant: "destructive" 
      });
      return;
    }

    if (selectedCards.length !== 1) {
      toast({ 
        title: "Sélection invalide", 
        description: "Sélectionnez exactement 1 carte à défausser", 
        variant: "destructive" 
      });
      return;
    }

    const discardedCard = player.hand[selectedCards[0]];
    const newDiscardPile = addToDiscard(discardPile, discardedCard);
    const newHand = player.hand.filter((_, i) => i !== selectedCards[0]);
    
    setPlayer(prev => ({
      ...prev,
      hand: newHand
    }));
    setDiscardPile(newDiscardPile);
    setSelectedCards([]);
    setHasDrawn(false);
    toast({ 
      title: "✓ Tour terminé", 
      description: `${discardedCard.rank}${discardedCard.suit} défaussée` 
    });

    // Vérifier si le joueur a vidé sa main
    if (newHand.length === 0) {
      setTimeout(() => checkRoundEnd({ ...player, hand: newHand }, false), 300);
    } else {
      setTimeout(botTurn, 1000);
    }
  };

  const botTurn = () => {
    if (roundOver) return;
    
    // Le bot pioche
    const [drawnCard, newDrawPile] = draw(drawPile);
    
    if (drawnCard) {
      setDrawPile(newDrawPile);
      
      // Le bot défausse une carte aléatoire
      setTimeout(() => {
        setBot(prev => {
          const newHand = [...prev.hand, drawnCard];
          const randomIndex = Math.floor(Math.random() * newHand.length);
          const discardedCard = newHand[randomIndex];
          const finalHand = newHand.filter((_, i) => i !== randomIndex);
          
          setDiscardPile(p => addToDiscard(p, discardedCard));
          
          // Vérifier si le bot a vidé sa main
          if (finalHand.length === 0) {
            setTimeout(() => checkRoundEnd({ ...prev, hand: finalHand }, true), 300);
          }
          
          return {
            ...prev,
            hand: finalHand
          };
        });
      }, 500);
    }
  };

  return (
    <Layout gameInProgress={!roundOver && (player.hand.length > 0 || bot.hand.length > 0)}>
      {roundOver && roundWinner && (
        <RoundScore
          playerHand={player.hand}
          botHand={bot.hand}
          winner={roundWinner}
          onNextRound={initGame}
          onNewGame={() => {
            resetGame();
            initGame();
          }}
          playerTotal={gameScore.playerTotal}
          botTotal={gameScore.botTotal}
          isGameOver={isFullGameOver}
          gameWinner={gameWinner}
        />
      )}
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              Manche {gameScore.rounds.length + 1} • Score global: {gameScore.playerTotal} - {gameScore.botTotal}
            </div>
            <Button onClick={initGame} variant="outline">
              Nouvelle manche
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GameHand cards={bot.hand} title="Main du Bot (cachée)" />
              
              <GamePile
                drawPile={drawPile}
                discardPile={discardPile}
                onDrawCard={handleDrawCard}
                onPickDiscard={handlePickDiscard}
              />

              <GameHand
                cards={player.hand}
                onCardClick={handleCardClick}
                selectedIndices={selectedCards}
                title="Votre main"
              />

              <ComboPreview 
                selectedCards={selectedCards.map(i => player.hand[i])}
                hasInitialMeld={playerHasInitialMeld}
              />

              <GameControls
                hasDrawn={hasDrawn}
                selectedCount={selectedCards.length}
                onLayCombo={handleLayCombo}
                onDiscard={handleDiscard}
                disabled={roundOver}
              />
            </div>

            <div className="space-y-6">
              <GameScore playerScore={player.score} botScore={bot.score} />
              
              {!playerHasInitialMeld && (
                <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                    🎯 Dépôt initial requis
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Votre première combinaison doit totaliser au moins <span className="font-bold text-foreground">51 points</span>
                  </p>
                </div>
              )}
              
              {player.laid.length > 0 && (
                <div className="bg-secondary/30 rounded-xl p-4 border-2 border-border">
                  <h3 className="text-lg font-semibold mb-3">Vos combinaisons</h3>
                  {player.laid.map((combo, i) => (
                    <div key={i} className="text-sm text-muted-foreground mb-1">
                      Combo {i + 1}: {combo.map(c => `${c.rank}${c.suit}`).join(' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
