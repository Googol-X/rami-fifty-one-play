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
import { validateMeld, canExtendMeld, hasSetInMelds, computeDeadwood } from '@/utils/validation';
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

    // Ajouter la carte à la meld
    const newHand = player.hand.filter((_, i) => i !== cardIndex);
    
    if (owner === 'player') {
      const newLaid = [...player.laid];
      newLaid[meldIndex] = [...newLaid[meldIndex], card];
      setPlayer(prev => ({
        ...prev,
        hand: newHand,
        laid: newLaid,
        score: prev.score + RANK_VALUES[card.rank]
      }));
    } else {
      const newLaid = [...bot.laid];
      newLaid[meldIndex] = [...newLaid[meldIndex], card];
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

    // Vérifier si le joueur a vidé sa main
    if (player.hand.length === 0) {
      setTimeout(() => checkRoundEnd({ ...player, hand: [] }, false), 300);
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

    // Bloquer la défausse si le panier n'est pas vide
    if (pendingMelds.length > 0) {
      toast({ 
        title: "Panier non validé", 
        description: "Validez ou videz votre panier avant de défausser", 
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
        const newHand = [...bot.hand, drawnCard];
        
        // Tenter de déposer des combinaisons
        const combos = findValidCombos(newHand);
        let handAfterLay = [...newHand];
        let totalPoints = 0;
        
        for (const combo of combos) {
          const validation = validateMeld(combo);
          if (!validation.valid) continue;
          
          const points = validation.points || 0;
          
          // Vérifier seuil 51 pour dépôt initial
          if (!botHasInitialMeld && points < 51) continue;
          
          totalPoints += points;
          handAfterLay = handAfterLay.filter(c => !combo.some(cc => cc.id === c.id));
          
          setBot(prev => ({
            ...prev,
            hand: handAfterLay,
            laid: [...prev.laid, combo],
            score: prev.score + points
          }));
          
          if (!botHasInitialMeld) setBotHasInitialMeld(true);
          break; // Une combo à la fois
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <div className="w-full" role="region" aria-label="Main du Bot">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Main du Bot ({bot.hand.length} cartes)
                </h3>
                <div className="flex gap-2 justify-center md:justify-start">
                  {bot.hand.map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-24 rounded-lg border-2 border-border bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center"
                      aria-label={`Carte cachée ${index + 1}`}
                    >
                      <span className="text-3xl text-muted-foreground">🂠</span>
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

              <div className="w-full">
                <h3 className="text-lg font-semibold text-foreground mb-3">Votre main</h3>
                <HandReorder
                  hand={player.hand}
                  selected={selectedCards}
                  onToggle={handleCardClick}
                  onReorder={(newHand) => setPlayer(prev => ({ ...prev, hand: newHand }))}
                />
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
                selectedCount={selectedCards.length}
                onLayCombo={addSelectedMeld}
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
                    Minimum <span className="font-bold text-foreground">51 points</span> + au moins <span className="font-bold text-foreground">une série</span> (3+ même rang)
                  </p>
                </div>
              )}

              {/* Melds du joueur */}
              {player.laid.length > 0 && (
                <div className="bg-secondary/30 rounded-xl p-4 border-2 border-border">
                  <h3 className="text-lg font-semibold mb-3">Vos combinaisons</h3>
                  {player.laid.map((combo, i) => {
                    const validation = validateMeld(combo);
                    return (
                      <div key={i} className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Combo {i + 1} ({validation.type === 'set' ? 'Série' : 'Suite'}) • {validation.points} pts
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (pendingMelds.length > 0) {
                                toast({
                                  title: "Panier non vide",
                                  description: "Validez ou videz votre panier avant d'ajouter des cartes aux combinaisons déposées",
                                  variant: "destructive"
                                });
                                return;
                              }
                              setExtendingMeld({ owner: 'player', index: i });
                            }}
                            disabled={!hasDrawn || extendingMeld !== null || roundOver}
                            className="h-6 text-xs"
                          >
                            + Ajouter
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {combo.map((card, cardIdx) => (
                            <Card key={card.id} card={card} className="w-12 h-16 text-xs" />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Melds du bot */}
              {bot.laid.length > 0 && (
                <div className="bg-secondary/30 rounded-xl p-4 border-2 border-border">
                  <h3 className="text-lg font-semibold mb-3">Combinaisons du bot</h3>
                  {bot.laid.map((combo, i) => {
                    const validation = validateMeld(combo);
                    return (
                      <div key={i} className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Combo {i + 1} ({validation.type === 'set' ? 'Série' : 'Suite'}) • {validation.points} pts
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (pendingMelds.length > 0) {
                                toast({
                                  title: "Panier non vide",
                                  description: "Validez ou videz votre panier avant d'ajouter des cartes aux combinaisons déposées",
                                  variant: "destructive"
                                });
                                return;
                              }
                              setExtendingMeld({ owner: 'bot', index: i });
                            }}
                            disabled={!hasDrawn || extendingMeld !== null || roundOver}
                            className="h-6 text-xs"
                          >
                            + Ajouter
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {combo.map((card, cardIdx) => (
                            <Card key={card.id} card={card} className="w-12 h-16 text-xs" />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
