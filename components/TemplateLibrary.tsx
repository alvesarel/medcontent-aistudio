import React, { useState, useMemo, useEffect } from 'react';
import { Template } from '../types/templates';
import { User } from '../types';
import * as templateService from '../services/templateService';
import LoadingSpinner from './LoadingSpinner';

interface TemplateLibraryProps {
    onSelectTemplate: (template: Template) => void;
    user: User | null;
}

const TemplateCard: React.FC<{ template: Template; onSelect: () => void; isLocked: boolean }> = ({ template, onSelect, isLocked }) => (
    <div
        onClick={!isLocked ? onSelect : undefined}
        className={`bg-surface p-6 rounded-xl border-2 transition-all duration-300 flex flex-col ${
            isLocked
                ? 'border-custom-border filter grayscale cursor-not-allowed relative'
                : 'border-custom-border hover:border-primary hover:shadow-lg cursor-pointer'
        }`}
    >
        {isLocked && (
            <div className="absolute inset-0 bg-slate-400/30 rounded-xl flex items-center justify-center">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 6 8.5h4A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm-2 3.5a2 2 0 1 1 4 0V7H6V4.5ZM5 8.5A1.5 1.5 0 0 1 3.5 7V4.5a4.5 4.5 0 1 1 9 0V7A1.5 1.5 0 0 1 11 8.5v2a.5.5 0 0 1-.5.5H12a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0V12a.5.5 0 0 1-.5-.5h-2a.5.5 0 0 1-.5.5v2.5a.5.5 0 0 1-1 0V12a.5.5 0 0 1-.5-.5H5.5a.5.5 0 0 1-.5-.5v-2Z" clipRule="evenodd" /></svg>
                    Plano Pro+
                </span>
            </div>
        )}
        <h3 className="text-lg font-bold text-copy-text">{template.name}</h3>
        <p className="text-sm text-copy-text-secondary mt-2 flex-grow">{template.name}</p>
        <div className="flex items-center justify-between text-xs text-copy-text-secondary mt-2">
            <span>⭐ {template.rating}</span>
            <span>{template.usageCount} usos</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-custom-border">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">{template.category}</span>
            {template.tags?.map(tag => (
                 <span key={tag} className="text-xs px-2 py-1 bg-background rounded-md text-copy-text-secondary border border-custom-border">#{tag}</span>
            ))}
        </div>
    </div>
);


const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, user }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    const userTier = user?.tier || 'Iniciante';
    const categories = ['all', 'educational', 'myth-vs-truth', 'tips', 'case-study', 'announcement', 'custom'];
    
    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const fetchedTemplates = await templateService.getTemplates({
                    category: categoryFilter === 'all' ? undefined : categoryFilter
                });
                setTemplates(fetchedTemplates);
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, [categoryFilter]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const query = searchQuery.toLowerCase();
            return query === '' || 
                   template.name.toLowerCase().includes(query) ||
                   template.tags?.some(tag => tag.toLowerCase().includes(query));
        });
    }, [templates, searchQuery]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-copy-text">Biblioteca de Templates</h2>
                <p className="text-copy-text-secondary mt-2 max-w-2xl mx-auto">
                    Acelere sua criação de conteúdo com modelos pré-definidos e testados. Escolha um template para começar.
                </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center sticky top-20 z-10 py-4 bg-background/80 backdrop-blur-sm">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Pesquisar templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-surface border border-custom-border rounded-full shadow-sm focus:ring-primary focus:border-primary"
                    />
                </div>
                 <div className="flex justify-center flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors ${
                                categoryFilter === category
                                    ? 'bg-primary text-white shadow'
                                    : 'bg-surface text-copy-text hover:bg-primary/10 hover:text-primary border border-custom-border'
                            }`}
                        >
                            {category.replace('-',' ')}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => {
                        const isLocked = template.isPremium && userTier === 'Iniciante';
                        return (
                           <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={() => onSelectTemplate(template)}
                                isLocked={isLocked}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    );
}

export default TemplateLibrary;