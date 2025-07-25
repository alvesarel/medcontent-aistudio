import React from 'react';
import { User, AppView } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  onShowAuth: () => void;
}

const NavButton: React.FC<{
    label: string; 
    onClick?: () => void; 
    isActive?: boolean; 
    isDisabled?: boolean;
}> = ({ label, onClick, isActive, isDisabled }) => {
    const baseClasses = "px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200";
    const activeClasses = "bg-primary/10 text-primary";
    const inactiveClasses = "text-copy-text hover:bg-primary/10 hover:text-primary";
    const disabledClasses = "text-slate-400 cursor-not-allowed";

    const getClasses = () => {
        if (isDisabled) return `${baseClasses} ${disabledClasses}`;
        if (isActive) return `${baseClasses} ${activeClasses}`;
        return `${baseClasses} ${inactiveClasses}`;
    }

    return (
        <button onClick={onClick} className={getClasses()} disabled={isDisabled}>
            <span>{label}</span>
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate, currentView, onShowAuth }) => {
  const primaryButtonStyles = "px-4 py-1.5 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-600 transition-colors shadow-sm";
  
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-custom-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
            onClick={() => onNavigate('app')} 
            className="flex items-center space-x-3 cursor-pointer" 
            aria-label="Go to homepage"
        >
           <Logo className="h-8 w-8 text-primary"/>
          <h1 className="text-2xl font-bold text-copy-text hidden sm:block">
            MedContent <span className="text-primary">AI</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-1">
             <NavButton 
                label="Gerador"
                onClick={() => onNavigate('app')}
                isActive={currentView === 'app'}
            />
             <NavButton 
                label="Templates"
                onClick={() => onNavigate('templates')}
                isActive={currentView === 'templates'}
            />
            {user && (
              <NavButton
                label="Minhas Publicações"
                onClick={() => onNavigate('my-posts')}
                isActive={currentView === 'my-posts'}
              />
            )}
             <NavButton 
                label="Ideias"
                onClick={() => onNavigate('ideas')}
                isActive={currentView === 'ideas'}
            />
            <NavButton 
                label="Verificador"
                onClick={() => onNavigate('compliance')}
                isActive={currentView === 'compliance'}
            />
             <NavButton 
                label="Planos"
                onClick={() => onNavigate('pricing')}
                isActive={currentView === 'pricing'}
            />
             <NavButton 
                label="Analytics"
                onClick={() => onNavigate('analytics')}
                isActive={currentView === 'analytics'}
            />
        </nav>

        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
             <button
              onClick={() => onNavigate('settings')}
              title="Configurações da Conta"
              className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-copy-text-secondary hover:bg-primary/10 hover:text-primary'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-.11.55.897.09 1.998.11 3.09.02.678.06 1.35.09 2.022.03.676.06 1.353-.09 2.03-.03.677-.06 1.35-.09 2.023-.02 1.092-.44 2.193-.11 3.09.65.9 1.02-.433 1.11-.11a12.006 12.006 0 0 0 .09-2.023c.03-.677.06-1.35.09-2.022.02-.678.06-1.353.09-2.03.03-.676.06-1.35.09-2.022a12.006 12.006 0 0 0-.09-2.023Z" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12.343 3.94c.09-.542.56-1.007 1.11-.11.55.897.09 1.998.11 3.09.02.678.06 1.35.09 2.022.03.676.06 1.353-.09 2.03-.03.677-.06 1.35-.09 2.023-.02 1.092-.44 2.193-.11 3.09.65.9 1.02-.433 1.11-.11a12.006 12.006 0 0 0 .09-2.023c.03-.677.06-1.35.09-2.022.02-.678.06-1.353.09-2.03.03-.676.06-1.35.09-2.022a12.006 12.006 0 0 0-.09-2.023Z" />
                </svg>
            </button>
             <button
              onClick={onLogout}
              className={`${primaryButtonStyles} flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-6-3 3m0 0 3 3m-3-3H21" /></svg>
              <span className="hidden sm:inline ml-1.5">Sair</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button onClick={onShowAuth} className="text-copy-text-secondary font-semibold text-sm hover:text-primary transition-colors">Entrar</button>
            <button onClick={() => onNavigate('pricing')} className={primaryButtonStyles}>
              Criar Conta Grátis
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;