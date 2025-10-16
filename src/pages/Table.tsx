import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { validateMeld, canExtendMeld, hasSetInMelds, computeDeadwood, sortMeld } from '@/utils/validation';
import { findValidCombos, evaluateCardUtility } from '@/utils/botAI';
import { GameHand } from '@/components/GameHand';
import { HandReorder } from '@/components/HandReorder';
import { GamePile } from '@/components/GamePile';
import { GameScore } from '@/components/GameScore';
import { GameControls } from '@/components/GameControls';
import { ComboPreview } from '@/components/ComboPreview';
import { RoundScore } from '@/components/RoundScore';
import { LiveAnnouncer } from '@/components/LiveAnnouncer';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { useToast } from '@/hooks/use-toast';
import { useGameScore } from '@/hooks/useGameScore';
import { useMultiplayer } from '@/hooks/useMultiplayer';

export default function Table() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const { toast } = useToast();
  const { gameScore, addRound, resetGame, isGameOver: isFullGameOver, winner: gameWinner } = useGameScore();
  const { gameState, players, currentPlayerIndex, isHost, isMultiplayer, updateGameState, initializeGame } = useMultiplayer(gameId);
  
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
  const [firstDepositScore, setFirstDepositScore] = useState<number>(0); // Score du premier dépôt
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [pendingMelds, setPendingMelds] = useState<CardType[][]>([]);
  const [extendingMeld, setExtendingMeld] = useState<{ owner: 'player' | 'bot', index: number } | null>(null);

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
    setFirstDepositScore(0);
    setPendingMelds([]);
    setExtendingMeld(null);
    
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
    setLiveMessage(`Carte piochée: ${drawnCard.rank}${drawnCard.suit}. Sélectionnez des cartes pour former une combinaison ou défausser.`);
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
    setLiveMessage(`Défausse récupérée: ${pickedCard.rank}${pickedCard.suit}. Sélectionnez des cartes pour former une combinaison ou défausser.`);
    toast({ 
      title: "✓ Défausse prise", 
      description: `${pickedCard.rank}${pickedCard.suit} ajoutée à votre main` 
    });
  };

  const handleCardClick = (index: number) => {
    if (!hasDrawn || roundOver) return;
    
    // Si on est en train d'étendre une meld, gérer l'ajout
    if (extendingMeld) {
      handleExtendMeld(index);
      return;
    }
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  // Gérer l'extension d'une meld existante
  const handleExtendMeld = (cardIndex: number) => {
    if (!extendingMeld) return;

    const card = player.hand[cardIndex];
    const { owner, index: meldIndex } = extendingMeld;
    
    const targetMeld = owner === 'player' ? player.laid[meldIndex] : bot.laid[meldIndex];
    
    if (!canExtendMeld(targetMeld, card)) {
      toast({
        title: "❌ Extension invalide",
        description: "Cette carte ne peut pas être ajoutée à cette combinaison",
        variant: "destructive"
      });
      setExtendingMeld(null);
      return;
    }

    // Ajouter la carte à la meld et la trier correctement
    const newHand = player.hand.filter((_, i) => i !== cardIndex);
    
    if (owner === 'player') {
      const newLaid = [...player.laid];
      const updatedMeld = [...newLaid[meldIndex], card];
      
      // Calculer la valeur de la carte ajoutée dans le contexte du meld
      const oldValidation = validateMeld(newLaid[meldIndex]);
      const oldPoints = oldValidation.points || 0;
      
      // Trier le meld si c'est une suite
      const validation = validateMeld(updatedMeld);
      if (validation.valid && validation.type === 'run') {
        newLaid[meldIndex] = sortMeld(updatedMeld);
      } else {
        newLaid[meldIndex] = updatedMeld;
      }
      
      const newValidation = validateMeld(newLaid[meldIndex]);
      const newPoints = newValidation.points || 0;
      const pointsAdded = newPoints - oldPoints;
      
      setPlayer(prev => ({
        ...prev,
        hand: newHand,
        laid: newLaid,
        score: prev.score + pointsAdded
      }));
    } else {
      const newLaid = [...bot.laid];
      const updatedMeld = [...newLaid[meldIndex], card];
      
      // Trier le meld si c'est une suite
      const validation = validateMeld(updatedMeld);
      if (validation.valid && validation.type === 'run') {
        newLaid[meldIndex] = sortMeld(updatedMeld);
      } else {
        newLaid[meldIndex] = updatedMeld;
      }
      
      setBot(prev => ({
        ...prev,
        laid: newLaid
      }));
      setPlayer(prev => ({ ...prev, hand: newHand }));
    }

    setExtendingMeld(null);
    setLiveMessage(`✅ ${card.rank}${card.suit} ajoutée à la combinaison #${meldIndex + 1}`);
    toast({
      title: "✅ Carte ajoutée",
      description: `${card.rank}${card.suit} ajoutée à la combinaison ${owner === 'player' ? 'vôtre' : 'du bot'}`
    });
  };

  // Ajouter une combinaison au panier
  const addSelectedMeld = () => {
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
      setLiveMessage(`Erreur: ${validation.error}. ${validation.details}`);
      toast({ 
        title: validation.error || "Combinaison invalide",
        description: validation.details,
        variant: "destructive" 
      });
      return;
    }

    // Ajouter au panier et retirer de la main
    const newHand = player.hand.filter((_, i) => !selectedCards.includes(i));
    setPendingMelds(prev => [...prev, combo]);
    setPlayer(prev => ({ ...prev, hand: newHand }));
    setSelectedCards([]);
    
    const points = validation.points || 0;
    setLiveMessage(`✅ Combinaison ajoutée au panier: ${validation.details} (+${points} points)`);
    toast({ 
      title: "✅ Ajouté au panier", 
      description: `${validation.details} (+${points} points)`
    });
  };

  // Retirer la dernière combinaison du panier
  const undoLastPending = () => {
    if (pendingMelds.length === 0) return;
    
    const lastMeld = pendingMelds[pendingMelds.length - 1];
    setPendingMelds(prev => prev.slice(0, -1));
    setPlayer(prev => ({ ...prev, hand: [...prev.hand, ...lastMeld] }));
    
    setLiveMessage("↩️ Dernière combinaison annulée");
    toast({ 
      title: "↩️ Annulé", 
      description: "Dernière combinaison retirée du panier"
    });
  };

  // Vider tout le panier
  const clearPending = () => {
    if (pendingMelds.length === 0) return;
    
    const allCards = pendingMelds.flat();
    setPendingMelds([]);
    setPlayer(prev => ({ ...prev, hand: [...prev.hand, ...allCards] }));
    
    setLiveMessage("🗑️ Panier vidé");
    toast({ 
      title: "🗑️ Panier vidé", 
      description: "Toutes les combinaisons retirées"
    });
  };

  // Valider le panier (vérifier seuil 51 + série obligatoire si premier dépôt)
  const validatePending = () => {
    if (pendingMelds.length === 0) {
      toast({ 
        title: "Panier vide", 
        description: "Ajoutez au moins une combinaison", 
        variant: "destructive" 
      });
      return;
    }

    // Calculer le total de points
    const totalPoints = pendingMelds.reduce((sum, meld) => {
      const validation = validateMeld(meld);
      return sum + (validation.points || 0);
    }, 0);

    // Vérifier le seuil de 51 ET la série obligatoire pour le dépôt initial
    if (!playerHasInitialMeld) {
      if (totalPoints < 51) {
        toast({ 
          title: "❌ Dépôt initial insuffisant",
          description: `Premier dépôt requis: minimum 51 points (actuellement ${totalPoints} points)`,
          variant: "destructive" 
        });
        return;
      }

      // Vérifier la présence d'au moins une série
      if (!hasSetInMelds(pendingMelds)) {
        toast({ 
          title: "❌ Série obligatoire manquante",
          description: `Premier dépôt requis: total ≥51 OK (${totalPoints} pts) mais au moins une série (3+ même rang) est obligatoire`,
          variant: "destructive" 
        });
        return;
      }

      // Si l'adversaire a déjà déposé, on doit dépasser son score
      if (botHasInitialMeld && totalPoints <= firstDepositScore) {
        toast({ 
          title: "❌ Score insuffisant",
          description: `Vous devez dépasser le score du bot (${firstDepositScore} points). Vous avez ${totalPoints} points.`,
          variant: "destructive" 
        });
        return;
      }
    }

    // Valider: déplacer dans yourMelds et mettre à jour le score
    const newScore = player.score + totalPoints;
    setPlayer(prev => ({
      ...prev,
      laid: [...prev.laid, ...pendingMelds],
      score: newScore
    }));

    if (!playerHasInitialMeld) {
      setPlayerHasInitialMeld(true);
    }

    setPendingMelds([]);
    
    const message = !playerHasInitialMeld 
      ? `🎯 Dépôt initial validé ! ${totalPoints} points (${pendingMelds.length} combinaisons)`
      : `🎯 Dépôt validé ! +${totalPoints} points (total: ${newScore})`;
    
    setLiveMessage(message);
    toast({ 
      title: "🎯 Validé", 
      description: message
    });
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

    // Bloquer la défausse si le panier n'est pas vide
    if (pendingMelds.length > 0) {
      toast({ 
        title: "Panier non validé", 
        description: "Validez ou videz votre panier avant de défausser", 
        variant: "destructive" 
      });
      return;
    }

    // Si le joueur n'a qu'une seule carte et qu'elle n'est pas sélectionnée, l'auto-sélectionner
    let cardIndex: number;
    if (player.hand.length === 1 && selectedCards.length === 0) {
      cardIndex = 0;
    } else if (selectedCards.length !== 1) {
      toast({ 
        title: "Sélection invalide", 
        description: "Sélectionnez exactement 1 carte à défausser", 
        variant: "destructive" 
      });
      return;
    } else {
      cardIndex = selectedCards[0];
    }
    
    const discardedCard = player.hand[cardIndex];
    
    if (!discardedCard) {
      toast({ 
        title: "Erreur", 
        description: "Carte invalide. Veuillez sélectionner une carte de votre main.", 
        variant: "destructive" 
      });
      setSelectedCards([]);
      return;
    }
    const newDiscardPile = addToDiscard(discardPile, discardedCard);
    const newHand = player.hand.filter((_, i) => i !== selectedCards[0]);
    
    setPlayer(prev => ({
      ...prev,
      hand: newHand
    }));
    setDiscardPile(newDiscardPile);
    setSelectedCards([]);
    setHasDrawn(false);
    setLiveMessage(`Carte ${discardedCard.rank}${discardedCard.suit} défaussée. Tour du bot.`);
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
    
    setTimeout(() => {
      // Décider pioche ou défausse
      const topDiscard = discardPile[discardPile.length - 1];
      let shouldPickDiscard = false;
      
      if (topDiscard) {
        const utility = evaluateCardUtility(topDiscard, bot.hand);
        shouldPickDiscard = utility > 15; // Seuil arbitraire
      }
      
      // Piocher
      const [drawnCard, newDrawPile] = shouldPickDiscard && topDiscard
        ? [topDiscard, drawPile]
        : draw(drawPile);
      
      if (!drawnCard) return;
      
      setDrawPile(newDrawPile);
      if (shouldPickDiscard) {
        setDiscardPile(prev => prev.slice(0, -1));
      }
      
      setTimeout(() => {
        let newHand = [...bot.hand, drawnCard];
        
        // 1. Essayer d'ajouter des cartes aux dépôts existants
        const allMelds = [...player.laid, ...bot.laid];
        let cardsAdded = 0;
        
        for (const card of [...newHand]) {
          for (let i = 0; i < allMelds.length; i++) {
            if (canExtendMeld(allMelds[i], card)) {
              // Ajouter la carte au dépôt
              newHand = newHand.filter(c => c.id !== card.id);
              
              if (i < player.laid.length) {
                // Ajouter au dépôt du joueur
                setPlayer(prev => {
                  const newLaid = [...prev.laid];
                  const updatedMeld = [...newLaid[i], card];
                  const validation = validateMeld(updatedMeld);
                  if (validation.valid && validation.type === 'run') {
                    newLaid[i] = sortMeld(updatedMeld);
                  } else {
                    newLaid[i] = updatedMeld;
                  }
                  return { ...prev, laid: newLaid };
                });
              } else {
                // Ajouter à son propre dépôt
                setBot(prev => {
                  const newLaid = [...prev.laid];
                  const botMeldIndex = i - player.laid.length;
                  const updatedMeld = [...newLaid[botMeldIndex], card];
                  const validation = validateMeld(updatedMeld);
                  if (validation.valid && validation.type === 'run') {
                    newLaid[botMeldIndex] = sortMeld(updatedMeld);
                  } else {
                    newLaid[botMeldIndex] = updatedMeld;
                  }
                  return { ...prev, laid: newLaid };
                });
              }
              cardsAdded++;
              break; // Une carte ajoutée, passer à la suivante
            }
          }
        }
        
        // Mettre à jour la main du bot après les ajouts
        setBot(prev => ({ ...prev, hand: newHand }));
        
        // 2. Tenter de déposer des combinaisons
        const combos = findValidCombos(newHand);
        let handAfterLay = [...newHand];
        let totalPoints = 0;
        let depositedCombos: CardType[][] = [];
        
        for (const combo of combos) {
          const validation = validateMeld(combo);
          if (!validation.valid) continue;
          
          const points = validation.points || 0;
          
          // Vérifier pour dépôt initial
          if (!botHasInitialMeld) {
            // Doit avoir >= 51 points
            if (points < 51) continue;
            
            // Doit avoir au moins une série
            if (!hasSetInMelds([combo])) continue;
            
            // Si le joueur a déjà déposé, doit dépasser son score
            if (playerHasInitialMeld && points <= firstDepositScore) continue;
          }
          
          totalPoints += points;
          handAfterLay = handAfterLay.filter(c => !combo.some(cc => cc.id === c.id));
          depositedCombos.push(combo);
          
          if (!botHasInitialMeld) {
            setBotHasInitialMeld(true);
            // Si c'est le premier dépôt de la manche, enregistrer le score
            if (!playerHasInitialMeld) {
              setFirstDepositScore(totalPoints);
            }
          }
          break; // Une combo à la fois
        }
        
        if (depositedCombos.length > 0) {
          setBot(prev => ({
            ...prev,
            hand: handAfterLay,
            laid: [...prev.laid, ...depositedCombos],
            score: prev.score + totalPoints
          }));
        }
        
        // Défausser carte la moins utile
        if (handAfterLay.length > 0) {
          const utilities = handAfterLay.map(c => ({ card: c, utility: evaluateCardUtility(c, handAfterLay) }));
          utilities.sort((a, b) => a.utility - b.utility);
          const toDiscard = utilities[0].card;
          const finalHand = handAfterLay.filter(c => c.id !== toDiscard.id);
          
          setBot(prev => ({ ...prev, hand: finalHand }));
          setDiscardPile(p => [...p, toDiscard]);
          
          if (finalHand.length === 0) {
            setTimeout(() => checkRoundEnd({ ...bot, hand: finalHand }, true), 300);
          }
        }
      }, Math.random() * 400 + 400);
    }, Math.random() * 400 + 400);
  };

  return (
    <Layout gameInProgress={!roundOver && (player.hand.length > 0 || bot.hand.length > 0)}>
      <LiveAnnouncer message={liveMessage} />
      
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
            <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Manche {gameScore.rounds.length + 1} • Score global: {gameScore.playerTotal} - {gameScore.botTotal}
              {!hasDrawn && !roundOver && (
                <span className="ml-2 text-primary font-medium">• À vous de jouer</span>
              )}
            </div>
            <Button 
              onClick={initGame} 
              variant="outline"
              aria-label="Commencer une nouvelle manche"
            >
              Nouvelle manche
            </Button>
          </div>

          {/* Mode multijoueur - Liste des joueurs */}
          {isMultiplayer && (
            <div className="mb-6 bg-accent/10 border-2 border-accent/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                👥 Joueurs connectés ({players.length}/4)
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {players.map((p: any) => (
                  <div key={p.player_id} className="flex items-center gap-2 bg-background/50 rounded-lg p-2">
                    <span className="text-sm font-medium">{p.profiles.username}</span>
                    {p.player_index === currentPlayerIndex && (
                      <span className="text-xs text-primary">(Vous)</span>
                    )}
                  </div>
                ))}
              </div>
              {isHost && players.length < 2 && (
                <p className="text-xs text-muted-foreground">
                  En attente d'autres joueurs... (minimum 2 joueurs requis)
                </p>
              )}
              {isHost && players.length >= 2 && !gameState && (
                <Button onClick={() => {
                  const shuffled = shuffleDeck(createDeck(), Date.now());
                  const hands: { [key: number]: CardType[] } = {};
                  let remaining = shuffled;
                  
                  players.forEach((p: any) => {
                    const [hand, afterDeal] = deal(remaining, 10);
                    hands[p.player_index] = hand;
                    remaining = afterDeal;
                  });
                  
                  const [firstDiscard, deck] = draw(remaining);
                  
                  initializeGame({
                    deck,
                    discard_pile: firstDiscard ? [firstDiscard] : [],
                    player_hands: hands,
                    player_melds: {},
                    current_turn: 0,
                    phase: 'draw',
                    last_action: 'Partie démarrée',
                  });
                }} className="w-full">
                  Démarrer la partie
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {/* Zone du Bot */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                  🤖 Bot
                  <span className="text-sm font-normal text-muted-foreground">({bot.hand.length} cartes en main)</span>
                </h3>
                
                {/* Dépôts du Bot */}
                {bot.laid.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">Dépôts :</h4>
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                      {bot.laid.map((combo, i) => {
                        const validation = validateMeld(combo);
                        return (
                          <div key={i} className="bg-white/60 dark:bg-background/40 rounded-lg p-1.5 border border-red-200 dark:border-red-700 flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {validation.type === 'set' ? '🎯' : '📊'} {validation.points}pts
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (pendingMelds.length > 0) {
                                    toast({
                                      title: "Panier non vide",
                                      description: "Validez ou videz votre panier avant d'ajouter des cartes",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  setExtendingMeld({ owner: 'bot', index: i });
                                }}
                                disabled={!hasDrawn || extendingMeld !== null || roundOver}
                                className="h-5 px-2 text-[10px]"
                              >
                                +
                              </Button>
                            </div>
                            <div className="flex gap-0.5">
                              {combo.map((card) => (
                                <Card key={card.id} card={card} className="w-8 h-12" />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main cachée du Bot */}
                <div className="flex gap-2 flex-wrap">
                  {bot.hand.map((_, index) => (
                    <div
                      key={index}
                      className="w-14 h-20 rounded-lg border-2 border-red-300 dark:border-red-700 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 flex items-center justify-center shadow-md"
                      aria-label={`Carte cachée ${index + 1}`}
                    >
                      <span className="text-2xl">🂠</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <GamePile
                drawPile={drawPile}
                discardPile={discardPile}
                onDrawCard={handleDrawCard}
                onPickDiscard={handlePickDiscard}
              />

              {/* Zone du Joueur */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                  👤 Vous
                  <span className="text-sm font-normal text-muted-foreground">({player.hand.length} cartes en main)</span>
                </h3>
                
                {/* Dépôts du Joueur */}
                {player.laid.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Vos dépôts :</h4>
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                      {player.laid.map((combo, i) => {
                        const validation = validateMeld(combo);
                        return (
                          <div key={i} className="bg-white/60 dark:bg-background/40 rounded-lg p-1.5 border border-blue-200 dark:border-blue-700 flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {validation.type === 'set' ? '🎯' : '📊'} {validation.points}pts
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (pendingMelds.length > 0) {
                                    toast({
                                      title: "Panier non vide",
                                      description: "Validez ou videz votre panier avant d'ajouter des cartes",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  setExtendingMeld({ owner: 'player', index: i });
                                }}
                                disabled={!hasDrawn || extendingMeld !== null || roundOver}
                                className="h-5 px-2 text-[10px]"
                              >
                                +
                              </Button>
                            </div>
                            <div className="flex gap-0.5">
                              {combo.map((card) => (
                                <Card key={card.id} card={card} className="w-8 h-12" />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main du Joueur */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Votre main :</h4>
                  <HandReorder
                    hand={player.hand}
                    selected={selectedCards}
                    onToggle={handleCardClick}
                    onReorder={(newHand) => setPlayer(prev => ({ ...prev, hand: newHand }))}
                  />
                </div>
              </div>

              <ComboPreview 
                selectedCards={selectedCards.map(i => player.hand[i])}
                hasInitialMeld={playerHasInitialMeld}
              />

              {/* Panier de dépôts */}
              {pendingMelds.length > 0 && (
                <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      🧺 Panier de dépôt
                    </h3>
                    <span className="text-sm font-medium text-primary">
                      {pendingMelds.reduce((sum, meld) => {
                        const validation = validateMeld(meld);
                        return sum + (validation.points || 0);
                      }, 0)} points
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {pendingMelds.map((meld, i) => {
                      const validation = validateMeld(meld);
                      return (
                        <div key={i} className="bg-background/50 rounded-lg p-2 text-sm">
                          <span className="text-muted-foreground">Combo {i + 1}: </span>
                          {meld.map(c => `${c.rank}${c.suit}`).join(' ')}
                          <span className="ml-2 text-xs text-primary">
                            (+{validation.points} pts)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={validatePending} 
                      size="sm"
                      className="flex-1"
                      aria-label="Valider le panier de dépôts"
                    >
                      🎯 Valider
                    </Button>
                    <Button 
                      onClick={undoLastPending} 
                      size="sm"
                      variant="outline"
                      aria-label="Annuler la dernière combinaison"
                    >
                      ↩️ Annuler
                    </Button>
                    <Button 
                      onClick={clearPending} 
                      size="sm"
                      variant="destructive"
                      aria-label="Vider tout le panier"
                    >
                      🗑️ Vider
                    </Button>
                  </div>
                </div>
              )}

              <GameControls
                hasDrawn={hasDrawn}
                selectedCount={player.hand.length === 1 && selectedCards.length === 0 ? 1 : selectedCards.length}
                onLayCombo={addSelectedMeld}
                onDiscard={handleDiscard}
                disabled={roundOver}
              />
            </div>

            <div className="space-y-6">
              <GameScore playerScore={player.score} botScore={bot.score} />

              {/* Message mode extension */}
              {extendingMeld && (
                <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary">
                      📌 Mode extension activé
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExtendingMeld(null)}
                      className="h-6 text-xs"
                    >
                      Annuler
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur une carte de votre main pour l'ajouter à la combo {extendingMeld.index + 1} ({extendingMeld.owner === 'player' ? 'vôtre' : 'du bot'})
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
