import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export default function Regles() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">Règles du Rami 51</h1>

            {/* Navigation rapide */}
            <nav className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border" aria-label="Navigation des règles">
              {['depot', 'combos', 'tour', 'fin', 'score'].map((section) => (
                <Button
                  key={section}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSection(section)}
                  className="text-xs"
                >
                  {section === 'depot' && '🎯 Dépôt'}
                  {section === 'combos' && '✨ Combos'}
                  {section === 'tour' && '🎮 Tour'}
                  {section === 'fin' && '🏁 Fin'}
                  {section === 'score' && '💰 Score'}
                </Button>
              ))}
            </nav>

            <div className="space-y-6 text-sm md:text-base">
              <section id="depot">
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>🎯</span> Dépôt initial 51
                </h2>
                <p className="text-muted-foreground">
                  Votre <strong>première combinaison</strong> doit totaliser au moins <strong className="text-primary">51 points</strong>. 
                  Les dépôts suivants sont libres.
                </p>
              </section>

              <section id="combos">
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>✨</span> Combinaisons
                </h2>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>Série :</strong> 3+ cartes même valeur, couleurs différentes (7♠ 7♥ 7♦)</li>
                  <li><strong>Suite :</strong> 3+ cartes consécutives, même couleur (5♥ 6♥ 7♥)</li>
                  <li><strong>As :</strong> uniquement en début de suite (A-2-3), jamais Q-K-A</li>
                </ul>
              </section>

              <section id="tour">
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>🎮</span> Tour de jeu
                </h2>
                <p className="text-muted-foreground">
                  <strong>1.</strong> Piochez (pioche ou défausse) • 
                  <strong>2.</strong> Déposez combinaisons (optionnel) • 
                  <strong>3.</strong> Défaussez 1 carte
                </p>
              </section>

              <section id="fin">
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>🏁</span> Fin de manche
                </h2>
                <p className="text-muted-foreground">
                  Manche terminée quand un joueur vide sa main. Les cartes restantes de l&apos;adversaire 
                  deviennent des <strong className="text-destructive">points de pénalité</strong>.
                </p>
              </section>

              <section id="score">
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>💰</span> Valeurs
                </h2>
                <div className="grid grid-cols-3 gap-2 text-muted-foreground text-sm">
                  <div><strong>As :</strong> 11pts</div>
                  <div><strong>Figures :</strong> 10pts</div>
                  <div><strong>2-10 :</strong> valeur</div>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Partie jusqu&apos;à <strong>200 points</strong>.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/table')}
            >
              Commencer à jouer
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
