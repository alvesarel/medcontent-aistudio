import React, { useState, useMemo, useEffect } from 'react';
import { UserData, Platform, Profession, UserTier, AiModelId } from '../types';
import { PROFESSION_OPTIONS, PLATFORM_OPTIONS, MEDICAL_AREAS, DENTAL_AREAS } from '../constants';
import * as contentService from '../services/contentService';


interface InputFormProps {
  onGenerate: (userData: Omit<UserData, 'model'>, platform: Platform) => void;
  userTier: UserTier;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, userTier }) => {
  const [profession, setProfession] = useState<Profession>(Profession.Medico);
  const [area, setArea] = useState<string>('');
  const [services, setServices] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>(Platform.Instagram);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingServices, setIsSuggestingServices] = useState(false);


  const availableAreas = useMemo(() => {
    return profession === Profession.Medico ? MEDICAL_AREAS : DENTAL_AREAS;
  }, [profession]);

  useEffect(() => {
    // Reset fields when profession changes
    setArea('');
    setServices('');
  }, [profession]);
  
  useEffect(() => {
    // Set default area when areas become available
    if(availableAreas.length > 0 && !area) {
        setArea(availableAreas[0]);
    }
  }, [availableAreas, area]);

  const handleSuggestServices = async () => {
    if (!profession || !area) return;
    setIsSuggestingServices(true);
    try {
        const suggested = await contentService.suggestServices(profession, area);
        setServices(suggested);
    } catch (error) {
        console.error(error);
        alert('Não foi possível sugerir serviços no momento. Tente novamente mais tarde.');
    } finally {
        setIsSuggestingServices(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceList = services.split('\n').map(s => s.trim()).filter(Boolean);
    if (serviceList.length === 0) {
      alert('Por favor, liste pelo menos um serviço ofertado.');
      return;
    }
    setIsSubmitting(true);
    const userData: Omit<UserData, 'model'> = { 
        profession, 
        area, 
        services: serviceList,
        location: location.trim(),
    };
    onGenerate(userData, platform);
  };

  const FormField: React.FC<{label: string, htmlFor: string, children: React.ReactNode}> = ({ label, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-copy-text-secondary mb-2">{label}</label>
        {children}
    </div>
  );
  
  const baseInputClasses = "w-full px-3 py-2 bg-white text-copy-text border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400";

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-copy-text">Detalhes Profissionais</h2>
        <p className="text-copy-text-secondary mt-1">Conte-nos sobre sua atuação para personalizar o conteúdo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Profissão" htmlFor="profession">
          <select id="profession" value={profession} onChange={(e) => setProfession(e.target.value as Profession)} className={`${baseInputClasses} custom-select`}>
            {PROFESSION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Área de Atuação" htmlFor="area">
          <select id="area" value={area} onChange={(e) => setArea(e.target.value)} className={`${baseInputClasses} custom-select`}>
            {availableAreas.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
      </div>

      <div>
          <div className="flex justify-between items-center mb-2">
              <label htmlFor="services" className="block text-sm font-medium text-copy-text-secondary">Serviços Ofertados (um por linha)</label>
               <button
                  type="button"
                  onClick={handleSuggestServices}
                  disabled={!area || isSuggestingServices}
                  className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Sugerir serviços com IA"
              >
                  {isSuggestingServices ? (
                     <>
                       <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sugerindo...
                     </>
                  ) : (
                      <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M11.982 2.004a2.25 2.25 0 0 1 3.236 0l1.768 1.768a2.25 2.25 0 0 1 0 3.236l-3.536 3.536a2.25 2.25 0 0 1-3.236 0l-1.768-1.768a2.25 2.25 0 0 1 0-3.236l3.536-3.536Zm-3.536 3.536a2.25 2.25 0 0 1 0-3.236l1.768-1.768a2.25 2.25 0 0 1 3.236 0l3.536 3.536a2.25 2.25 0 0 1 0 3.236l-1.768 1.768a2.25 2.25 0 0 1-3.236 0l-3.536-3.536Z" />
                              <path d="m3.232 8.464 1.768-1.768a2.25 2.25 0 0 1 3.236 0l3.536 3.536a2.25 2.25 0 0 1 0 3.236l-1.768 1.768a2.25 2.25 0 0 1-3.236 0l-3.536-3.536a2.25 2.25 0 0 1 0-3.236Z" />
                          </svg>
                          Preencher com IA
                      </>
                  )}
              </button>
          </div>
        <textarea
            id="services" value={services} onChange={e => setServices(e.target.value)}
            rows={4} placeholder="Ex: Emagrecimento avançado&#10;Terapia hormonal bioidêntica"
            className={baseInputClasses}
            required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Localização (Opcional)" htmlFor="location">
              <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Itaim Bibi, São Paulo" className={baseInputClasses}
              />
          </FormField>
          <FormField label="Plataforma de Destino" htmlFor="platform">
            <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={`${baseInputClasses} custom-select`}>
              {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </FormField>
      </div>
      
      <div className="pt-6 border-t border-custom-border">
        <button
          type="submit"
          disabled={isSubmitting || services.trim() === ''}
          className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando...
            </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11.982 2.004a2.25 2.25 0 0 1 3.236 0l1.768 1.768a2.25 2.25 0 0 1 0 3.236l-3.536 3.536a2.25 2.25 0 0 1-3.236 0l-1.768-1.768a2.25 2.25 0 0 1 0-3.236l3.536-3.536Zm-3.536 3.536a2.25 2.25 0 0 1 0-3.236l1.768-1.768a2.25 2.25 0 0 1 3.236 0l3.536 3.536a2.25 2.25 0 0 1 0 3.236l-1.768 1.768a2.25 2.25 0 0 1-3.236 0l-3.536-3.536Z" />
                   <path d="m3.232 8.464 1.768-1.768a2.25 2.25 0 0 1 3.236 0l3.536 3.536a2.25 2.25 0 0 1 0 3.236l-1.768 1.768a2.25 2.25 0 0 1-3.236 0l-3.536-3.536a2.25 2.25 0 0 1 0-3.236Z" />
                </svg>
              Pesquisar Temas e Sugerir Conteúdo
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;