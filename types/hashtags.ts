export interface HashtagSuggestion {
  tag: string;
  relevance: number;
  trending: boolean;
  category: 'specialty' | 'general' | 'trending' | 'location';
}
