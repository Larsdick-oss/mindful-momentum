import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, User, Heart, Briefcase, Sparkles } from 'lucide-react';
import { Priority } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { PriorityStep } from './PriorityStep';

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'you', title: 'You', icon: User },
  { id: 'relationships', title: 'Relationships', icon: Heart },
  { id: 'work', title: 'Work', icon: Briefcase },
];

const domainExamples = {
  you: ['Health & Exercise', 'Sleep', 'Meditation', 'Reading', 'Learning'],
  relationships: ['Family Time', 'Date Night', 'Friends', 'Community'],
  work: ['Deep Work', 'Meetings', 'Admin Tasks', 'Side Projects'],
};

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const { completeOnboarding } = useApp();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding(priorities);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePriorityChange = (domain: 'you' | 'relationships' | 'work', newPriorities: Priority[]) => {
    setPriorities(prev => [
      ...prev.filter(p => p.domain !== domain),
      ...newPriorities
    ]);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4 pt-safe">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex-1 flex flex-col px-6 pb-safe">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {currentStep === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    Become Indistractable
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-sm">
                    Turn your values into time. Every minute with intention – work, play, or rest.
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-md max-w-sm">
                  <p className="text-sm text-muted-foreground italic">
                    "The opposite of distraction is not focus – it's traction. Actions that move you toward what you really want."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">— Nir Eyal</p>
                </div>
              </div>
            )}

            {currentStep > 0 && (
              <PriorityStep
                domain={steps[currentStep].id as 'you' | 'relationships' | 'work'}
                icon={steps[currentStep].icon}
                title={steps[currentStep].title}
                examples={domainExamples[steps[currentStep].id as keyof typeof domainExamples]}
                priorities={priorities.filter(p => p.domain === steps[currentStep].id)}
                onPriorityChange={(newPriorities) => 
                  handlePriorityChange(steps[currentStep].id as 'you' | 'relationships' | 'work', newPriorities)
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 py-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Start Planning
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
