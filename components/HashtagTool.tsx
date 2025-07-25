import React, { useState } from 'react';
import * as hashtagService from '../services/hashtagService';
import { HashtagSuggestion } from '../types/hashtags';
import LoadingSpinner from './LoadingSpinner';

interface HashtagToolProps {
  content: string;
  specialty: string;
  location: string;
  selectedTags: Set<string>;
  onSelectionChange: (newSelection: Set<string>) => void;
}

const HashtagTool: React.FC<HashtagToolProps> = ({ content, specialty, location, selectedTags, onSelectionChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<HashtagSuggestion[] | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleSuggest = async () => {
        setIsLoading(true);
        setSuggestions(null);
        try {
            const result = await hashtagService.suggestHashtags(content, specialty, location);
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to suggest hashtags", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTag = (tag: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) {
            newSet.delete(tag);
        } else {
            newSet.add(tag);
        }
        onSelectionChange(newSet);
    };

    const handleCopy = () => {
        const hashtagString = Array.from(selectedTags).map(t => `#${t}`).join(' ');
        navigator.clipboard.writeText(hashtagString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const renderSuggestions = () => {
        if (!suggestions) return null;

        const grouped = suggestions.reduce((acc, s) => {
            (acc[s.category] = acc[s.category] || []).push(s);
            return acc;
        }, {} as Record<string, HashtagSuggestion[]>);

        return (
            <div className="mt-6 space-y-4">
                {['trending', 'specialty', 'location', 'general'].map(category => {
                    const categoryTags = grouped[category];
                    if (!categoryTags || categoryTags.length === 0) return null;
                    return (
                        <div key={category}>
                             <p className="text-sm font-semibold text-copy-text-secondary mb-2 capitalize flex items-center gap-2">
                                {category === 'trending' && '🔥 Em Alta'}
                                {category === 'specialty' && '🏥 Especialidade'}
                                {category === 'location' && '📍 Localização'}
                                {category === 'general' && '💊 Saúde Geral'}
                             </p>
                             <div className="flex flex-wrap gap-2">
                                {categoryTags.map(sugg => (
                                    <button
                                        key={sugg.tag}
                                        onClick={() => toggleTag(sugg.tag)}
                                        className={`px-3 py-1 text-sm rounded-full transition-all border ${selectedTags.has(sugg.tag) ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-primary/10 text-copy-text border-custom-border'}`}
                                    >
                                        #{sugg.tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm">
            <h2 className="text-2xl font-bold text-copy-text">Ferramenta de Hashtags</h2>
            <p className="text-copy-text-secondary mt-1">Gere e selecione as melhores hashtags para aumentar o alcance do seu post.</p>

            {!suggestions && !isLoading && (
                <div className="mt-6 text-center">
                    <button onClick={handleSuggest} className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-colors">
                        Sugerir Hashtags com IA
                    </button>
                </div>
            )}
            
            {isLoading && <div className="py-8"><LoadingSpinner /></div>}
            
            {suggestions && (
                 <>
                    <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-custom-border min-h-[80px]">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-copy-text">Hashtags Selecionadas ({selectedTags.size})</h3>
                            {selectedTags.size > 0 && (
                                <button onClick={handleCopy} className="text-sm font-semibold text-primary hover:text-primary-600 transition-colors">
                                    {isCopied ? 'Copiado!' : 'Copiar'}
                                </button>
                            )}
                        </div>
                        {selectedTags.size > 0 ? (
                           <p className="text-copy-text-secondary leading-relaxed">
                                {Array.from(selectedTags).map(t => `#${t}`).join(' ')}
                           </p>
                        ) : (
                            <p className="text-copy-text-secondary text-sm">Clique nas sugestões abaixo para selecionar.</p>
                        )}
                    </div>
                    {renderSuggestions()}
                 </>
            )}
        </div>
    );
};

export default HashtagTool;