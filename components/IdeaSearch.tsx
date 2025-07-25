import React, { useState } from 'react';
import { User, IdeaInsights } from '../types';
import * as contentService from '../services/contentService';
import LoadingSpinner from './LoadingSpinner';

interface IdeaSearchProps {
  user: User | null;
  onLoginRequest: () => void;
}

const IdeaSearch: React.FC<IdeaSearchProps> = ({ user, onLoginRequest }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<IdeaInsights | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !user) return;
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const insights = await contentService.generateIdeaInsights(topic);
      setResults(insights);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao buscar ideias.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderGuestView = () => (
    <div className="text-center bg-surface p-8 rounded-xl border border-custom-border shadow-sm">
      <h3 className="text-xl font-bold text-copy-text">Recurso Exclusivo para Membros</h3>
      <p className="text-copy-text-secondary mt-2 max-w-md mx-auto">
        A Busca de Ideias com IA é uma ferramenta poderosa para encontrar pautas relevantes. Faça login para começar a usar.
      </p>
      <button 
        onClick={onLoginRequest}
        className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-colors"
      >
        Fazer Login ou Criar Conta
      </button>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-copy-text">💡 Ideias de Posts</h3>
          {results.postIdeas.map((idea, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg border border-custom-border">
              <p className="font-semibold text-copy-text">{idea.title}</p>
              <p className="text-sm text-copy-text-secondary mt-1">{idea.description}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-copy-text">❓ Perguntas do Público</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-copy-text-secondary bg-slate-50 p-4 rounded-lg border border-custom-border">
                {results.commonQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-copy-text">💥 Mitos para Desmistificar</h3>
               <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-copy-text-secondary bg-slate-50 p-4 rounded-lg border border-custom-border">
                {results.mythsToDebunk.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
        </div>
      </div>
    );
  }

  const renderUserView = () => (
    <>
      <div className="bg-surface p-8 rounded-xl border border-custom-border shadow-sm">
        <h2 className="text-3xl font-bold text-copy-text">Busca de Ideias com IA</h2>
        <p className="text-copy-text-secondary mt-2 max-w-2xl">
          Sem inspiração? Insira um tópico ou serviço e deixe nossa IA descobrir tendências, dúvidas e pautas de alto impacto para seu próximo conteúdo.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Clareamento dental, terapia hormonal, ansiedade..."
            className="flex-grow w-full px-4 py-3 bg-white border border-custom-border rounded-lg shadow-sm focus:ring-primary focus:border-primary"
            required
          />
          <button
            type="submit"
            disabled={isLoading || !topic}
            className="flex items-center justify-center bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-colors disabled:bg-primary/40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Buscar Ideias'}
          </button>
        </form>
      </div>

      {isLoading && <div className="mt-8"><LoadingSpinner /></div>}
      
      {error && (
        <div className="mt-8 bg-red-100 border border-red-400 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}

      {results && renderResults()}
    </>
  );

  return user ? renderUserView() : renderGuestView();
};

export default IdeaSearch;