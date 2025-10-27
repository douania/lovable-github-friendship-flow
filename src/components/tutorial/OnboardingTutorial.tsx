import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  action?: string;
}

interface OnboardingTutorialProps {
  module: 'soins' | 'dashboard' | 'patients' | 'appointments';
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: Record<string, TutorialStep[]> = {
  soins: [
    {
      title: 'Bienvenue dans le Catalogue de Soins',
      description: 'Ce module vous permet de gérer tous vos soins organisés par appareils et zones de traitement.',
      icon: '👋',
    },
    {
      title: 'Navigation hiérarchique',
      description: 'La navigation se fait en 3 étapes : 1) Sélectionnez un appareil, 2) Choisissez une zone, 3) Gérez vos soins.',
      icon: '🗺️',
      action: 'Cliquez sur un appareil pour commencer'
    },
    {
      title: 'Créer un nouveau soin',
      description: 'Utilisez le bouton "Nouveau Soin" pour ajouter un traitement. Remplissez les champs obligatoires marqués d\'un *.',
      icon: '✨',
      action: 'Essayez de créer votre premier soin'
    },
    {
      title: 'Vue globale',
      description: 'Le bouton "Voir tous les soins" vous permet d\'accéder rapidement à l\'ensemble de vos soins avec recherche et filtres.',
      icon: '🔍',
      action: 'Utilisez les filtres pour affiner votre recherche'
    },
    {
      title: 'Breadcrumb de navigation',
      description: 'Utilisez le fil d\'Ariane en haut pour revenir à tout moment à un niveau précédent de navigation.',
      icon: '🧭',
    }
  ],
  dashboard: [
    {
      title: 'Tableau de bord',
      description: 'Votre vue d\'ensemble des activités, rendez-vous et statistiques importantes.',
      icon: '📊',
    }
  ],
  patients: [
    {
      title: 'Gestion des patients',
      description: 'Créez, modifiez et consultez les fiches de vos patients en toute simplicité.',
      icon: '👥',
    }
  ],
  appointments: [
    {
      title: 'Rendez-vous',
      description: 'Planifiez et gérez tous vos rendez-vous avec vos patients.',
      icon: '📅',
    }
  ]
};

export default function OnboardingTutorial({ module, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tutorialSteps[module] || [];
  const totalSteps = steps.length;

  if (totalSteps === 0) return null;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative flex justify-between items-start">
            <div>
              <div className="text-5xl mb-3">{currentStepData.icon}</div>
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-white/90 mt-2 text-sm">
                Étape {currentStep + 1} sur {totalSteps}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
              aria-label="Fermer le tutoriel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {currentStepData.description}
          </p>

          {currentStepData.action && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <p className="text-blue-900 font-medium flex items-center gap-2">
                <span className="text-xl">💡</span>
                {currentStepData.action}
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 underline text-sm"
            >
              Passer le tutoriel
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
