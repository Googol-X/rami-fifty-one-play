import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export default function Regles() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

        <div className="bg-card rounded-xl p-6 md:p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-primary mb-6">Règles du Rami 51</h1>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">🎯 Objectif</h2>
            <p className="text-card-foreground">
              Être le premier à atteindre <strong>51 points</strong> en déposant des combinaisons valides de cartes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">🃏 Distribution</h2>
            <ul className="list-disc list-inside space-y-2 text-card-foreground">
              <li>Chaque joueur reçoit 7 cartes au début de la partie</li>
              <li>Les cartes restantes forment la pioche</li>
              <li>La première carte est retournée pour commencer la défausse</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">🎮 Déroulement</h2>
            <ol className="list-decimal list-inside space-y-2 text-card-foreground">
              <li>Piochez une carte (pioche ou défausse)</li>
              <li>Formez et déposez vos combinaisons si possible</li>
              <li>Défaussez une carte pour terminer votre tour</li>
            </ol>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">✨ Combinaisons valides</h2>
            <div className="space-y-3 text-card-foreground">
              <div>
                <strong className="text-primary">Brelan/Carré :</strong> 3 ou 4 cartes de même rang (ex: 7♠ 7♥ 7♦)
              </div>
              <div>
                <strong className="text-primary">Suite :</strong> 3+ cartes consécutives de même couleur (ex: 5♥ 6♥ 7♥)
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-3">💰 Valeurs des cartes</h2>
            <ul className="list-disc list-inside space-y-2 text-card-foreground">
              <li><strong>As :</strong> 11 points</li>
              <li><strong>Figures (J, Q, K) :</strong> 10 points</li>
              <li><strong>Autres cartes :</strong> valeur faciale (2-10)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">🏆 Victoire</h2>
            <p className="text-card-foreground">
              Le premier joueur à déposer des combinaisons totalisant 51 points ou plus remporte la partie !
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Button
            size="lg"
            onClick={() => navigate('/table')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Commencer à jouer
          </Button>
        </div>
      </div>
    </div>
    </Layout>
  );
}
