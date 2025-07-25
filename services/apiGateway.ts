/**
 * =================================================================================
 * API Gateway (Simulated Backend)
 * ---------------------------------------------------------------------------------
 * This file acts as a stand-in for a real backend server. It centralizes all
 * "server-side" logic, such as database interactions (simulated with localStorage)
 * and calls to external services like the Google AI API.
 *
 * When transitioning to a real backend, this is the **only** file you'll need
 * to change. You would replace the logic in each function with a `fetch` call
 * to your corresponding backend endpoint.
 * =================================================================================
 */

import { GoogleGenAI, Type, Part } from "@google/genai";
import { User, AccountSettings, Platform, MarketResearchRequest, SuggestedTheme, ContentGenerationRequest, Profession, IdeaInsights, VideoStoryboard, UserData, Tone, UserTier, SavedPost } from '../types';
import { NewSavedPost } from '../types/posts';
import { Template } from '../types/templates';
import { GenerationRecord, AnalyticsData, NewRecordData } from '../types/analytics';
import { DEFAULT_TONES, GUEST_SETTINGS, PLATFORM_OPTIONS } from '../constants';
import { applyTemplate } from './templateService';

// --- INITIALIZATION & CONFIG ---

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. The application will not be able to communicate with the AI.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FAKE_API_DELAY = 300; // ms to simulate network latency

const parseJsonFromResponse = (text: string): any => {
    let parsableText = text.trim();
    const markdownMatch = parsableText.match(/```json\n([\s\S]*?)\n```/);
    if (markdownMatch && markdownMatch[1]) parsableText = markdownMatch[1].trim();
    const jsonStartIndex = parsableText.indexOf('{');
    const arrayStartIndex = parsableText.indexOf('[');
    let finalStartIndex = -1;
    if (jsonStartIndex > -1 && arrayStartIndex > -1) finalStartIndex = Math.min(jsonStartIndex, arrayStartIndex);
    else if (jsonStartIndex > -1) finalStartIndex = jsonStartIndex;
    else finalStartIndex = arrayStartIndex;
    if (finalStartIndex > -1) parsableText = parsableText.substring(finalStartIndex);
    try { return JSON.parse(parsableText); }
    catch (e) { console.error("Failed to parse JSON from response text:", text); throw new Error("A resposta da IA não estava no formato JSON esperado."); }
};


// --- USER "DATABASE" SIMULATION ---

const USERS_STORAGE_KEY = 'medcontent_users';
const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
    toneId: DEFAULT_TONES[0].id,
    customTones: [],
    socialHandles: {
        [Platform.Instagram]: '',
        [Platform.Facebook]: '',
        [Platform.LinkedIn]: '',
        [Platform.TikTok]: ''
    },
    brandColors: {
      primary: '#21808D',
      secondary: '#FCFCF9'
    },
    brandLogo: null,
    brandVoice: 'Profissional, mas acessível. Foco em educar e construir confiança com os pacientes.'
};


const getUsersFromDB = (): User[] => {
    try {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        if (usersJson) {
            return JSON.parse(usersJson);
        }
        const ultraUser: User = {
            id: 'ultra-user-001',
            name: 'Usuário Ultra',
            email: 'ultra@medcontent.ai',
            password: 'ultrapass',
            settings: DEFAULT_ACCOUNT_SETTINGS,
            tier: 'Ultra',
        };
        const initialUsers = [ultraUser];
        saveUsersToDB(initialUsers);
        return initialUsers;
    } catch (error) {
        console.error("Could not parse users from localStorage", error);
        return [];
    }
};

const saveUsersToDB = (users: User[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// --- AUTH API ---

export const register = (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromDB();
            const emailLower = email.toLowerCase();
            if (users.some(user => user.email.toLowerCase() === emailLower)) {
                return reject(new Error("Este e-mail já está cadastrado."));
            }
            const newUser: User = {
                id: Date.now().toString(),
                name,
                email: emailLower,
                password,
                settings: DEFAULT_ACCOUNT_SETTINGS,
                tier: 'Iniciante',
            };
            users.push(newUser);
            saveUsersToDB(users);
            const { password: _, ...userToReturn } = newUser;
            resolve(userToReturn);
        }, FAKE_API_DELAY);
    });
};

export const login = (email: string, password: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromDB();
            const emailLower = email.toLowerCase();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === emailLower);
            if (userIndex === -1) return reject(new Error("Credenciais inválidas."));
            const user = users[userIndex];
            if (user && user.password === password) {
                const { password: _, ...userToReturn } = user;
                resolve(userToReturn);
            } else {
                reject(new Error("Credenciais inválidas."));
            }
        }, FAKE_API_DELAY);
    });
};

export const updateSettings = (userId: string, newSettings: AccountSettings): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromDB();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return reject(new Error("Usuário não encontrado."));
            users[userIndex].settings = newSettings;
            saveUsersToDB(users);
            const { password, ...updatedUser } = users[userIndex];
            resolve(updatedUser);
        }, FAKE_API_DELAY);
    });
};

// --- CONTENT API ---

async function conductMarketResearch(services: string[]): Promise<string> {
  const prompt = `Como uma consultoria de marketing de saúde de elite no Brasil, sua tarefa é criar um relatório de inteligência de mercado para um profissional que oferece os seguintes services: ${services.join(', ')}. O relatório deve ser acionável, profundo e formatado em **Markdown**. **Estrutura do Relatório:** ### Análise de Tendências e Sentimento, ### Insights de Conteúdo, ### Inteligência de Palavras-chave. Baseie sua análise nos dados mais recentes do Google Search. Seja conciso. Retorne APENAS o relatório em Markdown.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt, config: { tools: [{ googleSearch: {} }], thinkingConfig: { thinkingBudget: 100 }, temperature: 0.5 },
    });
    return response.text;
  } catch (error) { console.error("Error in conductMarketResearch:", error); throw new Error("Falha ao realizar a pesquisa de mercado."); }
};

export const getMarketResearch = async (data: MarketResearchRequest): Promise<SuggestedTheme[]> => {
    const researchSummary = await conductMarketResearch(data.services);
    const prompt = `Baseado no resumo de pesquisa de mercado e nos dados do profissional (${data.profession} em ${data.specialty}), sugira 5 temas de conteúdo de alto impacto para o público brasileiro. Para cada tema, inclua 'title', 'description', 'viralPotential' ('high', 'medium', or 'low'), e uma lista de 'keywords'. Resumo: "${researchSummary}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT, properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            viralPotential: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            }
        });
        const themes = parseJsonFromResponse(response.text);
        // Add IDs to themes
        return themes.map((t: any, i: number) => ({...t, id: `${Date.now()}-${i}`}));
    } catch (error) {
        console.error("Error generating theme suggestions:", error);
        throw new Error("Falha ao sugerir temas de conteúdo.");
    }
};

const getPlatformFormatting = (platform: Platform): string => {
  switch (platform) {
    case Platform.Instagram: return "Formato para Instagram: Legenda de 150-200 palavras, 3-5 emojis, 5 hashtags (pt-BR), CTA clara. Se apropriado, sugira conteúdo para 3 slides de carrossel.";
    case Platform.Facebook: return "Formato para Facebook: Texto de até 250 palavras, tom informativo, 2-3 emojis, pergunta no final, CTA com link.";
    case Platform.LinkedIn: return "Formato para LinkedIn: Título profissional e esboço de artigo com 3-4 pontos principais. Tom formal e técnico.";
    case Platform.TikTok: return "Formato para TikTok: Roteiro para vídeo de 15-30s com (1) gancho, (2) conteúdo, (3) CTA. Descreva visuais e textos na tela.";
    default: return "Crie um post genérico para mídia social.";
  }
};

export const generateContent = async (req: ContentGenerationRequest): Promise<string> => {
    const { theme, platform, settings, userData } = req;
    const allTones = [...DEFAULT_TONES, ...(settings.customTones || [])];
    const platformInstructions = getPlatformFormatting(platform);
    const selectedTone = allTones.find(t => t.id === settings.toneId);
    const toneInstruction = selectedTone ? selectedTone.prompt : 'Use um tom profissional e informativo.';
    const isProUser = req.userTier === 'Pro' || req.userTier === 'Ultra' || req.userTier === 'Agência';
    const imageSuggestionInstruction = isProUser ? `**Instrução Adicional para Criação Visual:** No final, separada por '--- SUGESTÃO DE ARTE ---', sugira uma ideia para uma arte/imagem, descrevendo cena, elementos e uso das cores da marca (${settings.brandColors?.primary}, ${settings.brandColors?.secondary}).` : '';

    const prompt = `Você é um especialista em marketing de conteúdo para a área da saúde no Brasil. Cumpra as regulamentações do CFM/CRO. NUNCA prometa resultados ou use "antes e depois".
        **Dados:** Profissão: ${userData.profession}, Área: ${userData.area}, Serviços: ${userData.services.join(', ')}.
        **Marca:** Voz: ${settings.brandVoice}, Tom: ${toneInstruction}.
        **Tema Aprovado:** "${theme.title}" - ${theme.description}.
        **Tarefa:** Crie um post para ${platform} baseado no tema aprovado, usando os dados da marca.
        **Regras de Formatação para ${platform}:** ${platformInstructions}
        ${imageSuggestionInstruction}
        **Resultado Final:** Forneça APENAS o texto completo do conteúdo gerado.`;

    const contentParts: Part[] = [{ text: prompt }];
    if (settings.brandLogo) {
        const mimeTypeMatch = settings.brandLogo.match(/^data:(image\/[a-zA-Z]+);base64,/);
        if (mimeTypeMatch) {
            const base64Data = settings.brandLogo.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
            contentParts.push({ inlineData: { data: base64Data, mimeType: mimeTypeMatch[1] } });
        }
    }

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: contentParts }, config: { thinkingConfig: { thinkingBudget: 0 } } });
        return response.text;
    } catch (error) { console.error("Error in generateContent:", error); throw new Error("Falha ao gerar o conteúdo de mídia social."); }
};


export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002', prompt: `Fotografia cinematográfica, profissional e minimalista para mídia social de saúde: ${prompt}. Estilo moderno, limpo, com iluminação suave.`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
        });
        if (!response.generatedImages || response.generatedImages.length === 0) throw new Error("A API não retornou imagens.");
        return response.generatedImages[0].image.imageBytes;
    } catch (error) { console.error("Error in generateImage:", error); throw new Error("Falha ao gerar a imagem."); }
};

export const suggestServices = async (profession: Profession, area: string): Promise<string> => {
    const prompt = `Você é um especialista em marketing para a área da saúde no Brasil. Liste os 10 principais serviços e procedimentos que um(a) ${profession} especialista em ${area} oferece. Retorne apenas a lista, com um serviço por linha, sem números, marcadores ou texto introdutório/conclusivo.`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } } });
        return response.text.trim();
    } catch (error) { console.error("Error in suggestServices:", error); throw new Error("Falha ao sugerir serviços com a IA."); }
};

export const generateIdeaInsights = async (topic: string): Promise<IdeaInsights> => {
    const prompt = `Faça um brainstorm de ideias de conteúdo para o tópico: "${topic}", para pacientes no Brasil. Responda com um objeto JSON com "postIdeas" (title, description), "commonQuestions" (string[]) e "mythsToDebunk" (string[]). Retorne APENAS o JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { postIdeas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } }, commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }, mythsToDebunk: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return parseJsonFromResponse(response.text);
    } catch (error) { console.error("Error generating idea insights:", error); throw new Error("Falha ao gerar insights de conteúdo."); }
};

export const adaptContentForPlatform = async (originalPost: string, targetPlatform: Platform): Promise<string> => {
  const platformInstructions = getPlatformFormatting(targetPlatform);
  const prompt = `Adapte o seguinte post de mídia social para a plataforma ${targetPlatform}, seguindo estritamente estas regras de formatação: "${platformInstructions}". Post original: "${originalPost}". Forneça APENAS o texto adaptado final.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.7 } });
    return response.text;
  } catch (error) { console.error(`Error adapting content for ${targetPlatform}:`, error); throw new Error(`Falha ao adaptar o conteúdo para ${targetPlatform}.`); }
};

export const generateVideoStoryboard = async (postContent: string, brandVoice: string): Promise<VideoStoryboard> => {
    const prompt = `Com base no post "${postContent}" e na voz da marca "${brandVoice}", crie um roteiro de vídeo (15-45s) em 3 cenas. Para cada cena, forneça "narration" (texto) e "visualPrompt" (descrição para IA de imagem). Responda com um JSON contendo "title" e "scenes" (array de objetos com sceneNumber, narration, visualPrompt). Retorne APENAS o JSON.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sceneNumber: { type: Type.INTEGER }, narration: { type: Type.STRING }, visualPrompt: { type: Type.STRING } } } } } } }
        });
        return parseJsonFromResponse(response.text);
    } catch (error) { console.error("Error generating video storyboard:", error); throw new Error("Falha ao gerar o roteiro do vídeo."); }
};

export const generateContentFromTemplate = async (data: { template: Template, placeholderValues: Record<string, string>, platform: Platform, settings: AccountSettings, userTier: UserTier }): Promise<string> => {
    const { template, placeholderValues, platform, settings, userTier } = data;
    const builtContent = applyTemplate(template, placeholderValues);
    // This function reuses the main `generateContent` logic but with a different prompt structure.
    const allTones = [...DEFAULT_TONES, ...(settings.customTones || [])];
    const isProUser = userTier === 'Pro' || userTier === 'Ultra' || userTier === 'Agência';
    const platformInstructions = getPlatformFormatting(platform);
    const selectedTone = allTones.find(t => t.id === settings.toneId);
    const toneInstruction = selectedTone ? selectedTone.prompt : 'Use um tom profissional e informativo.';
    const imageSuggestionInstruction = isProUser ? `**Instrução Adicional para Criação Visual:** No final, separada por '--- SUGESTÃO DE ARTE ---', sugira uma ideia para uma arte/imagem, descrevendo cena, elementos e uso das cores da marca (${settings.brandColors?.primary}, ${settings.brandColors?.secondary}).` : '';

    const fullPrompt = `Você é um especialista em marketing de conteúdo para a área da saúde no Brasil. Cumpra as regulamentações do CFM/CRO. NUNCA prometa resultados ou use "antes e depois".
    **Contexto da Tarefa:** O usuário está usando o template "${template.name}" para gerar conteúdo.
    **Marca:** Voz: ${settings.brandVoice}, Tom: ${toneInstruction}.
    **Conteúdo Base (com dados do usuário):**
    ---
    ${builtContent}
    ---
    **Tarefa:** Use o "Conteúdo Base" acima como a principal fonte de informação para gerar um post completo e coeso para a plataforma ${platform}. Adapte, melhore e expanda o conteúdo base para criar uma legenda de alta qualidade que siga as regras de formatação.
    **Regras de Formatação para ${platform}:** ${platformInstructions}
    ${imageSuggestionInstruction}
    **Resultado Final:** Forneça APENAS o texto completo do conteúdo gerado.`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { thinkingConfig: { thinkingBudget: 0 } } });
        return response.text;
    } catch (error) {
        console.error("Error in generateContentFromTemplate:", error);
        throw new Error("Falha ao gerar o conteúdo a partir do template.");
    }
};


// --- ANALYTICS API ---
const ANALYTICS_STORAGE_KEY_PREFIX = 'medcontent_analytics_';
const getAnalyticsKeyForUser = (userId: string) => `${ANALYTICS_STORAGE_KEY_PREFIX}${userId}`;

const getAnalyticsHistoryFromDB = (userId: string): GenerationRecord[] => {
    try {
        const historyJson = localStorage.getItem(getAnalyticsKeyForUser(userId));
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) { console.error("Could not parse analytics history", error); return []; }
};
const saveAnalyticsHistoryToDB = (userId: string, history: GenerationRecord[]): void => {
    localStorage.setItem(getAnalyticsKeyForUser(userId), JSON.stringify(history));
};

export const postRecord = (data: NewRecordData): void => {
    const history = getAnalyticsHistoryFromDB(data.userId);
    const newRecord: GenerationRecord = {
        id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        userId: data.userId,
        platform: data.platform,
        modelUsed: data.modelUsed,
        complianceScore: data.complianceScore,
        postSnippet: data.postSnippet.substring(0, 100) + (data.postSnippet.length > 100 ? '...' : ''),
    };
    history.unshift(newRecord);
    if (history.length > 100) history.pop();
    saveAnalyticsHistoryToDB(data.userId, history);
};

export const getAnalytics = (userId: string): Promise<AnalyticsData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const history = getAnalyticsHistoryFromDB(userId);
            if (history.length === 0) {
                return resolve({ summary: { totalGenerations: 0, averageCompliance: 0, mostUsedPlatform: 'N/A' }, complianceOverTime: [], platformDistribution: [], history: [] });
            }
            const totalGenerations = history.length;
            const averageCompliance = Math.round(history.reduce((acc, curr) => acc + curr.complianceScore, 0) / totalGenerations);
            const platformCounts = history.reduce((acc, curr) => {
                acc[curr.platform] = (acc[curr.platform] || 0) + 1;
                return acc;
            }, {} as Record<Platform, number>);
            const mostUsedPlatform = Object.keys(platformCounts).length > 0 ? Object.entries(platformCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A';
            const complianceOverTime = history.map(r => ({ date: new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), score: r.complianceScore })).reverse();
            const platformDistribution = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));
            resolve({ summary: { totalGenerations, averageCompliance, mostUsedPlatform }, complianceOverTime, platformDistribution, history: history.slice(0, 10) });
        }, FAKE_API_DELAY);
    });
};

// --- TEMPLATES API ---
const CUSTOM_TEMPLATES_KEY = 'medcontent_custom_templates';
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'myth-truth-1', name: 'Mito ou Verdade', category: 'myth-vs-truth',
    structure: { sections: [{ id: 'header', type: 'header', content: '🤔 MITO OU VERDADE?\n\n"{{afirmacao}}"', isEditable: true },{ id: 'body', type: 'body', content: 'Isto é **{{resposta}}**!\n\n{{explicacao}}\n\n💡 Lembre-se: {{dica_extra}}', isEditable: true },{ id: 'cta', type: 'cta', content: '📲 Ficou com dúvidas? Agende sua consulta!\n\n#{{especialidade}} #saude #mitoouverdade', isEditable: true }] },
    variables: [ { key: 'afirmacao', label: 'Afirmação a ser verificada', type: 'text', required: true }, { key: 'resposta', label: 'É Mito ou Verdade?', type: 'select', options: ['MITO', 'VERDADE', 'DEPENDE'], required: true }, { key: 'explicacao', label: 'Explicação científica', type: 'text', required: true }, { key: 'dica_extra', label: 'Dica ou informação adicional', type: 'text', required: false, defaultValue: 'cada caso é único e deve ser avaliado individualmente.' }, { key: 'especialidade', label: 'Sua especialidade (para hashtag)', type: 'text', required: true, defaultValue: 'medicina' }],
    isPremium: false, usageCount: 125, rating: 4.8, tags: ['educacional', 'engajamento', 'viral']
  },
  {
    id: 'announcement-1', name: 'Anúncio de Novo Serviço', category: 'announcement',
    structure: { sections: [{ id: 's1-header', type: 'header', content: '✨ NOVIDADE NA CLÍNICA!\n\nTemos o prazer de anunciar que agora oferecemos o tratamento de **{{nome_servico}}**!', isEditable: false },{ id: 's2-body', type: 'body', content: 'Este novo serviço é ideal para {{publico_alvo}} e ajuda a {{principal_beneficio}}.\n\nUtilizamos a mais moderna tecnologia para garantir um tratamento seguro e eficaz. {{detalhe_tecnico}}', isEditable: false },{ id: 's3-cta', type: 'cta', content: 'Quer saber mais sobre como o {{nome_servico}} pode te ajudar? Entre em contato conosco e agende sua avaliação!', isEditable: false }] },
    variables: [ { key: 'nome_servico', label: 'Nome do Novo Serviço/Procedimento', type: 'text', required: true }, { key: 'publico_alvo', label: 'Para quem é indicado?', type: 'text', required: true }, { key: 'principal_beneficio', label: 'Qual o principal benefício?', type: 'text', required: true }, { key: 'detalhe_tecnico', label: 'Algum detalhe técnico ou diferencial? (opcional)', type: 'text', required: false, defaultValue: '' }],
    isPremium: true, usageCount: 42, rating: 4.9, tags: ['novidade', 'serviços', 'institucional']
  },
  {
    id: 'quick-tip-1', name: 'Dica Rápida da Semana', category: 'tips',
    structure: { sections: [ { id: 'header', type: 'header', content: '💡 DICA RÁPIDA DE SAÚDE\n\n{{titulo_da_dica}}', isEditable: true }, { id: 'body', type: 'body', content: 'Você sabia que {{fato_surpreendente}}?\n\nÉ por isso que recomendamos: {{dica_pratica}}.\n\nUm pequeno ajuste no seu dia a dia que pode fazer uma grande diferença!', isEditable: true }, { id: 'cta', type: 'cta', content: 'Gostou da dica? Salve este post e compartilhe com um amigo!\n\n#DicaDeSaude #{{especialidade}} #BemEstar', isEditable: true } ] },
    variables: [ { key: 'titulo_da_dica', label: 'Título da Dica (ex: Beba mais água!)', type: 'text', required: true }, { key: 'fato_surpreendente', label: 'Fato curto e interessante', type: 'text', required: true }, { key: 'dica_pratica', label: 'Ação prática que a pessoa pode tomar', type: 'text', required: true }, { key: 'especialidade', label: 'Sua especialidade (para hashtag)', type: 'text', required: true, defaultValue: 'saude' } ],
    isPremium: false, usageCount: 210, rating: 4.7, tags: ['dicas', 'rápido', 'educacional']
  },
  {
    id: 'qa-1', name: 'Respondendo Dúvidas (Q&A)', category: 'educational',
    structure: { sections: [ { id: 'header', type: 'header', content: '💬 DA SÉRIE "PERGUNTAS QUE RECEBO":\n\n"{{pergunta_do_paciente}}"', isEditable: true }, { id: 'body', type: 'body', content: 'Ótima pergunta! A resposta é: {{resposta_curta}}.\n\nVamos entender o porquê: {{explicacao_detalhada}}', isEditable: true }, { id: 'cta', type: 'cta', content: 'Essa também era a sua dúvida? Deixe um ❤️ nos comentários!\nSe tiver outra pergunta, mande na nossa caixinha!\n\n#PergunteAoEspecialista #{{especialidade}} #SaudeEmDia', isEditable: true } ] },
    variables: [ { key: 'pergunta_do_paciente', label: 'Pergunta comum do paciente', type: 'text', required: true }, { key: 'resposta_curta', label: 'Resposta direta (Sim, Não, Depende, etc.)', type: 'text', required: true }, { key: 'explicacao_detalhada', label: 'Explicação mais completa sobre a resposta', type: 'text', required: true }, { key: 'especialidade', label: 'Sua especialidade (para hashtag)', type: 'text', required: true, defaultValue: 'medico' } ],
    isPremium: false, usageCount: 180, rating: 4.9, tags: ['Q&A', 'engajamento', 'autoridade']
  },
  {
    id: 'step-by-step-1', name: 'Guia Passo a Passo', category: 'educational',
    structure: { sections: [ { id: 'header', type: 'header', content: '📋 GUIA DEFINITIVO: {{titulo_do_guia}}', isEditable: true }, { id: 'body', type: 'body', content: 'Preparado(a) para {{objetivo_do_guia}}? Salve este post para consultar depois!\n\n1️⃣ **Passo 1:** {{passo_1}}\n2️⃣ **Passo 2:** {{passo_2}}\n3️⃣ **Passo 3:** {{passo_3}}\n\n✨ **Dica Bônus:** {{dica_bonus}}', isEditable: true }, { id: 'cta', type: 'cta', content: 'Seguindo esses passos, você estará mais perto do seu objetivo. Tem alguma dúvida sobre o processo? Comente aqui!\n\n#GuiaDeSaude #{{especialidade}} #PassoAPasso', isEditable: true } ] },
    variables: [ { key: 'titulo_do_guia', label: 'Título do Guia (ex: Se Preparar para a sua Consulta)', type: 'text', required: true }, { key: 'objetivo_do_guia', label: 'Qual o objetivo final? (ex: ter uma consulta mais produtiva)', type: 'text', required: true }, { key: 'passo_1', label: 'Descrição do Passo 1', type: 'text', required: true }, { key: 'passo_2', label: 'Descrição do Passo 2', type: 'text', required: true }, { key: 'passo_3', label: 'Descrição do Passo 3', type: 'text', required: true }, { key: 'dica_bonus', label: 'Uma dica extra ou um alerta importante', type: 'text', required: false, defaultValue: 'Lembre-se de trazer todos os seus exames anteriores.' }, { key: 'especialidade', label: 'Sua especialidade (para hashtag)', type: 'text', required: true, defaultValue: 'saude' } ],
    isPremium: true, usageCount: 85, rating: 4.8, tags: ['guias', 'educacional', 'procedimentos']
  },
  {
    id: 'listicle-1', name: '5 Coisas Que Você Precisa Saber', category: 'tips',
    structure: { sections: [ { id: 'header', type: 'header', content: '🖐️ 5 FATOS IMPORTANTES SOBRE: {{topico_central}}', isEditable: true }, { id: 'body', type: 'body', content: 'Você realmente conhece tudo sobre {{topico_central}}? Confira 5 pontos essenciais:\n\n1. {{ponto_1}}\n2. {{ponto_2}}\n3. {{ponto_3}}\n4. {{ponto_4}}\n5. {{ponto_5}}', isEditable: true }, { id: 'cta', type: 'cta', content: 'Qual desses fatos mais te surpreendeu? Comente abaixo! 👇\n\n#{{hashtag_topico}} #Curiosidades #Saude', isEditable: true } ] },
    variables: [ { key: 'topico_central', label: 'Tópico principal (doença, tratamento, etc.)', type: 'text', required: true }, { key: 'ponto_1', label: 'Fato/Ponto 1', type: 'text', required: true }, { key: 'ponto_2', label: 'Fato/Ponto 2', type: 'text', required: true }, { key: 'ponto_3', label: 'Fato/Ponto 3', type: 'text', required: true }, { key: 'ponto_4', label: 'Fato/Ponto 4', type: 'text', required: true }, { key: 'ponto_5', label: 'Fato/Ponto 5', type: 'text', required: true }, { key: 'hashtag_topico', label: 'Hashtag principal relacionada ao tópico', type: 'text', required: true, defaultValue: 'fatosdesasude' } ],
    isPremium: true, usageCount: 92, rating: 4.7, tags: ['listas', 'viral', 'educacional']
  }
];
const getCustomTemplatesFromDB = (): Template[] => { try { const t = localStorage.getItem(CUSTOM_TEMPLATES_KEY); return t ? JSON.parse(t) : []; } catch { return []; } };
const saveCustomTemplatesToDB = (templates: Template[]): void => { localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates)); };
export const getTemplates = (filters?: { category?: string; specialty?: string; }): Promise<Template[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let templates = [...DEFAULT_TEMPLATES, ...getCustomTemplatesFromDB()];
            if (filters?.category && filters.category !== 'all') templates = templates.filter(t => t.category === filters.category);
            if (filters?.specialty) templates = templates.filter(t => !t.specialty || t.specialty === filters.specialty);
            resolve(templates);
        }, FAKE_API_DELAY);
    });
};
export const saveCustomTemplate = (template: Template): Promise<void> => {
    return new Promise((resolve) => {
        const customTemplates = getCustomTemplatesFromDB();
        const existingIndex = customTemplates.findIndex(t => t.id === template.id);
        if (existingIndex > -1) customTemplates[existingIndex] = template;
        else customTemplates.push(template);
        saveCustomTemplatesToDB(customTemplates);
        resolve();
    });
};

// --- HASHTAGS API ---
export const fetchTrendingHashtags = (): Promise<string[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, this would be an API call to a social media analytics service.
            resolve(['vacinassalvamvidas', 'setembroamarelo', 'saudedohomem', 'combateaocancer', 'diamundialdasaude']);
        }, FAKE_API_DELAY);
    });
};

// --- SAVED POSTS API ---

const SAVED_POSTS_STORAGE_KEY = 'medcontent_saved_posts';
type SavedPostsDB = Record<string, SavedPost[]>;

const getSavedPostsDB = (): SavedPostsDB => {
    try {
        const dbJson = localStorage.getItem(SAVED_POSTS_STORAGE_KEY);
        return dbJson ? JSON.parse(dbJson) : {};
    } catch (error) {
        console.error("Could not parse saved posts DB", error);
        return {};
    }
};

const saveSavedPostsDB = (db: SavedPostsDB): void => {
    localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(db));
};

export const savePost = (userId: string, postData: NewSavedPost): Promise<SavedPost> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getSavedPostsDB();
            if (!db[userId]) {
                db[userId] = [];
            }
            const newPost: SavedPost = {
                id: `post_${Date.now()}`,
                userId,
                createdAt: new Date().toISOString(),
                ...postData,
            };
            db[userId].unshift(newPost); // Add to the beginning
            saveSavedPostsDB(db);
            resolve(newPost);
        }, FAKE_API_DELAY);
    });
};

export const getPosts = (userId: string): Promise<SavedPost[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = getSavedPostsDB();
            resolve(db[userId] || []);
        }, FAKE_API_DELAY);
    });
};

export const deletePost = (userId: string, postId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getSavedPostsDB();
            if (!db[userId]) {
                return reject(new Error("User has no saved posts."));
            }
            const initialLength = db[userId].length;
            db[userId] = db[userId].filter(p => p.id !== postId);
            if (db[userId].length === initialLength) {
                return reject(new Error("Post not found."));
            }
            saveSavedPostsDB(db);
            resolve();
        }, FAKE_API_DELAY);
    });
};