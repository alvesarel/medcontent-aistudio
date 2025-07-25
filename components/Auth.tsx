import React, { useState } from 'react';
import { User } from '../types';
import * as userService from '../services/userService';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onClose }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setError(null);
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let user: User;
            if (mode === 'login') {
                user = await userService.loginUser(email, password);
            } else {
                user = await userService.createUser(name, email, password);
            }
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const isLogin = mode === 'login';
    const inputClasses = "w-full px-3 py-2 bg-slate-50 border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400";

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
            aria-labelledby="auth-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="fixed inset-0" 
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <div className="relative w-full max-w-md bg-surface p-8 rounded-xl shadow-lg m-4">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 id="auth-modal-title" className="text-2xl font-bold text-center text-copy-text mb-2">
                    {isLogin ? 'Bem-vindo(a) de Volta!' : 'Crie sua Conta'}
                </h2>
                <p className="text-center text-copy-text-secondary mb-8">
                    {isLogin ? 'Acesse para ter acesso a todos os recursos' : 'Preencha os dados para começar'}
                </p>

                {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6 text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-copy-text-secondary mb-1">Nome Completo</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-copy-text-secondary mb-1">E-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-copy-text-secondary mb-1">Senha</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClasses}/>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-all duration-300 disabled:bg-primary/40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processando...
                                </>
                            ) : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-copy-text-secondary">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button onClick={toggleMode} className="font-semibold text-primary hover:underline ml-1">
                            {isLogin ? 'Crie uma agora' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;