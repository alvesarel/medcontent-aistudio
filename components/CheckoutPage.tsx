import React, { useMemo } from 'react';
import { User, SelectedPlan, BillingCycle, PlanTier } from '../types';
import { PLAN_TIERS } from '../constants';

interface CheckoutPageProps {
  user: User;
  plan: SelectedPlan;
  setPlan: (plan: SelectedPlan) => void;
  onBack: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-primary" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);

const RadioIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-custom-border" }) => (
     <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-8-8a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" clipRule="evenodd" />
    </svg>
);

const BillingToggle: React.FC<{ billingCycle: BillingCycle, onToggle: (cycle: BillingCycle) => void }> = ({ billingCycle, onToggle }) => {
    return (
        <div className="relative bg-primary/10 p-1 rounded-full flex items-center border border-primary/20 w-full">
            <div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-primary shadow-lg rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    transform: `translateX(${billingCycle === 'monthly' ? '0%' : '100%'})`,
                }}
            />
            <button
                onClick={() => onToggle('monthly')}
                className={`relative w-1/2 py-2 text-sm font-semibold rounded-full transition-colors z-10 text-center ${billingCycle === 'monthly' ? 'text-white' : 'text-primary'}`}
            >
                Mensal
            </button>
            <button
                onClick={() => onToggle('annual')}
                className={`relative w-1/2 py-2 text-sm font-semibold rounded-full transition-colors z-10 text-center flex items-center justify-center gap-2 ${billingCycle === 'annual' ? 'text-white' : 'text-primary'}`}
            >
                Anual
                 <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full z-20">
                    -17%
                </span>
            </button>
        </div>
    );
};


const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, plan, setPlan, onBack }) => {

  const handleTierChange = (tierName: PlanTier['name']) => {
    if (tierName === 'Iniciante' || tierName === 'Agência') return;
    setPlan({ ...plan, tierName });
  };

  const handleBillingCycleChange = (billingCycle: BillingCycle) => {
    setPlan({ ...plan, billingCycle });
  };

  const selectedTierDetails = useMemo(() => {
    return PLAN_TIERS.find(t => t.name === plan.tierName) || PLAN_TIERS[1];
  }, [plan.tierName]);

  const totalPrice = selectedTierDetails.price[plan.billingCycle];

  const plansToShow = PLAN_TIERS.filter(p => p.name === 'Pro' || p.name === 'Ultra');

  const primaryButtonClass = "w-full flex items-center justify-center p-3 rounded-lg bg-primary text-white font-bold transition hover:bg-primary-600 shadow-sm";

  return (
    <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className={`${primaryButtonClass} w-auto px-4 py-2 text-sm mb-8 gap-1`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Voltar aos Planos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side: Plan Selection */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-copy-text">1. Escolha seu Plano</h2>
                    <div className="space-y-4 mt-4">
                        {plansToShow.map(tier => (
                            <div key={tier.name} onClick={() => handleTierChange(tier.name)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${plan.tierName === tier.name ? 'border-primary bg-primary/5' : 'border-custom-border hover:border-slate-300'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-copy-text">{tier.name}</span>
                                    {plan.tierName === tier.name ? <CheckIcon /> : <RadioIcon />}
                                </div>
                                <p className="text-sm text-copy-text-secondary mt-1">{tier.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-copy-text">2. Escolha o Faturamento</h2>
                     <div className="mt-4">
                         <BillingToggle billingCycle={plan.billingCycle} onToggle={handleBillingCycleChange} />
                     </div>
                </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="bg-surface p-6 rounded-xl border border-custom-border h-fit sticky top-24 shadow-sm">
                <h3 className="text-xl font-bold text-copy-text">Resumo do Pedido</h3>
                
                <div className="mt-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-copy-text-secondary">Assinante:</span>
                        <span className="font-medium text-copy-text">{user.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-copy-text-secondary">E-mail:</span>
                        <span className="font-medium text-copy-text">{user.email}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-custom-border">
                        <span className="text-copy-text-secondary">Plano:</span>
                        <span className="font-medium text-copy-text">{selectedTierDetails.name} ({plan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'})</span>
                    </div>
                </div>

                <div className="flex justify-between items-baseline mt-6 pt-6 border-t border-custom-border">
                    <span className="text-lg font-bold text-copy-text">Total</span>
                    <span className="text-2xl font-extrabold text-primary">R$ {totalPrice}</span>
                </div>
                
                 <div className="mt-8 space-y-3">
                    <button className={primaryButtonClass}>
                        Pagar com Cartão
                    </button>
                    <button className={primaryButtonClass}>
                        Pagar com PIX
                    </button>
                </div>
                 <p className="text-xs text-copy-text-secondary mt-4 text-center">
                    A implementação do pagamento é o próximo passo.
                </p>
            </div>
        </div>
    </div>
  );
};

export default CheckoutPage;