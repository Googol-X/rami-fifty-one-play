import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
            Nouvelle Partie
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
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm text-muted-foreground">vs Bot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
