import React, { useState } from 'react';
import { PLAN_TIERS } from '../constants';
import { BillingCycle, SelectedPlan, PlanTier } from '../types';

const CheckIcon: React.FC = () => (
    <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" />
    </svg>
);

const BillingToggle: React.FC<{ billingCycle: BillingCycle, onToggle: (cycle: BillingCycle) => void }> = ({ billingCycle, onToggle }) => {
    return (
        <div className="relative self-center mt-6 bg-primary/10 p-1 rounded-full flex items-center border border-primary/20 w-full max-w-[280px]">
            <div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-primary shadow-lg rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    transform: `translateX(${billingCycle === 'monthly' ? '0%' : '100%'})`,
                }}
            />
            <button
                onClick={() => onToggle('monthly')}
                className={`relative w-1/2 px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 text-center ${billingCycle === 'monthly' ? 'text-white' : 'text-primary'}`}
            >
                Mensal
            </button>
            <button
                onClick={() => onToggle('annual')}
                className={`relative w-1/2 px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 text-center flex items-center justify-center gap-2 ${billingCycle === 'annual' ? 'text-white' : 'text-primary'}`}
            >
                Anual
                 <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full z-20">
                    ECONOMIZE
                </span>
            </button>
        </div>
    );
};

const PlanCard: React.FC<{ plan: PlanTier, billingCycle: BillingCycle, onSubscribe: () => void }> = ({ plan, billingCycle, onSubscribe }) => {
    const price = plan.price[billingCycle];
    const isFreeOrContact = plan.name === 'Iniciante' || plan.name === 'Agência';
    
    let priceText;
    if (plan.name === 'Agência') {
        priceText = "Custom";
    } else if (plan.name === 'Iniciante') {
        priceText = "Grátis";
    } else {
        priceText = `R$ ${price}`;
    }
    
    return (
        <div className={`flex flex-col rounded-xl border-2 p-8 relative ${plan.isPopular ? 'bg-surface border-primary shadow-lg' : 'bg-surface border-custom-border shadow-sm'}`}>
             {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">Mais Popular</span></div>}
            <h3 className="text-xl font-semibold text-copy-text">{plan.name}</h3>
            <p className="mt-4 text-copy-text-secondary h-12">{plan.description}</p>
            
            <div className="mt-6">
                <span className="text-4xl font-bold text-copy-text">{priceText}</span>
                {!isFreeOrContact && <span className="text-base font-medium text-copy-text-secondary">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>}
            </div>
            
            <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map(feature => (
                    <li key={feature} className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                            <CheckIcon />
                        </div>
                        <p className="ml-3 text-sm text-copy-text-secondary">{feature}</p>
                    </li>
                ))}
            </ul>

            <button
                onClick={onSubscribe}
                className="mt-10 block w-full py-3 px-6 rounded-lg text-center font-semibold transition-colors shadow-sm hover:shadow-md bg-primary text-white hover:bg-primary-600"
              >
                {plan.cta}
            </button>
        </div>
    );
};

interface PricingPageProps {
    onStartSubscription: (plan: SelectedPlan) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onStartSubscription }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-copy-text sm:text-4xl">Planos para escalar sua presença digital</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-copy-text-secondary sm:mt-4">
            Escolha o plano ideal para sua necessidade e comece a criar conteúdo de alto impacto hoje mesmo.
          </p>
        </div>
        
        <BillingToggle billingCycle={billingCycle} onToggle={setBillingCycle} />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {PLAN_TIERS.map((tier) => (
            <PlanCard 
                key={tier.name} 
                plan={tier} 
                billingCycle={billingCycle}
                onSubscribe={() => onStartSubscription({ tierName: tier.name, billingCycle })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;