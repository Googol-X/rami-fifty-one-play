import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-primary mb-4 drop-shadow-lg">
          Rami 51
        </h1>
        <p className="text-xl text-foreground/90 mb-8">
          Le jeu de cartes classique - Formez des combinaisons et atteignez 51 points !
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            onClick={() => navigate('/table')}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl"
          >
            Jouer Hors Ligne
          </Button>

          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-xl"
          >
            Jouer en Ligne
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/regles')}
            className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10"
          >
            Règles du jeu
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-4xl mb-2">♠♥</div>
            <p className="text-sm text-muted-foreground">52 cartes</p>
          </div>
          <div className="p-4">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground">51 points</p>
          </div>
          <div className="p-4">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm text-muted-foreground">Multijoueur</p>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
