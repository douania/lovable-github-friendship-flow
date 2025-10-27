import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Users, Scissors, Calendar, FileText, Package, BarChart3 } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  iconComponent?: any;
  action?: string;
  module?: string;
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  onNavigateToModule?: (module: string) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Bienvenue sur Skin 101 ! 👋',
    description: 'Votre application de gestion complète pour votre centre esthétique. Ce tutoriel va vous guider à travers les étapes essentielles pour démarrer.',
    icon: '🎉',
  },
  {
    title: '1️⃣ Première étape : Créez vos patients',
    description: 'Commencez par enregistrer vos patients dans le système. Cliquez sur "Patients" dans le menu latéral, puis sur le bouton "+ Nouveau Patient". Remplissez les informations essentielles : nom, prénom, email et téléphone.',
    icon: '👥',
    iconComponent: Users,
    module: 'patients',
    action: 'Allez dans Patients et créez votre premier patient'
  },
  {
    title: '2️⃣ Configurez votre catalogue de soins',
    description: 'Définissez les soins que vous proposez. Allez dans "Soins" > Sélectionnez un appareil > Choisissez une zone > Créez vos soins avec les tarifs et durées. Les soins sont organisés par appareil et zone corporelle pour faciliter la gestion.',
    icon: '💆',
    iconComponent: Scissors,
    module: 'treatments',
    action: 'Configurez au moins un soin dans le catalogue'
  },
  {
    title: '3️⃣ Gérez votre stock de produits',
    description: 'Enregistrez vos produits et consommables dans "Stock". Ajoutez le nom, la quantité disponible, le coût unitaire et les seuils d\'alerte. Cela vous permettra de suivre votre inventaire et d\'associer automatiquement les produits aux soins.',
    icon: '📦',
    iconComponent: Package,
    module: 'inventory',
    action: 'Ajoutez quelques produits dans le stock'
  },
  {
    title: '4️⃣ Planifiez vos rendez-vous',
    description: 'Créez des rendez-vous dans "Rendez-vous". Sélectionnez un patient, choisissez un soin, définissez la date et l\'heure. Le système calcule automatiquement les disponibilités et évite les chevauchements.',
    icon: '📅',
    iconComponent: Calendar,
    module: 'appointments',
    action: 'Créez votre premier rendez-vous'
  },
  {
    title: '5️⃣ Réalisez des consultations',
    description: 'Lors du rendez-vous, utilisez "Consultations" pour documenter la séance : notes, photos avant/après, produits utilisés. Toutes les informations sont sauvegardées dans le dossier patient.',
    icon: '📝',
    iconComponent: FileText,
    module: 'consultations',
    action: 'Faites une consultation de test'
  },
  {
    title: '6️⃣ Générez factures et devis',
    description: 'Créez des factures dans "Factures" ou des devis dans "Devis". Sélectionnez le patient, ajoutez les soins réalisés. Le montant est calculé automatiquement et vous pouvez imprimer ou exporter en PDF.',
    icon: '💰',
    iconComponent: FileText,
    module: 'invoices',
    action: 'Créez une facture ou un devis'
  },
  {
    title: '7️⃣ Suivez vos performances',
    description: 'Consultez "Analyses" pour voir vos statistiques : chiffre d\'affaires, soins les plus demandés, taux de remplissage. Le tableau de bord affiche aussi les rendez-vous du jour et les alertes de stock.',
    icon: '📊',
    iconComponent: BarChart3,
    module: 'analytics',
    action: 'Explorez les statistiques'
  },
  {
    title: 'C\'est parti ! 🚀',
    description: 'Vous connaissez maintenant les bases de Skin 101. N\'hésitez pas à explorer les autres fonctionnalités : sauvegardes, disponibilités, rapports de consommation... Si vous avez besoin d\'aide, utilisez le bouton "Aide" présent dans chaque module.',
    icon: '✨',
  }
];

export default function OnboardingTutorial({ onComplete, onSkip, onNavigateToModule }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tutorialSteps;
  const totalSteps = steps.length;

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
              <div className="flex items-start justify-between gap-4">
                <p className="text-blue-900 font-medium flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  {currentStepData.action}
                </p>
                {currentStepData.module && onNavigateToModule && (
                  <button
                    onClick={() => {
                      onNavigateToModule(currentStepData.module!);
                      onSkip();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium whitespace-nowrap"
                  >
                    {currentStepData.iconComponent && <currentStepData.iconComponent className="w-4 h-4" />}
                    Y aller
                  </button>
                )}
              </div>
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
