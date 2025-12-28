import { AppProvider, useApp } from '@/contexts/AppContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { DayView } from '@/components/planner/DayView';

function AppContent() {
  const { userProfile } = useApp();

  if (!userProfile.hasCompletedOnboarding) {
    return <OnboardingWizard />;
  }

  return <DayView />;
}

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
