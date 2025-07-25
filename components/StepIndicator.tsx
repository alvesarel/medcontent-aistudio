
import React, { useMemo } from 'react';
import { AppStep } from '../App';
import { UserTier } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  userTier: UserTier;
}

const allPossibleSteps = [
  { id: 'input', title: 'Informações', tiers: ['Iniciante', 'Pro', 'Ultra', 'Agência'] },
  { id: 'theme_selection', title: 'Temas', tiers: ['Iniciante', 'Pro', 'Ultra', 'Agência'] },
  { id: 'image_creation', title: 'Imagem', tiers: ['Pro', 'Ultra', 'Agência'] },
  { id: 'video_creation', title: 'Vídeo', tiers: ['Ultra', 'Agência'] },
  { id: 'results', title: 'Resultados', tiers: ['Iniciante', 'Pro', 'Ultra', 'Agência'] },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, userTier }) => {

    const steps = useMemo(() => {
        return allPossibleSteps.filter(step => step.tiers.includes(userTier));
    }, [userTier]);

    const getStepIndex = (step: AppStep) => {
        let stepIdToFind = 'input';
         switch (step) {
            case 'input':
            case 'generating_research':
                stepIdToFind = 'input';
                break;
            case 'theme_selection':
            case 'generating_content':
                stepIdToFind = 'theme_selection';
                break;
            case 'image_creation':
            case 'generating_image':
                stepIdToFind = 'image_creation';
                break;
            case 'video_creation':
            case 'generating_video_storyboard':
                stepIdToFind = 'video_creation';
                break;
            case 'results':
                stepIdToFind = 'results';
                break;
            default:
                stepIdToFind = 'input';
        }
        
        const index = steps.findIndex(s => s.id === stepIdToFind);
        return index;
    };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
        <ol className="flex items-center w-full">
            {steps.map((step, stepIdx) => (
                 <li key={step.id} className={`flex w-full items-center ${stepIdx < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-custom-border after:border-4 after:inline-block" : ""} ${stepIdx < currentStepIndex ? 'after:border-primary' : 'after:border-custom-border'}`}>
                    <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 border-2 transition-colors duration-300 ${stepIdx <= currentStepIndex ? 'bg-primary border-primary text-white' : 'bg-surface border-custom-border text-copy-text-secondary'}`}>
                        <span className="font-bold">
                          {stepIdx < currentStepIndex ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" /></svg>
                          ) : (
                            stepIdx + 1
                          )}
                        </span>
                    </div>
                </li>
            ))}
        </ol>
         <div className="flex justify-between mt-2">
            {steps.map((step, stepIdx) => (
                <div key={step.id} className={`text-xs sm:text-sm font-medium text-center flex-1 ${stepIdx <= currentStepIndex ? 'text-copy-text' : 'text-copy-text-secondary'}`}>{step.title}</div>
            ))}
        </div>
    </div>
  );
};

export default StepIndicator;
