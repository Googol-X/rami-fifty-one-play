import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { Users, Play, LogOut, Copy } from 'lucide-react';

interface Game {
  id: string;
  host_id: string;
  status: string;
  created_at: string;
  profiles: { username: string };
  game_players: Array<{ player_id: string }>;
}

const Lobby = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteGameId = searchParams.get('invite');
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadGames();
      
      // Si un lien d'invitation est présent, rejoindre automatiquement
      if (inviteGameId) {
        joinGame(inviteGameId);
      }
      
      const channel = supabase
        .channel('games-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'games'
          },
          () => loadGames()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, inviteGameId]);

  const loadGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        profiles!games_host_id_fkey(username),
        game_players(player_id)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading games:', error);
    } else {
      setGames(data || []);
    }
  };

  const createGame = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({ host_id: user.id })
        .select()
        .single();

      if (gameError) throw gameError;

      const { error: playerError } = await supabase
        .from('game_players')
        .insert({ game_id: game.id, player_id: user.id, player_index: 0 });

      if (playerError) throw playerError;

      // Générer et copier le lien d'invitation
      const inviteLink = `${window.location.origin}/lobby?invite=${game.id}`;
      await navigator.clipboard.writeText(inviteLink);
      
      toast({
        title: 'Partie créée !',
        description: 'Le lien d\'invitation a été copié dans votre presse-papier',
      });

      navigate(`/table?gameId=${game.id}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: players, error: playersError } = await supabase
        .from('game_players')
        .select('player_index')
        .eq('game_id', gameId)
        .order('player_index', { ascending: false });

      if (playersError) throw playersError;

      const nextIndex = players.length > 0 ? players[0].player_index + 1 : 0;

      if (nextIndex >= 4) {
        toast({
          title: 'Partie pleine',
          description: 'Cette partie a déjà 4 joueurs',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('game_players')
        .insert({ game_id: gameId, player_id: user.id, player_index: nextIndex });

      if (error) throw error;

      navigate(`/table?gameId=${gameId}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const playOffline = () => {
    navigate('/table');
  };

  return (
    <Layout>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Lobby Multijoueur</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Partie</CardTitle>
                <CardDescription>Créez une partie et invitez vos amis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={createGame} disabled={loading} className="w-full">
                  Créer une partie en ligne
                </Button>
                <Button onClick={playOffline} variant="outline" className="w-full">
                  Jouer hors ligne (vs IA)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parties disponibles</CardTitle>
                <CardDescription>Rejoignez une partie en attente</CardDescription>
              </CardHeader>
              <CardContent>
                {games.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucune partie disponible</p>
                ) : (
                  <div className="space-y-2">
                     {games.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{game.profiles.username}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {game.game_players.length}/4 joueurs
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const inviteLink = `${window.location.origin}/lobby?invite=${game.id}`;
                              await navigator.clipboard.writeText(inviteLink);
                              toast({
                                title: 'Lien copié !',
                                description: 'Partagez ce lien avec vos amis',
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => joinGame(game.id)}
                            disabled={loading || game.game_players.length >= 4}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Rejoindre
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Lobby;
