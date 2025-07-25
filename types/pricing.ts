import { UserTier } from "../types";

// Pricing and Checkout Types
export type BillingCycle = 'monthly' | 'annual';

export interface PlanTier {
  name: UserTier;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export interface SelectedPlan {
  tierName: PlanTier['name'];
  billingCycle: BillingCycle;
}
