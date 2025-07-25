import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import * as analyticsService from '../services/analyticsService';
import { AnalyticsData, GenerationRecord } from '../types/analytics';
import { User } from '../types';
import LoadingSpinner from './LoadingSpinner';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-surface p-6 rounded-xl border border-custom-border shadow-sm flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-copy-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-copy-text">{value}</p>
        </div>
    </div>
);

const ChartCard: React.FC<{ title: string, children: React.ReactElement }> = ({ title, children }) => (
    <div className="bg-surface p-6 rounded-xl border border-custom-border shadow-sm">
        <h3 className="text-lg font-semibold text-copy-text mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
    </div>
);

interface AnalyticsPageProps {
    user: User;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const analyticsData = await analyticsService.getAnalyticsData(user.id);
                setData(analyticsData);
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    if (isLoading) {
        return (
             <div className="text-center p-8 bg-surface rounded-lg shadow-sm">
                <LoadingSpinner />
                <p className="mt-4 text-lg font-semibold text-copy-text">Carregando dados...</p>
            </div>
        )
    }

    if (!data || data.summary.totalGenerations === 0) {
        return (
            <div className="text-center bg-surface p-8 rounded-xl border border-custom-border shadow-sm">
              <h2 className="text-2xl font-bold text-copy-text">Painel de Analytics</h2>
              <p className="mt-4 text-copy-text-secondary">Nenhum dado de geração encontrado. Comece a criar conteúdo para ver suas estatísticas aqui!</p>
            </div>
        )
    }

    const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-copy-text">Painel de Analytics</h2>
                <p className="text-copy-text-secondary mt-1">Acompanhe seu progresso e o desempenho do conteúdo gerado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Conteúdos Gerados" value={data.summary.totalGenerations} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <StatCard title="Score Médio de Conformidade" value={`${data.summary.averageCompliance}%`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-4.044 11.955 11.955 0 019 4.044 12.02 12.02 0 00-2.382-9.016z" /></svg>} />
                <StatCard title="Plataforma Mais Usada" value={data.summary.mostUsedPlatform} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ChartCard title="Pontuação de Conformidade ao Longo do Tempo">
                         <LineChart data={data.complianceOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="date" stroke="#475569" fontSize={12} />
                            <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Line type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ChartCard>
                </div>
                <div className="lg:col-span-2">
                    <ChartCard title="Distribuição por Plataforma">
                        <PieChart>
                            <Pie data={data.platformDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {data.platformDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        </PieChart>
                    </ChartCard>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-custom-border shadow-sm">
                 <h3 className="text-lg font-semibold text-copy-text mb-4">Histórico de Atividade Recente</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-custom-border">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-copy-text-secondary uppercase tracking-wider">Data</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-copy-text-secondary uppercase tracking-wider">Conteúdo</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-copy-text-secondary uppercase tracking-wider">Plataforma</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-copy-text-secondary uppercase tracking-wider">Modelo</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-copy-text-secondary uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-custom-border">
                        {data.history.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-copy-text-secondary">{new Date(record.createdAt).toLocaleString('pt-BR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-copy-text max-w-xs truncate">{record.postSnippet}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-copy-text-secondary">{record.platform}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-copy-text-secondary">{record.modelUsed}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${record.complianceScore > 85 ? 'text-green-600' : record.complianceScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>{record.complianceScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;