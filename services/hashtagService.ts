import { HashtagSuggestion } from '../types/hashtags';
import * as apiGateway from './apiGateway';

const MEDICAL_HASHTAGS: {
  general: string[];
  specialties: { [key: string]: string[] };
} = {
  general: ['saude', 'medicina', 'bemestar', 'dicasdesaude', 'saudemental', 'prevencao', 'qualidadedevida', 'medico'],
  specialties: {
    cardiologia: ['cardiologia', 'coracao', 'cardio', 'pressaoalta', 'hipertensao', 'vidasaudavel', 'ecg'],
    dermatologia: ['dermatologia', 'pele', 'skincare', 'dermatologista', 'esteticafacial', 'cuidadoscomapele', 'procedimentosesteticos', 'botox', 'preenchimento'],
    pediatria: ['pediatria', 'criancas', 'pediatra', 'saudeinfantil', 'maternidade', 'paisefilhos', 'desenvolvimentoinfantil'],
    ortopediaetraumatologia: ['ortopedia', 'traumatologia', 'joelho', 'coluna', 'fratura', 'lesaoesportiva'],
    ginecologiaeobstetricia: ['ginecologia', 'obstetricia', 'saudedamulher', 'prenatal', 'parto', 'ginecologista'],
    odontologia: ['odontologia', 'dentista', 'sorriso', 'saudebucal', 'clareamentodental', 'implantesdentarios', 'ortodontia'],
  },
};

// Generate location-based hashtags
function generateLocationHashtags(location: string): string[] {
    if (!location) return [];
    const parts = location.split(',').map(part => part.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''));
    return parts.filter(Boolean);
}

function normalizeSpecialty(specialty: string): string {
    return specialty.toLowerCase().replace(/ e /g, 'e').replace(/ /g, '').replace(/[^a-z]/g, '');
}

export async function suggestHashtags(
  content: string,
  specialty: string,
  location: string
): Promise<HashtagSuggestion[]> {
  const suggestions: HashtagSuggestion[] = [];
  const addedTags = new Set<string>();

  const addSuggestion = (suggestion: HashtagSuggestion) => {
    if (!addedTags.has(suggestion.tag)) {
        suggestions.push(suggestion);
        addedTags.add(suggestion.tag);
    }
  };

  // Buscar trending topics via API Gateway
  const trendingTags = await apiGateway.fetchTrendingHashtags();
  trendingTags.forEach(tag => {
    addSuggestion({
      tag,
      relevance: 0.95,
      trending: true,
      category: 'trending'
    });
  });

  // Hashtags da especialidade
  const normalizedSpecialty = normalizeSpecialty(specialty);
  if (MEDICAL_HASHTAGS.specialties[normalizedSpecialty]) {
    MEDICAL_HASHTAGS.specialties[normalizedSpecialty].forEach(tag => {
      addSuggestion({
        tag,
        relevance: 0.9,
        trending: false,
        category: 'specialty'
      });
    });
  }

  // Hashtags de localização
  const locationTags = generateLocationHashtags(location);
  locationTags.forEach(tag => {
    addSuggestion({
      tag,
      relevance: 0.8,
      trending: false,
      category: 'location'
    });
  });
  
  // Hashtags gerais de saúde
  MEDICAL_HASHTAGS.general.forEach(tag => {
    addSuggestion({
      tag,
      relevance: 0.7,
      trending: false,
      category: 'general'
    });
  });
  
  // Ordenar por relevância e depois por categoria
  return suggestions.sort((a, b) => {
    if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
    }
    const order = ['trending', 'specialty', 'location', 'general'];
    return order.indexOf(a.category) - order.indexOf(b.category);
  }).slice(0, 30);
}
