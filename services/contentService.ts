import {
    Platform,
    IdeaInsights,
    VideoStoryboard,
    MarketResearchRequest,
    SuggestedTheme,
    ContentGenerationRequest,
    UserTier,
    AiModelId,
    Profession,
    AccountSettings
} from '../types';
import { Template } from "../types/templates";
import * as apiGateway from './apiGateway';


// ==================================================================================
// ESTE ARQUIVO AGORA ATUA COMO UM CLIENTE PARA O `apiGateway`.
// Todas as funções são wrappers que chamam o gateway, que simula um backend real.
// Isso desacopla a lógica da aplicação da implementação da API.
// ==================================================================================


/**
 * Endpoint Client: Calls the API gateway to perform market research and get themes.
 */
export async function performMarketResearch(data: MarketResearchRequest): Promise<SuggestedTheme[]> {
    return apiGateway.getMarketResearch(data);
}

/**
 * Returns the AI models available for a given user tier.
 * This is pure logic and can remain on the client.
 */
export function getAvailableModels(tier: UserTier): AiModelId[] {
  switch(tier) {
    case 'Iniciante': return ['gemini'];
    case 'Pro': return ['gemini', 'gpt-4', 'claude-3.5-sonnet'];
    case 'Ultra':
    case 'Agência':
        return ['gemini', 'gpt-4', 'claude-3.5-sonnet', 'claude-3-opus', 'grok'];
    default: return ['gemini'];
  }
}

/**
 * Endpoint Client: Calls the API gateway to generate content with the selected model.
 */
export async function generateContentWithModel(
    data: ContentGenerationRequest,
): Promise<string> {
    const availableModels = getAvailableModels(data.userTier);
    if (!availableModels.includes(data.model)) {
        console.warn(`Model ${data.model} not available for tier ${data.userTier}. The API will handle this.`);
    }
    return apiGateway.generateContent(data);
}

// --- Funções de Gateway Adicionais ---
export interface TemplateGenerationRequest {
    template: Template;
    placeholderValues: Record<string, string>;
    platform: Platform;
    model: AiModelId;
    settings: AccountSettings;
    userTier: UserTier;
}

/**
 * Endpoint Client: Calls the API gateway to generate content from a template.
 */
export const generateContentFromTemplate = async (data: TemplateGenerationRequest): Promise<string> => {
    return apiGateway.generateContentFromTemplate(data);
};

/**
 * Parses the raw AI response into separate post and image suggestion parts.
 * This is a client-side utility.
 */
export const parseGeneratedContent = (rawContent: string): { post: string; suggestion: string } => {
    const separator = '--- SUGESTÃO DE ARTE ---';
    if (rawContent.includes(separator)) {
        const parts = rawContent.split(separator);
        return {
            post: parts[0].trim(),
            suggestion: parts[1].trim(),
        };
    }
    return {
        post: rawContent.trim(),
        suggestion: '',
    };
};

/**
 * Endpoint Client: Calls the API gateway to generate an image.
 */
export const generateImage = async (prompt: string): Promise<string> => {
    return apiGateway.generateImage(prompt);
};

/**
 * Endpoint Client: Calls the API gateway to generate a video storyboard.
 */
export const generateVideoStoryboard = async (postContent: string, brandVoice: string): Promise<VideoStoryboard> => {
    return apiGateway.generateVideoStoryboard(postContent, brandVoice);
};

/**
 * Endpoint Client: Calls the API gateway to adapt content for a different platform.
 */
export const adaptContentForPlatform = async (originalPost: string, targetPlatform: Platform): Promise<string> => {
    return apiGateway.adaptContentForPlatform(originalPost, targetPlatform);
};

/**
 * Endpoint Client: Calls the API gateway to get idea insights for a topic.
 */
export const generateIdeaInsights = async (topic: string): Promise<IdeaInsights> => {
    return apiGateway.generateIdeaInsights(topic);
};

/**
 * Endpoint Client: Calls the API gateway to get service suggestions.
 */
export const suggestServices = async (profession: Profession, area: string): Promise<string> => {
    return apiGateway.suggestServices(profession, area);
};
