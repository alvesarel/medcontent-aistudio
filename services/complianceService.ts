import { Platform } from '../types';

export interface ComplianceCheck {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  articleReference?: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  checks: ComplianceCheck[];
  score: number; // 0-100
  disclaimersNeeded: string[];
}

const PROHIBITED_TERMS: { [key: string]: string[] } = {
  guarantees: ['garantia', 'garantido', 'garanto', 'certeza', '100%', 'milagre', 'cura garantida', 'resultado certo'],
  sensationalism: ['revolucionário', 'único no brasil', 'segredo', 'exclusivo', 'fórmula mágica'],
  beforeAfter: ['antes e depois', 'antes/depois', 'antes x depois'],
  prices: ['r$', 'reais', 'desconto', 'promoção', 'gratuito', 'grátis', 'preço', 'valor', 'custo', 'barato'],
  superlatives: ['o melhor', 'a melhor', 'o maior', 'o único', 'superior a', 'incomparável'],
  selfPromotion: ['dr. fulano, o melhor', 'a clínica mais moderna', 'equipamentos de ponta']
};


const REQUIRED_DISCLAIMERS = {
  results: 'Os resultados podem variar de pessoa para pessoa.',
  consultation: 'Este post é informativo e não substitui uma consulta médica.',
  emergency: 'Em caso de emergência, procure o pronto-socorro mais próximo.'
};

function getSuggestion(category: string, term: string): string {
  switch (category) {
    case 'guarantees':
      return 'Evite prometer resultados. Foque nos benefícios do procedimento e em educar o paciente sobre expectativas realistas.';
    case 'sensationalism':
      return `Troque "${term}" por uma linguagem mais sóbria e informativa. Destaque suas qualificações e a qualidade do serviço sem exageros.`;
    case 'beforeAfter':
      return 'A exibição de "antes e depois" é vedada. Descreva os benefícios do tratamento de forma textual e educativa.';
    case 'prices':
      return 'A divulgação de preços e promoções é proibida. Informe que valores são fornecidos em consulta, conforme regulamentação.';
    case 'superlatives':
      return `Substitua superlativos como "${term}" por descrições objetivas da qualidade do seu serviço ou tecnologia.`;
    case 'selfPromotion':
        return 'Evite autopromoção exagerada. Foque em fornecer informações úteis e educativas para o paciente.'
    default:
      return 'Revise o uso deste termo para garantir conformidade com as normas de publicidade médica.';
  }
}

function getArticleReference(category: string): string {
    switch (category) {
        case 'guarantees': return 'CFM - Art. 112';
        case 'sensationalism': return 'CFM - Art. 114';
        case 'beforeAfter': return 'CFM - Res. 1.974/11, Art. 3º, § 1º';
        case 'prices': return 'CFM - Art. 115';
        case 'superlatives': return 'CFM - Art. 114';
        case 'selfPromotion': return 'CFM - Art. 113';
        default: return 'Codame';
    }
}

function detectRequiredDisclaimers(content: string): string[] {
    const needed: string[] = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('tratamento') || lowerContent.includes('procedimento') || lowerContent.includes('estético')) {
        needed.push(REQUIRED_DISCLAIMERS.results);
    }
    if (lowerContent.includes('sintomas') || lowerContent.includes('dor') || lowerContent.includes('doença')) {
        needed.push(REQUIRED_DISCLAIMERS.consultation);
    }
    if (lowerContent.includes('grave') || lowerContent.includes('súbito') || lowerContent.includes('urgência')) {
        needed.push(REQUIRED_DISCLAIMERS.emergency);
    }
    // Ensure consultation disclaimer is always present for medical content
    if(!needed.includes(REQUIRED_DISCLAIMERS.consultation)){
        needed.push(REQUIRED_DISCLAIMERS.consultation);
    }

    return [...new Set(needed)]; // Remove duplicates
}


function calculateComplianceScore(checks: ComplianceCheck[]): number {
    let score = 100;
    for (const check of checks) {
        if (check.severity === 'error') {
            score -= 25;
        } else if (check.severity === 'warning') {
            score -= 10;
        }
    }
    return Math.max(0, score); // Ensure score doesn't go below 0
}

export async function analyzeCompliance(content: string, platform: Platform): Promise<ComplianceResult> {
  const checks: ComplianceCheck[] = [];
  
  // Fake delay to simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300));

  Object.entries(PROHIBITED_TERMS).forEach(([category, terms]) => {
    terms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(content)) {
        checks.push({
          id: `${category}_${term}`,
          severity: (category === 'guarantees' || category === 'beforeAfter' || category === 'prices') ? 'error' : 'warning',
          message: `O termo "${term}" pode violar o código de ética médica.`,
          suggestion: getSuggestion(category, term),
          articleReference: getArticleReference(category)
        });
      }
    });
  });
  
  const disclaimersNeeded = detectRequiredDisclaimers(content);
  
  const score = calculateComplianceScore(checks);
  
  return {
    isCompliant: checks.filter(c => c.severity === 'error').length === 0,
    checks,
    score,
    disclaimersNeeded
  };
}