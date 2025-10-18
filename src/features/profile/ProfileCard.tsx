import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, TrendingUp } from 'lucide-react';

/**
 * PROFILE CARD - Profil joueur avec stats
 * 
 * TODO (Phase 2):
 * - Avatar personnalisable
 * - Stats détaillées (victoires, défaites, ratio)
 * - Progression par niveau
 * - Badges / Achievements
 * - Historique des parties
 * - Premium: Cadres d'avatar exclusifs
 */

interface ProfileStats {
  level: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  points: number;
}

export const ProfileCard = () => {
  // TODO: Charger depuis backend
  const stats: ProfileStats = {
    level: 1,
    wins: 0,
    losses: 0,
    winRate: 0,
    rank: 'Débutant',
    points: 0,
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Avatar & Nom */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-4 border-primary">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
            J
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold">Joueur</h3>
          <Badge variant="secondary" className="mt-1">
            <Trophy className="h-3 w-3 mr-1" />
            {stats.rank}
          </Badge>
        </div>
      </div>

      {/* Niveau & Progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Niveau {stats.level}</span>
          <span className="font-semibold">{stats.points} / 1000 XP</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
            style={{ width: `${(stats.points / 1000) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{stats.wins}</div>
          <div className="text-xs text-muted-foreground">Victoires</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive">{stats.losses}</div>
          <div className="text-xs text-muted-foreground">Défaites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.winRate}%</div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Button className="w-full" variant="outline" disabled>
          <Star className="mr-2 h-4 w-4" />
          Achievements
        </Button>
        <Button className="w-full" variant="outline" disabled>
          <TrendingUp className="mr-2 h-4 w-4" />
          Historique
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Stats détaillées bientôt disponibles
      </p>
    </Card>
  );
};
