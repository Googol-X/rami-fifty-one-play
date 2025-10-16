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
      <div className="p-4 md:p-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-card rounded-xl p-6 md:p-8 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground mb-6">Règles du Rami 51</h1>

            {/* Navigation rapide */}
            <nav className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-300 dark:border-border" aria-label="Navigation des règles">
              {['depot', 'combos', 'tour', 'fin', 'score'].map((section) => (
                <Button
                  key={section}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSection(section)}
                  className="text-xs bg-gray-100 dark:bg-transparent text-gray-900 dark:text-foreground border-gray-300 dark:border-border hover:bg-gray-200 dark:hover:bg-muted"
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
              <section id="depot" className="bg-gray-50 dark:bg-card/50 border-l-4 border-gray-400 dark:border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                  <span>🎯</span> Dépôt initial 51
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-800 dark:text-foreground leading-relaxed">
                    Votre première combinaison doit totaliser au moins <span className="font-bold text-gray-900 dark:text-foreground text-lg bg-yellow-200 dark:bg-primary/20 px-2 py-0.5 rounded">51 points</span>.
                  </p>
                  <div className="p-3 bg-orange-100 dark:bg-foreground/10 border border-orange-300 dark:border-foreground/20 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground font-semibold text-sm mb-2">
                      📋 CONDITIONS OBLIGATOIRES pour le premier dépôt :
                    </p>
                    <ul className="text-sm text-gray-800 dark:text-foreground/90 space-y-1 ml-4">
                      <li>• Au moins une SUITE (3+ cartes consécutives, même couleur)</li>
                      <li>• Au moins une SÉRIE (3+ cartes même valeur, couleurs différentes)</li>
                      <li>• Total ≥ 51 points</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700/50 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground font-semibold text-sm mb-1">
                      ⚔️ RÈGLE DE COMPÉTITION
                    </p>
                    <p className="text-sm text-gray-800 dark:text-foreground/90">
                      Si votre adversaire dépose en premier, vous devez <span className="font-bold">DÉPASSER son score</span> pour pouvoir déposer à votre tour !
                    </p>
                  </div>
                </div>
              </section>

              <section id="combos" className="bg-gray-50 dark:bg-card/50 border-l-4 border-gray-400 dark:border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                  <span>✨</span> Combinaisons
                </h2>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground font-semibold mb-1">
                      Série : 3 cartes minimum même valeur, couleurs différentes
                    </p>
                    <p className="text-gray-700 dark:text-foreground/70 text-sm">
                      Exemple : 7♠ 7♥ 7♦ ou 7♠ 7♥ 7♦ 7♣
                    </p>
                  </div>
                  <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground font-semibold mb-1">
                      Suite : 3 cartes consécutives minimum, même couleur
                    </p>
                    <p className="text-gray-700 dark:text-foreground/70 text-sm">
                      Exemple : 5♥ 6♥ 7♥ ou 5♥ 6♥ 7♥ 8♥ 9♥
                    </p>
                  </div>
                  <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground font-semibold mb-1">
                      As : position basse (A-2-3) ou haute (Q-K-A)
                    </p>
                    <p className="text-gray-700 dark:text-foreground/70 text-sm">
                      L&apos;As peut être utilisé en position basse (A-2-3) ou haute (Q-K-A)
                    </p>
                  </div>
                </div>
              </section>

              <section id="tour" className="bg-gray-50 dark:bg-card/50 border-l-4 border-gray-400 dark:border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                  <span>🎮</span> Tour de jeu
                </h2>
                <ol className="space-y-2">
                  <li className="text-gray-800 dark:text-foreground">
                    <span className="font-bold bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded text-gray-900 dark:text-foreground">1.</span> Piochez une carte (de la pioche ou de la défausse)
                  </li>
                  <li className="text-gray-800 dark:text-foreground">
                    <span className="font-bold bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded text-gray-900 dark:text-foreground">2.</span> Déposez vos combinaisons (optionnel)
                  </li>
                  <li className="text-gray-800 dark:text-foreground">
                    <span className="font-bold bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded text-gray-900 dark:text-foreground">3.</span> Défaussez exactement 1 carte
                  </li>
                </ol>
                <div className="mt-3 space-y-2">
                  <div className="p-3 bg-blue-100 dark:bg-foreground/10 border border-blue-300 dark:border-foreground/20 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground text-sm">
                      💡 <span className="font-semibold">Astuce stratégique :</span> Vous pouvez ajouter des cartes aux combinaisons déjà posées sur la table (vôtres ou adversaire) pour vous débarrasser d&apos;un maximum de cartes !
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700/50 rounded-lg">
                    <p className="text-gray-900 dark:text-foreground text-sm">
                      🤖 <span className="font-semibold">Le bot est intelligent :</span> Il peut créer des combinaisons, déposer quand il atteint 51+ points, et rajouter des cartes aux dépôts existants !
                    </p>
                  </div>
                </div>
              </section>

              <section id="fin" className="bg-gray-50 dark:bg-card/50 border-l-4 border-gray-400 dark:border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                  <span>🏁</span> Fin de manche
                </h2>
                <p className="text-gray-800 dark:text-foreground leading-relaxed">
                  La manche se termine quand un joueur vide sa main. Les cartes restantes de l&apos;adversaire (appelées <span className="font-bold bg-red-100 dark:bg-foreground/20 px-1.5 py-0.5 rounded text-gray-900 dark:text-foreground">"orphelines"</span>) deviennent des points de pénalité.
                </p>
              </section>

              <section id="score" className="bg-gray-50 dark:bg-card/50 border-l-4 border-gray-400 dark:border-foreground/30 rounded-r-lg p-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
                  <span>💰</span> Valeurs des cartes
                </h2>
                <div className="space-y-3 mb-3">
                  <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                    <p className="font-bold text-gray-900 dark:text-foreground mb-2">As (valeur variable) :</p>
                    <ul className="text-sm text-gray-700 dark:text-foreground/70 space-y-1 ml-4">
                      <li>• <span className="bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded">11 pts</span> dans une tierce (série) : A♠ A♥ A♦</li>
                      <li>• <span className="bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded">10 pts</span> dans une suite se terminant par A : 10-J-Q-K-A</li>
                      <li>• <span className="bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded">1 pt</span> dans une suite commençant par A : A-2-3-4</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                      <p className="font-bold text-gray-900 dark:text-foreground">Figures (J, Q, K) : <span className="bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded">10 pts</span></p>
                    </div>
                    <div className="bg-white dark:bg-background/80 border border-gray-200 dark:border-foreground/10 p-3 rounded-lg">
                      <p className="font-bold text-gray-900 dark:text-foreground">2 à 10 : <span className="bg-yellow-200 dark:bg-primary/20 px-1.5 py-0.5 rounded">valeur nominale</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-green-100 dark:bg-foreground/10 border border-green-300 dark:border-foreground/20 rounded-lg">
                  <p className="text-gray-900 dark:text-foreground font-semibold">
                    🏆 La partie se termine quand un joueur atteint <span className="text-lg bg-yellow-200 dark:bg-primary/20 px-2 py-0.5 rounded">200 points</span>
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/table')}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-primary dark:hover:bg-primary/90"
            >
              Commencer à jouer
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-white dark:bg-transparent text-gray-900 dark:text-foreground border-gray-300 dark:border-border hover:bg-gray-100 dark:hover:bg-muted"
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
