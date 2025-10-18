import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Zap } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';

/**
 * STORE PANEL - Boutique in-app
 * 
 * TODO (Phase 3):
 * - Intégration Apple/Google Store
 * - Gestion des abonnements
 * - Achats consommables (coins, boosts)
 * - Skins premium
 * - Packs de démarrage
 * - Système de récompenses
 */

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: string;
  type: 'subscription' | 'consumable' | 'skin';
  featured?: boolean;
}

export const StorePanel = () => {
  const { isPremium, purchasePremium } = usePremium();

  const items: StoreItem[] = [
    {
      id: 'premium_monthly',
      name: 'Rami Premium',
      description: 'Accès illimité, sans pub, skins exclusifs',
      price: '4.99€/mois',
      type: 'subscription',
      featured: true,
    },
    {
      id: 'coins_pack_1',
      name: 'Pack 100 Coins',
      description: 'Monnaie du jeu pour débloquer des items',
      price: '0.99€',
      type: 'consumable',
    },
    {
      id: 'skin_royal',
      name: 'Skin Royal',
      description: 'Table et cartes au design royal',
      price: '2.99€',
      type: 'skin',
    },
  ];

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">
          <Crown className="inline h-5 w-5 mr-2 text-primary" />
          Boutique
        </h3>
        <p className="text-sm text-muted-foreground">
          Améliorez votre expérience de jeu
        </p>
      </div>

      {isPremium && (
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-4 text-center">
          <Crown className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="font-semibold">Vous êtes Premium !</p>
          <p className="text-xs text-muted-foreground mt-1">
            Merci de votre soutien 🎉
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className={`p-4 ${item.featured ? 'border-2 border-primary' : ''}`}
          >
            {item.featured && (
              <Badge className="mb-2 bg-gradient-to-r from-primary to-primary/60">
                <Sparkles className="h-3 w-3 mr-1" />
                Recommandé
              </Badge>
            )}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
              {item.type === 'subscription' && (
                <Crown className="h-5 w-5 text-primary ml-2" />
              )}
              {item.type === 'consumable' && (
                <Zap className="h-5 w-5 text-accent ml-2" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {item.price}
              </span>
              <Button 
                size="sm"
                disabled={item.type === 'subscription' && isPremium}
                onClick={item.type === 'subscription' ? purchasePremium : undefined}
              >
                {item.type === 'subscription' && isPremium ? 'Actif' : 'Acheter'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Boutique en développement - Paiements non actifs
      </p>
    </Card>
  );
};
