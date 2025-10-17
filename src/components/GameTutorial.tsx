import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function GameTutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasSeenTutorial = localStorage.getItem('rami51-tutorial-seen');
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, []);

  const steps = [
    {
      title: '🎴 Bienvenue au Rami 51 !',
      description: (
        <div className="space-y-3">
          <p>Apprenez les bases en 2 étapes simples :</p>
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm">
              <strong className="text-primary">Objectif :</strong> Former des combinaisons de cartes pour atteindre 51 points et vider votre main.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '🎯 Comment jouer ?',
      description: (
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-semibold text-primary mb-1">Piochez une carte</p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur la pioche ou prenez la carte visible de la défausse
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-semibold text-primary mb-1">Déposez vos combinaisons</p>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez 3+ cartes qui forment une suite ou un brelan
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-semibold text-primary mb-1">Finissez votre tour</p>
                <p className="text-sm text-muted-foreground">
                  Défaussez une carte pour terminer votre tour
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Astuce :</strong> Vous devez totaliser au moins 51 points lors de votre premier dépôt pour pouvoir commencer à jouer !
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('rami51-tutorial-seen', 'true');
      setOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('rami51-tutorial-seen', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {steps[step].title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {steps[step].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              size="sm"
            >
              Passer
            </Button>
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {step < steps.length - 1 ? (
                <>
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Commencer <Play className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
