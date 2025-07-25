import React from 'react';
import Logo from './Logo';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-surface mt-24 border-t border-custom-border">
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
                 <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('app')}>
                    <Logo className="h-8 w-8 text-primary"/>
                    <h1 className="text-2xl font-bold text-copy-text">
                        MedContent <span className="text-primary">AI</span>
                    </h1>
                </div>
                <p className="mt-4 text-copy-text-secondary max-w-xs">
                    Potencializando a presença digital de profissionais da saúde no Brasil com inteligência artificial.
                </p>
            </div>
            <div>
                 <h4 className="font-semibold text-copy-text">Navegação</h4>
                 <ul className="mt-4 space-y-2 text-copy-text-secondary">
                    <li><button onClick={() => onNavigate('app')} className="hover:text-primary transition-colors">Gerador de Conteúdo</button></li>
                    <li><button onClick={() => onNavigate('templates')} className="hover:text-primary transition-colors">Biblioteca de Templates</button></li>
                    <li><button onClick={() => onNavigate('compliance')} className="hover:text-primary transition-colors">Verificador de Conformidade</button></li>
                    <li><button onClick={() => onNavigate('pricing')} className="hover:text-primary transition-colors">Planos</button></li>
                    <li><button onClick={() => onNavigate('about')} className="hover:text-primary transition-colors">Sobre Nós</button></li>
                 </ul>
            </div>
             <div>
                 <h4 className="font-semibold text-copy-text">Legal</h4>
                 <ul className="mt-4 space-y-2 text-copy-text-secondary">
                    <li><a href="#" className="hover:text-primary transition-colors">Termos de Serviço</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
                 </ul>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t border-custom-border text-center text-copy-text-secondary">
             <p>&copy; {new Date().getFullYear()} MedContent AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;