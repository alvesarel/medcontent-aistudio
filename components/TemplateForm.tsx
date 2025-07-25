import React, { useState, useMemo, useEffect } from 'react';
import { Template, TemplateVariable } from '../types/templates';
import { Platform, AiModelId, UserTier } from '../types';
import { PLATFORM_OPTIONS, AI_MODELS } from '../constants';
import * as contentService from '../services/contentService';

interface TemplateFormProps {
    template: Template;
    onGenerate: (template: Template, placeholderValues: Record<string, string>, platform: Platform, model: AiModelId) => void;
    onBack: () => void;
    userTier: UserTier;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onGenerate, onBack, userTier }) => {
    const initialValues = useMemo(() => 
        (template.variables || []).reduce((acc, p) => ({ ...acc, [p.key]: p.defaultValue || '' }), {}),
    [template.variables]);

    const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>(initialValues);
    
    const compatiblePlatforms = template.structure?.defaultPlatform ? [template.structure.defaultPlatform] : PLATFORM_OPTIONS;
    const [platform, setPlatform] = useState<Platform>(compatiblePlatforms[0]);
    
    const availableModels = useMemo(() => contentService.getAvailableModels(userTier), [userTier]);
    const [model, setModel] = useState<AiModelId>(availableModels[0]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        // Ensure selected model is always available
        if (!availableModels.find(m => m === model)) {
            setModel(availableModels[0]);
        }
    }, [availableModels, model]);

    const handleInputChange = (key: string, value: string) => {
        setPlaceholderValues(prev => ({ ...prev, [key]: value }));
    };

    const isFormValid = useMemo(() => {
        return (template.variables || []).every(p => !p.required || placeholderValues[p.key]?.trim() !== '');
    }, [placeholderValues, template.variables]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsSubmitting(true);
        onGenerate(template, placeholderValues, platform, model);
    };

    const baseInputClasses = "w-full px-3 py-2 bg-white text-copy-text border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400";
    const getModelDetails = (id: AiModelId) => AI_MODELS.find(m => m.id === id);

    const renderVariableInput = (variable: TemplateVariable) => {
        switch (variable.type) {
            case 'select':
                return (
                    <select
                        id={variable.key}
                        value={placeholderValues[variable.key]}
                        onChange={e => handleInputChange(variable.key, e.target.value)}
                        className={`${baseInputClasses} custom-select`}
                        required={variable.required}
                    >
                        {variable.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'number':
                return (
                    <input
                        id={variable.key}
                        type="number"
                        value={placeholderValues[variable.key]}
                        onChange={e => handleInputChange(variable.key, e.target.value)}
                        className={baseInputClasses}
                        required={variable.required}
                    />
                );
            case 'date':
                 return (
                    <input
                        id={variable.key}
                        type="date"
                        value={placeholderValues[variable.key]}
                        onChange={e => handleInputChange(variable.key, e.target.value)}
                        className={baseInputClasses}
                        required={variable.required}
                    />
                );
            case 'text':
            default:
                return (
                    <textarea
                        id={variable.key}
                        value={placeholderValues[variable.key]}
                        onChange={e => handleInputChange(variable.key, e.target.value)}
                        rows={3}
                        className={baseInputClasses}
                        required={variable.required}
                    />
                );
        }
    };
    
    const FormField: React.FC<{label: string, htmlFor: string, children: React.ReactNode}> = ({ label, htmlFor, children }) => (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-copy-text-secondary mb-2">{label}</label>
            {children}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-copy-text">{template.name}</h2>
                    <p className="text-copy-text-secondary mt-1 max-w-2xl">{template.name}</p>
                </div>
                <button type="button" onClick={onBack} className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                    &larr; Voltar
                </button>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-custom-border">
                 {(template.variables || []).map(variable => (
                    <FormField key={variable.key} label={variable.label} htmlFor={variable.key}>
                        {renderVariableInput(variable)}
                    </FormField>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-custom-border">
                <FormField label="Plataforma de Destino" htmlFor="platform">
                    <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={`${baseInputClasses} custom-select`}>
                        {compatiblePlatforms.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FormField>
                <FormField label="Modelo de IA" htmlFor="model-selector">
                    <div id="model-selector" className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                         {availableModels.map((modelId) => {
                            const modelDetails = getModelDetails(modelId);
                            if (!modelDetails) return null;
                            return (
                                <button
                                    type="button"
                                    key={modelId}
                                    onClick={() => setModel(modelId)}
                                    className={`p-2 rounded-lg border-2 text-left transition-all text-sm ${
                                    model === modelId
                                        ? 'border-primary bg-primary/5'
                                        : 'border-custom-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="font-medium text-primary">{modelDetails.name}</div>
                                    <div className="text-xs text-copy-text-secondary">{modelDetails.provider}</div>
                                </button>
                            )
                        })}
                    </div>
                </FormField>
            </div>
      
            <div className="pt-6 border-t border-custom-border">
                <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Gerando...' : 'Gerar Conteúdo com Template'}
                </button>
            </div>
        </form>
    );
};

export default TemplateForm;