import { useState } from 'react';

const TUTORIAL_KEY = 'skin101_general_tutorial_completed';

export function useTutorial() {
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem(TUTORIAL_KEY);
    return saved === 'true';
  });

  const markTutorialComplete = () => {
    setTutorialCompleted(true);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const resetTutorial = () => {
    setTutorialCompleted(false);
    localStorage.setItem(TUTORIAL_KEY, 'false');
  };

  const shouldShowTutorial = (): boolean => {
    return !tutorialCompleted;
  };

  return {
    tutorialCompleted,
    markTutorialComplete,
    resetTutorial,
    shouldShowTutorial,
  };
}
