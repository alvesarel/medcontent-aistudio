import React, { useState, useEffect, useMemo } from 'react';
import { SuggestedTheme, AiModelId, UserTier } from '../types';
import { AI_MODELS } from '../constants';
import * as contentService from '../services/contentService';

interface ThemeSelectorProps {
    suggestions: SuggestedTheme[];
    onConfirm: (selectedTheme: SuggestedTheme, selectedModel: AiModelId) => void;
    userTier: UserTier;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ suggestions, onConfirm, userTier }) => {
    const [selectedTheme, setSelectedTheme] = useState<SuggestedTheme | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableModels = useMemo(() => {
        return contentService.getAvailableModels(userTier);
    }, [userTier]);

    const [selectedModel, setSelectedModel] = useState<AiModelId>(availableModels[0]);
    
    useEffect(() => {
        // Automatically select the first theme when suggestions are loaded
        if (suggestions.length > 0 && !selectedTheme) {
            setSelectedTheme(suggestions[0]);
        }
    }, [suggestions, selectedTheme]);

    useEffect(() => {
        // Ensure the selected model is always one that is available
        if (!availableModels.includes(selectedModel)) {
            setSelectedModel(availableModels[0]);
        }
    }, [availableModels, selectedModel]);


    const handleSubmit = () => {
        if (!selectedTheme || !selectedModel) {
            alert("Por favor, selecione um tema e um modelo de IA para continuar.");
            return;
        }
        setIsSubmitting(true);
        onConfirm(selectedTheme, selectedModel);
    };

    const getModelDetails = (id: AiModelId) => AI_MODELS.find(m => m.id === id);

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-copy-text">Temas Sugeridos pela IA</h2>
                <p className="text-copy-text-secondary mt-1">Analisamos as tendências para você. Selecione o tema que mais se adequa ao seu conteúdo.</p>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTheme?.id === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-custom-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-copy-text">{theme.title}</h3>
                      <p className="text-sm text-copy-text-secondary mt-1">
                        {theme.description}
                      </p>
                      {theme.keywords && theme.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {theme.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-background rounded-md text-copy-text-secondary border border-custom-border"
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      theme.viralPotential === 'high' 
                        ? 'bg-green-100 text-green-800'
                        : theme.viralPotential === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {theme.viralPotential === 'high' ? '🔥 Alto' : 
                       theme.viralPotential === 'medium' ? '📈 Médio' : '📊 Baixo'} Potencial
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface pt-8">
              <h3 className="text-lg font-semibold text-copy-text mb-4">
                Selecione o Modelo de IA
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {availableModels.map((modelId) => {
                  const modelDetails = getModelDetails(modelId);
                  if (!modelDetails) return null;
                  return (
                    <button
                        key={modelId}
                        onClick={() => setSelectedModel(modelId)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedModel === modelId
                            ? 'border-primary bg-primary/5'
                            : 'border-custom-border hover:border-primary/50'
                        }`}
                    >
                        <div className="font-medium text-sm text-primary">{modelDetails.name}</div>
                        <div className="text-xs text-copy-text-secondary mt-1">
                            {modelDetails.provider}
                        </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-custom-border">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedTheme}
                    className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Gerando...
                        </>
                    ) : (
                        'Gerar Conteúdo com Tema e Modelo Selecionados'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ThemeSelector;
