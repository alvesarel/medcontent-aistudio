import React, { useState } from 'react';
import * as contentService from '../services/contentService';


interface ImageCreatorProps {
  textPost: string;
  initialPrompt: string;
  onGenerate: (prompt: string) => void;
  onSkip: () => void;
}

const ImageCreator: React.FC<ImageCreatorProps> = ({ textPost, initialPrompt, onGenerate, onSkip }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onGenerate(prompt);
  };
  
  const primaryButtonClasses = "w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed";

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-copy-text">Criação de Imagem com IA (Bônus Pro)</h2>
        <p className="text-copy-text-secondary mt-1">
          A IA sugeriu um prompt para criar uma imagem que acompanha seu post. Você pode editá-lo ou usá-lo como está.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-50 rounded-lg border border-custom-border">
          <h3 className="font-semibold text-copy-text mb-2">Texto do Post (para referência)</h3>
          <p className="whitespace-pre-wrap text-sm text-copy-text-secondary max-h-80 overflow-y-auto pr-2">{textPost}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-copy-text-secondary mb-2">
              Prompt para Geração de Imagem
            </label>
            <textarea
              id="image-prompt"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400"
              placeholder="Descreva a imagem que você deseja criar..."
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-custom-border">
            <button
              type="submit"
              disabled={isSubmitting || !prompt}
              className={primaryButtonClasses}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando Imagem...
                </>
              ) : (
                'Gerar Imagem'
              )}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className={`${primaryButtonClasses} sm:w-auto`}
            >
              Pular Etapa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageCreator;