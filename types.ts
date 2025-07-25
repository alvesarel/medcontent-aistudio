import { PlanTier, BillingCycle } from './types/pricing';
import { Template } from './types/templates';
import { SavedPost } from './types/posts';

export type AiModelId = 'gemini' | 'gpt-4' | 'claude-3.5-sonnet' | 'claude-3-opus' | 'grok';

export enum Profession {
  Medico = 'Médico(a)',
  Dentista = 'Dentista',
}

export enum Platform {
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  LinkedIn = 'LinkedIn',
  TikTok = 'TikTok',
}

export interface Tone {
  id: string;
  name: string;
  prompt: string;
  isDefault?: boolean;
}

export interface AccountSettings {
    toneId: string;
    customTones: Tone[];
    socialHandles: {
        [key in Platform]?: string;
    };
    brandColors: {
      primary: string;
      secondary: string;
    };
    brandVoice: string;
    brandLogo: string | null; // Base64 encoded image
}

export type UserTier = 'Iniciante' | 'Pro' | 'Ultra' | 'Agência';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password should not be sent to client, but needed for creation
  settings?: AccountSettings;
  tier?: UserTier;
}

export type AppView = 'app' | 'settings' | 'pricing' | 'checkout' | 'ideas' | 'about' | 'compliance' | 'analytics' | 'templates' | 'my-posts';

export interface AIModel {
    id: AiModelId;
    name: string;
    tier: UserTier;
    provider: string;
}

export interface UserData {
  profession: Profession;
  area: string;
  services: string[];
  location?: string;
  // model is now selected after theme suggestion
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SuggestedTheme {
  id:string;
  title: string;
  description: string;
  viralPotential: 'high' | 'medium' | 'low';
  keywords: string[];
}


export interface Scene {
    sceneNumber: number;
    visualPrompt: string;
    narration: string;
    generatedImage?: string; // base64
}

export interface VideoStoryboard {
    title: string;
    scenes: Scene[];
}

// Compliance Types
export interface ComplianceCheck {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  articleReference?: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  checks: ComplianceCheck[];
  score: number;
  disclaimersNeeded: string[];
}


export interface ContentResult {
    post: string;
    imageSuggestion?: string;
    generatedImage?: string; // Base64 encoded image
    videoStoryboard?: VideoStoryboard;
    complianceResult?: ComplianceResult;
}

export { PlanTier, BillingCycle, SelectedPlan } from './types/pricing';
export { Template };
export { SavedPost };


// Idea Search Types
export interface PostIdea {
  title: string;
  description: string;
}

export interface IdeaInsights {
  postIdeas: PostIdea[];
  commonQuestions: string[];
  mythsToDebunk: string[];
}

// Service Request Types
export interface MarketResearchRequest {
  profession: Profession;
  specialty: string;
  services: string[];
  region: string;
}

export interface ContentGenerationRequest {
  theme: SuggestedTheme;
  platform: Platform;
  model: AiModelId;
  userTier: UserTier;
  // Added for the new API structure, as the backend needs this context
  userData: Omit<UserData, 'model'>;
  settings: AccountSettings;
}