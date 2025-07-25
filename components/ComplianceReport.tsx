import React from 'react';
import { ComplianceResult, ComplianceCheck } from '../types';

const ComplianceReport: React.FC<{ result: ComplianceResult }> = ({ result }) => {
    const scoreColor = result.score > 85 ? 'text-green-500' : result.score > 60 ? 'text-yellow-500' : 'text-red-500';
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (result.score / 100) * circumference;

    const CheckIcon: React.FC<{ severity: ComplianceCheck['severity'] }> = ({ severity }) => {
        const baseClasses = "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-white";
        const icons = {
            error: {
                bg: 'bg-red-500',
                svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            },
            warning: {
                bg: 'bg-yellow-500',
                svg: <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            },
             info: {
                bg: 'bg-blue-500',
                svg: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            }
        };
        const icon = icons[severity];
        return (
            <div className={`${baseClasses} ${icon.bg}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    {icon.svg}
                </svg>
            </div>
        );
    };

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border-2 border-primary/20 shadow-sm">
            <h2 className="text-2xl font-bold text-copy-text">Análise de Conformidade Ética</h2>
            <p className="text-copy-text-secondary mt-1">Analisamos o conteúdo para garantir conformidade com as diretrizes do CFM/CRO.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-primary/5 p-6 rounded-lg">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative h-32 w-32">
                        <svg className="transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" strokeWidth="10" className="stroke-custom-border" fill="transparent"/>
                            <circle cx="50" cy="50" r="45" strokeWidth="10" className={`stroke-current ${scoreColor}`} fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            />
                        </svg>
                        <div className={`absolute inset-0 flex items-center justify-center text-3xl font-extrabold ${scoreColor}`}>
                            {result.score}
                        </div>
                    </div>
                    <p className="mt-2 font-bold text-lg text-copy-text">Pontuação</p>
                </div>
                <div className="md:col-span-2">
                    <h3 className={`font-bold text-xl ${scoreColor}`}>
                        {result.isCompliant ? '✅ Tudo Certo!' : '⚠️ Atenção Necessária!'}
                    </h3>
                    <p className="text-copy-text-secondary mt-2">
                        {result.isCompliant
                            ? 'O conteúdo parece estar em conformidade com as principais diretrizes. Lembre-se de sempre fazer uma revisão final.'
                            : 'Identificamos pontos críticos que podem violar as normas de publicidade médica. Revise os itens abaixo antes de publicar.'}
                    </p>
                </div>
            </div>

            {result.checks.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-copy-text">Pontos de Verificação</h3>
                    <div className="mt-4 space-y-4">
                        {result.checks.map(check => (
                            <div key={check.id} className="flex items-start gap-4 p-4 rounded-md border border-custom-border bg-slate-50">
                                <CheckIcon severity={check.severity} />
                                <div className="flex-1">
                                    <p className="font-semibold text-copy-text">{check.message}</p>
                                    {check.suggestion && <p className="text-sm text-green-700 mt-1"><b>Sugestão:</b> {check.suggestion}</p>}
                                    {check.articleReference && <p className="text-xs text-copy-text-secondary mt-2">Referência: {check.articleReference}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {result.disclaimersNeeded.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-copy-text">Avisos Legais Recomendados</h3>
                     <div className="mt-4 space-y-2 text-sm text-copy-text-secondary p-4 rounded-md border border-custom-border bg-slate-50">
                        <p>Considere adicionar os seguintes avisos ao final do seu post para maior transparência:</p>
                        <ul className="list-disc list-inside pl-2 pt-2">
                          {result.disclaimersNeeded.map((disclaimer, i) => <li key={i}>{disclaimer}</li>)}
                        </ul>
                     </div>
                </div>
            )}
        </div>
    );
};

export default ComplianceReport;