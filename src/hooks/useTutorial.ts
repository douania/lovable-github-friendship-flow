import { useState } from 'react';

interface TutorialState {
  soins: boolean;
  dashboard: boolean;
  patients: boolean;
  appointments: boolean;
}

const TUTORIAL_KEY = 'skin101_tutorial_completed';

export function useTutorial() {
  const [tutorialCompleted, setTutorialCompleted] = useState<TutorialState>(() => {
    const saved = localStorage.getItem(TUTORIAL_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          soins: false,
          dashboard: false,
          patients: false,
          appointments: false,
        };
      }
    }
    return {
      soins: false,
      dashboard: false,
      patients: false,
      appointments: false,
    };
  });

  const markTutorialComplete = (module: keyof TutorialState) => {
    const updated = { ...tutorialCompleted, [module]: true };
    setTutorialCompleted(updated);
    localStorage.setItem(TUTORIAL_KEY, JSON.stringify(updated));
  };

  const resetTutorial = (module?: keyof TutorialState) => {
    if (module) {
      const updated = { ...tutorialCompleted, [module]: false };
      setTutorialCompleted(updated);
      localStorage.setItem(TUTORIAL_KEY, JSON.stringify(updated));
    } else {
      const reset = {
        soins: false,
        dashboard: false,
        patients: false,
        appointments: false,
      };
      setTutorialCompleted(reset);
      localStorage.setItem(TUTORIAL_KEY, JSON.stringify(reset));
    }
  };

  const shouldShowTutorial = (module: keyof TutorialState): boolean => {
    return !tutorialCompleted[module];
  };

  return {
    tutorialCompleted,
    markTutorialComplete,
    resetTutorial,
    shouldShowTutorial,
  };
}
