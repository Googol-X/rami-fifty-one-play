import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card as CardType, Player, RANK_VALUES } from '@/types/game';
import { createDeck, shuffleDeck } from '@/utils/deck';
import { GameHand } from '@/components/GameHand';
import { GamePile } from '@/components/GamePile';
import { GameScore } from '@/components/GameScore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

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
    const deck = shuffleDeck(createDeck(), Date.now());
    const playerHand = deck.slice(0, 7);
    const botHand = deck.slice(7, 14);
    const discard = [deck[14]];
    const draw = deck.slice(15);

    setPlayer(prev => ({ ...prev, hand: playerHand, laid: [], score: 0 }));
    setBot(prev => ({ ...prev, hand: botHand, laid: [], score: 0 }));
    setDiscardPile(discard);
    setDrawPile(draw);
    setSelectedCards([]);
    setHasDrawn(false);
    setGameOver(false);
  };

  const handleDrawCard = () => {
    if (hasDrawn || gameOver) return;
    if (drawPile.length === 0) {
      toast({ title: "Pioche vide", description: "Aucune carte à piocher" });
      return;
    }

    const newCard = drawPile[0];
    setPlayer(prev => ({ ...prev, hand: [...prev.hand, newCard] }));
    setDrawPile(prev => prev.slice(1));
    setHasDrawn(true);
    toast({ title: "Carte piochée", description: `Vous avez pioché ${newCard.rank}${newCard.suit}` });
  };

  const handlePickDiscard = () => {
    if (hasDrawn || gameOver || discardPile.length === 0) return;

    const card = discardPile[discardPile.length - 1];
    setPlayer(prev => ({ ...prev, hand: [...prev.hand, card] }));
    setDiscardPile(prev => prev.slice(0, -1));
    setHasDrawn(true);
    toast({ title: "Défausse récupérée", description: `Vous avez pris ${card.rank}${card.suit}` });
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
    setPlayer(prev => ({
      ...prev,
      hand: prev.hand.filter((_, i) => i !== selectedCards[0])
    }));
    setDiscardPile(prev => [...prev, discardedCard]);
    setSelectedCards([]);
    setHasDrawn(false);
    toast({ title: "Carte défaussée", description: "Tour terminé" });

    setTimeout(botTurn, 1000);
  };

  const botTurn = () => {
    if (gameOver) return;
    
    setBot(prev => {
      const newHand = [...prev.hand];
      if (drawPile.length > 0) {
        const drawnCard = drawPile[0];
        newHand.push(drawnCard);
        setDrawPile(p => p.slice(1));
      }

      if (newHand.length > 0) {
        const discarded = newHand.pop()!;
        setDiscardPile(p => [...p, discarded]);
      }

      return { ...prev, hand: newHand };
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quitter
          </Button>
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
  );
}
