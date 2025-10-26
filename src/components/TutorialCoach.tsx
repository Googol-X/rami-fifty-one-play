import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { TUTORIAL_STEPS, tutorialManager, TutorialStep } from '@/lib/tutorial';
import { cn } from '@/lib/utils';

interface TutorialCoachProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialCoach({ isActive, onComplete, onSkip }: TutorialCoachProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentStep = TUTORIAL_STEPS[currentStepIndex];

  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Find target element
    const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Calculate position
      const rect = element.getBoundingClientRect();
      const coachWidth = 320;
      const coachHeight = 180;
      
      let top = 0;
      let left = 0;

      switch (currentStep.position) {
        case 'bottom':
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - coachWidth / 2;
          break;
        case 'top':
          top = rect.top - coachHeight - 16;
          left = rect.left + rect.width / 2 - coachWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - coachHeight / 2;
          left = rect.left - coachWidth - 16;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - coachHeight / 2;
          left = rect.right + 16;
          break;
        default:
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - coachWidth / 2;
      }

      // Ensure within viewport
      top = Math.max(16, Math.min(window.innerHeight - coachHeight - 16, top));
      left = Math.max(16, Math.min(window.innerWidth - coachWidth - 16, left));

      setPosition({ top, left });

      // Highlight target with overlay
      element.style.position = 'relative';
      element.style.zIndex = '9999';
    }

    return () => {
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
      }
    };
  }, [currentStepIndex, isActive, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      tutorialManager.completeStep(currentStep.id);
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    tutorialManager.markAsCompleted();
    onComplete();
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onSkip}
      />

      {/* Coach mark spotlight */}
      {targetElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            border: '3px solid hsl(var(--primary))',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2), 0 0 40px hsl(var(--primary) / 0.4)',
          }}
        />
      )}

      {/* Coach card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] bg-secondary/95 backdrop-blur-lg border-2 border-primary rounded-2xl shadow-2xl p-4"
          style={{
            top: position.top,
            left: position.left,
            width: 320,
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">
              {currentStep.title}
            </h3>
            <button
              onClick={onSkip}
              className="p-1 hover:bg-destructive/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {currentStep.description}
          </p>

          {/* Progress dots */}
          <div className="flex gap-1 mb-4 justify-center">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStepIndex ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
            </span>

            <Button
              size="sm"
              variant="default"
              onClick={handleNext}
              className="h-8"
            >
              {currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
