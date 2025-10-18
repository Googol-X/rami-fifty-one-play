import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * RANKING PANEL - Classement & leaderboards
 * 
 * TODO (Phase 2):
 * - Classement global (tous joueurs)
 * - Classement hebdomadaire
 * - Classement entre amis
 * - Points ELO / MMR
 * - Ligues (Bronze, Argent, Or, Platine, etc.)
 * - Récompenses de saison
 */

interface RankingPlayer {
  rank: number;
  username: string;
  points: number;
  wins: number;
  league: string;
  isMe?: boolean;
}

export const RankingPanel = () => {
  // TODO: Charger depuis backend
  const topPlayers: RankingPlayer[] = [
    { rank: 1, username: 'ProGamer', points: 2450, wins: 145, league: 'Platine' },
    { rank: 2, username: 'CardMaster', points: 2380, wins: 132, league: 'Platine' },
    { rank: 3, username: 'RamiKing', points: 2205, wins: 118, league: 'Or' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getLeagueColor = (league: string) => {
    const colors: Record<string, string> = {
      'Platine': 'bg-cyan-500',
      'Or': 'bg-yellow-500',
      'Argent': 'bg-gray-400',
      'Bronze': 'bg-amber-700',
    };
    return colors[league] || 'bg-secondary';
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">
          <Trophy className="inline h-5 w-5 mr-2 text-primary" />
          Classements
        </h3>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">Semaine</TabsTrigger>
          <TabsTrigger value="friends" disabled>Amis</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-3 mt-4">
          {topPlayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucun classement disponible</p>
            </div>
          ) : (
            topPlayers.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  player.isMe 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(player.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-xs font-bold">
                    {player.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{player.username}</p>
                    {player.isMe && (
                      <Badge variant="secondary" className="text-xs">Vous</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getLeagueColor(player.league)} text-xs`}>
                      {player.league}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {player.wins} victoires
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {player.points}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Classement hebdomadaire bientôt disponible</p>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Fonctionnalité en développement
      </p>
    </Card>
  );
};
