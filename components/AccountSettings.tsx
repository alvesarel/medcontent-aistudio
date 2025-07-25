import React, { useState, useEffect } from 'react';
import { User, AccountSettings, Tone, Platform } from '../types';
import { DEFAULT_TONES, PLATFORM_OPTIONS, GUEST_SETTINGS } from '../constants';

interface AccountSettingsProps {
  user: User;
  onSave: (settings: AccountSettings) => Promise<void>;
  onCancel: () => void;
}

const FormCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm">
        <h3 className="text-xl font-bold text-copy-text">{title}</h3>
        <p className="text-copy-text-secondary mt-1 mb-6">{description}</p>
        <div className="space-y-6">{children}</div>
    </div>
);

const FormField: React.FC<{label: string, htmlFor: string, children: React.ReactNode}> = ({ label, htmlFor, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-copy-text-secondary mb-2">{label}</label>
        {children}
    </div>
);


const AccountSettingsComponent: React.FC<AccountSettingsProps> = ({ user, onSave, onCancel }) => {
  const [settings, setSettings] = useState<AccountSettings>(user.settings || GUEST_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTone, setEditingTone] = useState<Tone | null>(null);
  
  const allTones = [...DEFAULT_TONES, ...(settings.customTones || [])];

  useEffect(() => {
    setSettings(currentSettings => ({
      ...GUEST_SETTINGS, 
      ...user.settings,
      brandColors: user.settings?.brandColors || GUEST_SETTINGS.brandColors
    }));
  }, [user.settings]);

  const handleInputChange = (field: keyof Omit<AccountSettings, 'brandColors' | 'socialHandles' | 'customTones' | 'toneId'>, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSelectChange = (field: keyof Pick<AccountSettings, 'toneId'>, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
    setSettings(prev => ({
        ...prev,
        brandColors: {
            ...(prev.brandColors || GUEST_SETTINGS.brandColors),
            [colorType]: value
        }
    }))
  }
  
  const handleSocialHandleChange = (platform: Platform, value: string) => {
      setSettings(prev => ({
          ...prev,
          socialHandles: {
              ...prev.socialHandles,
              [platform]: value
          }
      }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB size limit
          alert("O arquivo é muito grande. Por favor, escolha um arquivo menor que 1MB.");
          return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange('brandLogo', reader.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Não foi possível ler o arquivo.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTone = (tone: Tone) => {
    const customTones = settings.customTones || [];
    const existingIndex = customTones.findIndex(t => t.id === tone.id);
    let updatedTones;
    if (existingIndex > -1) {
      updatedTones = [...customTones];
      updatedTones[existingIndex] = tone;
    } else {
      updatedTones = [...customTones, tone];
    }
    setSettings(prev => ({...prev, customTones: updatedTones}));
    setEditingTone(null); // Close editor
  };

  const handleDeleteTone = (toneId: string) => {
    if (confirm('Tem certeza que deseja apagar este tom personalizado?')) {
        const updatedTones = (settings.customTones || []).filter(t => t.id !== toneId);
        const newToneId = settings.toneId === toneId ? DEFAULT_TONES[0].id : settings.toneId;
        setSettings(prev => ({ ...prev, customTones: updatedTones, toneId: newToneId }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(settings);
    setIsSaving(false);
  };
  
  const inputClasses = "w-full px-3 py-2 bg-white text-copy-text border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400";
  const primaryButtonClasses = "px-6 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors disabled:bg-primary/40 flex items-center justify-center shadow-sm";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-copy-text">Configurações da Conta</h2>
        <button type="button" onClick={onCancel} className={primaryButtonClasses}>
            Voltar ao Gerador
        </button>
      </div>

      <FormCard title="Identidade da Marca" description="Defina a voz e os detalhes da sua marca para personalizar todo o conteúdo gerado.">
        <FormField label="Voz da Marca" htmlFor="brandVoice">
          <textarea
            id="brandVoice"
            value={settings.brandVoice}
            onChange={(e) => handleInputChange('brandVoice', e.target.value)}
            rows={3}
            placeholder="Ex: Profissional, mas acessível. Foco em educar e construir confiança..."
            className={inputClasses}
          />
        </FormField>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <FormField label="Logo da Marca" htmlFor="brandLogoInput">
                     <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border border-custom-border overflow-hidden shrink-0">
                            {settings.brandLogo ? (
                                <img src={settings.brandLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <label htmlFor="brandLogoInput" className="cursor-pointer text-sm text-primary font-semibold hover:underline">
                            {settings.brandLogo ? 'Trocar' : 'Carregar'}
                        </label>
                        <input id="brandLogoInput" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="hidden" />
                    </div>
                </FormField>
            </div>
            <div className="md:col-span-2">
                <FormField label="Cores da Marca" htmlFor="brandColorPrimary">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <label htmlFor="brandColorPrimary" className="text-sm text-copy-text-secondary">Primária:</label>
                           <input type="color" id="brandColorPrimary" value={settings.brandColors?.primary || '#3b82f6'} onChange={(e) => handleColorChange('primary', e.target.value)} className="w-10 h-10 rounded-md border-none cursor-pointer bg-transparent" />
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="brandColorSecondary" className="text-sm text-copy-text-secondary">Secundária:</label>
                           <input type="color" id="brandColorSecondary" value={settings.brandColors?.secondary || '#f9fafb'} onChange={(e) => handleColorChange('secondary', e.target.value)} className="w-10 h-10 rounded-md border-none cursor-pointer bg-transparent" />
                        </div>
                    </div>
                </FormField>
            </div>
        </div>
        <FormField label="Redes Sociais (Opcional)" htmlFor="socials">
            <div id="socials" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLATFORM_OPTIONS.map(platform => (
                    <div key={platform} className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-copy-text-secondary">@</span>
                        <input
                            type="text"
                            placeholder={platform}
                            value={settings.socialHandles?.[platform] || ''}
                            onChange={(e) => handleSocialHandleChange(platform, e.target.value)}
                            className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                ))}
            </div>
        </FormField>
      </FormCard>
      
      <FormCard title="Tons de Voz" description="Gerencie os estilos de escrita da IA. O tom selecionado será usado para todas as gerações.">
        <FormField label="Tom de Voz Ativo" htmlFor="toneId">
            <select
                id="toneId"
                value={settings.toneId}
                onChange={(e) => handleSelectChange('toneId', e.target.value)}
                className={`${inputClasses} custom-select`}
            >
                {allTones.map(tone => <option key={tone.id} value={tone.id}>{tone.name}</option>)}
            </select>
        </FormField>
        
        <div>
            <h4 className="text-md font-semibold text-copy-text mb-2">Tons Personalizados</h4>
            <div className="space-y-3">
                {(settings.customTones || []).map(tone => (
                    <div key={tone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-custom-border">
                        <span className="text-sm font-medium text-copy-text">{tone.name}</span>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setEditingTone(tone)} className={primaryButtonClasses}>Editar</button>
                            <button type="button" onClick={() => handleDeleteTone(tone.id)} className={primaryButtonClasses}>Apagar</button>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => setEditingTone({id: `custom-${Date.now()}`, name: '', prompt: ''})}
                    className="w-full text-center py-2 px-4 border-2 border-dashed border-custom-border rounded-lg text-sm font-semibold text-copy-text-secondary hover:border-primary hover:text-primary transition"
                >
                    + Adicionar Novo Tom
                </button>
            </div>
        </div>

        {editingTone && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-md font-semibold text-copy-text mb-4">{editingTone.id.startsWith('custom-') ? 'Adicionar Novo Tom' : 'Editar Tom'}</h4>
                <div className="space-y-4">
                    <FormField label="Nome do Tom" htmlFor="toneName">
                        <input type="text" id="toneName" value={editingTone.name} onChange={e => setEditingTone({...editingTone, name: e.target.value})} className={inputClasses} />
                    </FormField>
                    <FormField label="Instrução para a IA" htmlFor="tonePrompt">
                        <textarea id="tonePrompt" rows={3} value={editingTone.prompt} onChange={e => setEditingTone({...editingTone, prompt: e.target.value})} className={inputClasses} />
                    </FormField>
                    <div className="flex items-center justify-end gap-3">
                        <button type="button" onClick={() => setEditingTone(null)} className={primaryButtonClasses}>Cancelar</button>
                        <button type="button" onClick={() => handleSaveTone(editingTone)} disabled={!editingTone.name || !editingTone.prompt} className={primaryButtonClasses}>Salvar Tom</button>
                    </div>
                </div>
            </div>
        )}
      </FormCard>

      <div className="pt-6 flex justify-end items-center gap-4">
          <button type="button" onClick={onCancel} className={primaryButtonClasses}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={primaryButtonClasses}
          >
            {isSaving && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
      </div>
    </form>
  );
};

export default AccountSettingsComponent;