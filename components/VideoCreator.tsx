import React, { useState } from 'react';
import * as contentService from '../services/contentService';

interface VideoCreatorProps {
  textPost: string;
  onGenerate: () => void;
  onSkip: () => void;
}

const VideoCreator: React.FC<VideoCreatorProps> = ({ textPost, onGenerate, onSkip }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onGenerate();
  };

  const primaryButtonClasses = "w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed";

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-copy-text">Criação de Vídeo com IA (Bônus Ultra)</h2>
        <p className="text-copy-text-secondary mt-1">
          Transforme seu post em um roteiro de vídeo curto (storyboard) com imagens geradas por IA para cada cena.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-50 rounded-lg border border-custom-border">
          <h3 className="font-semibold text-copy-text mb-2">Texto do Post (para referência)</h3>
          <p className="whitespace-pre-wrap text-sm text-copy-text-secondary max-h-80 overflow-y-auto pr-2">{textPost}</p>
        </div>
        
        <div className="flex flex-col justify-center items-center space-y-6 p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
          </svg>

          <p className="text-center text-copy-text-secondary">A IA irá analisar seu post e criar um storyboard com 3 cenas, incluindo narração e imagens, otimizado para vídeos curtos.</p>
          
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-custom-border">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={primaryButtonClasses}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando Roteiro...
                </>
              ) : (
                'Gerar Roteiro de Vídeo'
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
        </div>
      </div>
    </div>
  );
};

export default VideoCreator;