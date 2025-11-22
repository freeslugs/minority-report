import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user has completed onboarding
    chrome.storage.sync.get(['onboardingCompleted'], (result) => {
      const completed = result.onboardingCompleted ?? false;
      setHasCompletedOnboarding(completed);
      // Show onboarding if not completed (first time setup)
      setShowOnboarding(!completed);
    });
  }, []);
  
  const completeOnboarding = () => {
    chrome.storage.sync.set({ onboardingCompleted: true });
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };
  
  const showOnboardingAgain = () => {
    setShowOnboarding(true);
  };
  
  return {
    showOnboarding,
    hasCompletedOnboarding,
    completeOnboarding,
    showOnboardingAgain
  };
}

