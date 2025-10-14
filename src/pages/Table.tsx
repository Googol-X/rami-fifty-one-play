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
import { GameHand } from '@/components/GameHand';
import { GamePile } from '@/components/GamePile';
import { GameScore } from '@/components/GameScore';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

export default function Table() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Créer et mélanger le paquet avec seed aléatoire
    const shuffled = shuffleDeck(createDeck(), Date.now());
    
    // Distribuer 7 cartes au joueur
    const [playerHand, afterPlayer] = deal(shuffled, 7);
    
    // Distribuer 7 cartes au bot
    const [botHand, afterBot] = deal(afterPlayer, 7);
    
    // Première carte de la défausse
    const [firstDiscard, remaining] = draw(afterBot);
    
    setPlayer(prev => ({ ...prev, hand: playerHand, laid: [], score: 0 }));
    setBot(prev => ({ ...prev, hand: botHand, laid: [], score: 0 }));
    setDiscardPile(firstDiscard ? [firstDiscard] : []);
    setDrawPile(remaining);
    setSelectedCards([]);
    setHasDrawn(false);
    setGameOver(false);
    
    console.log('🎲 Nouvelle partie initialisée:', {
      pioche: remaining.length,
      défausse: firstDiscard?.id,
      joueur: playerHand.length,
      bot: botHand.length
    });
  };

  const handleDrawCard = () => {
    if (hasDrawn || gameOver) return;
    
    const [drawnCard, newDrawPile] = draw(drawPile);
    
    if (!drawnCard) {
      toast({ title: "Pioche vide", description: "Aucune carte à piocher" });
      return;
    }

    setPlayer(prev => ({ ...prev, hand: [...prev.hand, drawnCard] }));
    setDrawPile(newDrawPile);
    setHasDrawn(true);
    toast({ title: "Carte piochée", description: `Vous avez pioché ${drawnCard.rank}${drawnCard.suit}` });
  };

  const handlePickDiscard = () => {
    if (hasDrawn || gameOver) return;
    
    const [pickedCard, newDiscardPile] = pickFromDiscard(discardPile);
    
    if (!pickedCard) {
      toast({ title: "Défausse vide", description: "Aucune carte à récupérer" });
      return;
    }

    setPlayer(prev => ({ ...prev, hand: [...prev.hand, pickedCard] }));
    setDiscardPile(newDiscardPile);
    setHasDrawn(true);
    toast({ title: "Défausse récupérée", description: `Vous avez pris ${pickedCard.rank}${pickedCard.suit}` });
  };

  const handleCardClick = (index: number) => {
    if (!hasDrawn || gameOver) return;
    
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
  };

  const handleLayCombo = () => {
    if (selectedCards.length < 3 || gameOver) {
      toast({ title: "Combinaison invalide", description: "Sélectionnez au moins 3 cartes", variant: "destructive" });
      return;
    }

    const combo = selectedCards.map(i => player.hand[i]);
    const points = combo.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);

    setPlayer(prev => ({
      ...prev,
      hand: prev.hand.filter((_, i) => !selectedCards.includes(i)),
      laid: [...prev.laid, combo],
      score: prev.score + points
    }));

    setSelectedCards([]);
    toast({ title: "Combinaison déposée", description: `+${points} points` });

    if (player.score + points >= 51) {
      setGameOver(true);
      toast({ title: "🎉 Victoire !", description: "Vous avez atteint 51 points !" });
    }
  };

  const handleDiscard = () => {
    if (selectedCards.length !== 1) {
      toast({ title: "Sélection invalide", description: "Sélectionnez exactement 1 carte à défausser", variant: "destructive" });
      return;
    }

    const discardedCard = player.hand[selectedCards[0]];
    const newDiscardPile = addToDiscard(discardPile, discardedCard);
    
    setPlayer(prev => ({
      ...prev,
      hand: prev.hand.filter((_, i) => i !== selectedCards[0])
    }));
    setDiscardPile(newDiscardPile);
    setSelectedCards([]);
    setHasDrawn(false);
    toast({ title: "Carte défaussée", description: "Tour terminé" });

    setTimeout(botTurn, 1000);
  };

  const botTurn = () => {
    if (gameOver) return;
    
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
          
          setDiscardPile(p => addToDiscard(p, discardedCard));
          
          return {
            ...prev,
            hand: newHand.filter((_, i) => i !== randomIndex)
          };
        });
      }, 500);
    }
  };

  return (
    <Layout gameInProgress={!gameOver && (player.hand.length > 0 || bot.hand.length > 0)}>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end items-center mb-6">
            <Button onClick={initGame} variant="outline">
              Nouvelle partie
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

              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleLayCombo} disabled={!hasDrawn || selectedCards.length < 3}>
                  Déposer combinaison ({selectedCards.length})
                </Button>
                <Button onClick={handleDiscard} disabled={!hasDrawn || selectedCards.length !== 1} variant="secondary">
                  Défausser et finir le tour
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <GameScore playerScore={player.score} botScore={bot.score} />
              
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
