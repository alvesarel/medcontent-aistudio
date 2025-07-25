import { Platform, AiModelId } from '../types';

export interface GenerationRecord {
  id: string; // timestamp string
  createdAt: string; // ISO string for display
  userId: string;
  platform: Platform;
  modelUsed: AiModelId;
  complianceScore: number;
  postSnippet: string;
}

export interface NewRecordData {
    userId: string;
    platform: Platform;
    modelUsed: AiModelId;
    complianceScore: number;
    postSnippet: string;
}

export interface AnalyticsData {
    summary: {
        totalGenerations: number;
        averageCompliance: number;
        mostUsedPlatform: Platform | string;
    };
    complianceOverTime: { date: string, score: number }[];
    platformDistribution: { name: string, value: number }[];
    history: GenerationRecord[];
}