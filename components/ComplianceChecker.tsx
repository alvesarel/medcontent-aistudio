import React, { useState } from 'react';
import { analyzeCompliance } from '../services/complianceService';
import { ComplianceResult, Platform } from '../types';
import ComplianceReport from './ComplianceReport';
import LoadingSpinner from './LoadingSpinner';

const ComplianceChecker: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<ComplianceResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Por favor, insira um texto para ser analisado.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Use a generic platform since the rules are mostly platform-agnostic
            const analysisResult = await analyzeCompliance(text, Platform.Instagram);
            setResult(analysisResult);
        } catch (err) {
            setError('Ocorreu uma falha ao analisar o conteúdo. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const baseInputClasses = "w-full px-3 py-2 bg-white text-copy-text border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400";
    const primaryButtonClasses = "w-full sm:w-auto flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm">
                <h2 className="text-3xl font-bold text-copy-text">Verificador de Conformidade</h2>
                <p className="text-copy-text-secondary mt-2">
                    Cole seu texto abaixo para uma análise instantânea de conformidade com as diretrizes de publicidade médica do CFM/CRO.
                </p>

                <div className="mt-6">
                     <label htmlFor="compliance-text" className="block text-sm font-medium text-copy-text-secondary mb-2">
                        Conteúdo para Análise
                    </label>
                    <textarea
                        id="compliance-text"
                        rows={10}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className={baseInputClasses}
                        placeholder="Cole o texto do seu post, legenda ou roteiro aqui..."
                    />
                </div>

                {error && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-custom-border flex justify-end">
                    <button onClick={handleAnalyze} disabled={isLoading || !text.trim()} className={primaryButtonClasses}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Analisando...
                            </>
                        ) : 'Analisar Conteúdo'}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="text-center p-8">
                    <LoadingSpinner />
                </div>
            )}

            {result && (
                <div className="mt-8">
                    <ComplianceReport result={result} />
                </div>
            )}
        </div>
    );
};

export default ComplianceChecker;
