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
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-foreground mb-6">Règles du Rami 51</h1>

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

            <div className="space-y-8 text-base">
              <section id="depot" className="bg-card/50 border-l-4 border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>🎯</span> Dépôt initial 51
                </h2>
                <p className="text-foreground leading-relaxed mb-2">
                  Votre première combinaison doit totaliser au moins <span className="font-bold text-foreground text-lg bg-primary/20 px-2 py-0.5 rounded">51 points</span>. Les dépôts suivants sont libres.
                </p>
                <div className="mt-3 p-3 bg-foreground/10 border border-foreground/20 rounded-lg">
                  <p className="text-foreground font-semibold text-sm">
                    ⚠️ Important : Le premier dépôt doit obligatoirement inclure au moins <span className="bg-foreground/20 px-1.5 py-0.5 rounded">une série</span> (3+ cartes de même valeur)
                  </p>
                </div>
              </section>

              <section id="combos" className="bg-card/50 border-l-4 border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>✨</span> Combinaisons
                </h2>
                <div className="space-y-4">
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="text-foreground font-semibold mb-1">
                      Série : 3+ cartes même valeur, couleurs différentes
                    </p>
                    <p className="text-foreground/70 text-sm">
                      Exemple : 7♠ 7♥ 7♦
                    </p>
                  </div>
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="text-foreground font-semibold mb-1">
                      Suite : 3+ cartes consécutives, même couleur
                    </p>
                    <p className="text-foreground/70 text-sm">
                      Exemple : 5♥ 6♥ 7♥
                    </p>
                  </div>
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="text-foreground font-semibold mb-1">
                      As : position basse (A-2-3) ou haute (Q-K-A)
                    </p>
                    <p className="text-foreground/70 text-sm">
                      L&apos;As peut être utilisé en position basse (A-2-3) ou haute (Q-K-A)
                    </p>
                  </div>
                </div>
              </section>

              <section id="tour" className="bg-card/50 border-l-4 border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>🎮</span> Tour de jeu
                </h2>
                <ol className="space-y-2">
                  <li className="text-foreground">
                    <span className="font-bold bg-primary/20 px-1.5 py-0.5 rounded">1.</span> Piochez une carte (de la pioche ou de la défausse)
                  </li>
                  <li className="text-foreground">
                    <span className="font-bold bg-primary/20 px-1.5 py-0.5 rounded">2.</span> Déposez vos combinaisons (optionnel)
                  </li>
                  <li className="text-foreground">
                    <span className="font-bold bg-primary/20 px-1.5 py-0.5 rounded">3.</span> Défaussez exactement 1 carte
                  </li>
                </ol>
                <div className="mt-3 p-3 bg-foreground/10 border border-foreground/20 rounded-lg">
                  <p className="text-foreground text-sm">
                    💡 Vous pouvez aussi ajouter des cartes aux combinaisons déjà posées sur la table (vôtres ou adversaire)
                  </p>
                </div>
              </section>

              <section id="fin" className="bg-card/50 border-l-4 border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>🏁</span> Fin de manche
                </h2>
                <p className="text-foreground leading-relaxed">
                  La manche se termine quand un joueur vide sa main. Les cartes restantes de l&apos;adversaire (appelées <span className="font-bold bg-foreground/20 px-1.5 py-0.5 rounded">"orphelines"</span>) deviennent des points de pénalité.
                </p>
              </section>

              <section id="score" className="bg-card/50 border-l-4 border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>💰</span> Valeurs des cartes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="font-bold text-foreground">As : <span className="bg-primary/20 px-1.5 py-0.5 rounded">11 pts</span></p>
                  </div>
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="font-bold text-foreground">Figures (J, Q, K) : <span className="bg-primary/20 px-1.5 py-0.5 rounded">10 pts</span></p>
                  </div>
                  <div className="bg-background/80 border border-foreground/10 p-3 rounded-lg">
                    <p className="font-bold text-foreground">2 à 10 : <span className="bg-primary/20 px-1.5 py-0.5 rounded">valeur nominale</span></p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-foreground/10 border border-foreground/20 rounded-lg">
                  <p className="text-foreground font-semibold">
                    🏆 La partie se termine quand un joueur atteint <span className="text-lg bg-primary/20 px-2 py-0.5 rounded">200 points</span>
                  </p>
                </div>
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
