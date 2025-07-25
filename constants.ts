import { Profession, Platform, Tone, AccountSettings, PlanTier, AIModel, UserTier } from './types';

export const PROFESSION_OPTIONS: Profession[] = [
  Profession.Medico,
  Profession.Dentista,
];

export const PLATFORM_OPTIONS: Platform[] = [
  Platform.Instagram,
  Platform.Facebook,
  Platform.LinkedIn,
  Platform.TikTok,
];

export const AI_MODELS: AIModel[] = [
    { id: 'gemini', name: 'Gemini', provider: 'Google AI', tier: 'Iniciante' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', tier: 'Pro' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'Pro' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', tier: 'Ultra' },
    { id: 'grok', name: 'Grok', provider: 'xAI', tier: 'Ultra' },
];


export const MEDICAL_AREAS = [
  'Alergologia e Imunologia',
  'Anestesiologia',
  'Angiologia',
  'Cardiologia',
  'Cirurgia Cardiovascular',
  'Cirurgia da Mão',
  'Cirurgia de Cabeça e Pescoço',
  'Cirurgia do Aparelho Digestivo',
  'Cirurgia Geral',
  'Cirurgia Oncológica',
  'Cirurgia Pediátrica',
  'Cirurgia Plástica',
  'Cirurgia Torácica',
  'Cirurgia Vascular',
  'Clínica Médica',
  'Coloproctologia',
  'Dermatologia',
  'Endocrinologia e Metabologia',
  'Endoscopia',
  'Gastroenterologia',
  'Genética Médica',
  'Geriatria',
  'Ginecologia e Obstetrícia',
  'Hematologia e Hemoterapia',
  'Homeopatia',
  'Infectologia',
  'Mastologia',
  'Medicina de Emergência',
  'Medicina de Família e Comunidade',
  'Medicina do Trabalho',
  'Medicina do Tráfego',
  'Medicina Esportiva',
  'Medicina Intensiva',
  'Medicina Legal e Perícia Médica',
  'Medicina Nuclear',
  'Medicina Preventiva e Social',
  'Nefrologia',
  'Neurocirurgia',
  'Neurologia',
  'Nutrologia',
  'Oftalmologia',
  'Oncologia Clínica',
  'Ortopedia e Traumatologia',
  'Otorrinolaringologia',
  'Patologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Radiologia e Diagnóstico por Imagem',
  'Radioterapia',
  'Reumatologia',
  'Urologia',
];


export const DENTAL_AREAS = [
  'Clínica Geral',
  'Dentística Restauradora',
  'Endodontia',
  'Estomatologia',
  'Harmonização Orofacial',
  'Implantodontia',
  'Odontogeriatria',
  'Odontologia do Esporte',
  'Odontologia do Trabalho',
  'Odontologia Legal',
  'Odontologia para Pacientes com Necessidades Especiais',
  'Odontopediatria',
  'Ortodontia',
  'Ortopedia Funcional dos Maxilares',
  'Patologia Oral e Maxilofacial',
  'Periodontia',
  'Prótese Bucomaxilofacial',
  'Prótese Dentária',
  'Radiologia Odontológica e Imaginologia',
  'Saúde Coletiva',
];


export const MEDICAL_SERVICES = [
  'Consulta de Rotina',
  'Eletrocardiograma',
  'Tratamento de Acne',
  'Controle de Diabetes',
  'Pré-natal',
  'Exame de Vista',
  'Tratamento de Fraturas',
  'Vacinação Infantil',
  'Terapia',
  'Cirurgia Robótica',
];

export const DENTAL_SERVICES = [
  'Limpeza e Profilaxia',
  'Clareamento Dental',
  'Tratamento de Canal',
  'Implantes Dentários',
  'Aparelho Ortodôntico',
  'Tratamento de Gengivite',
  'Coroas e Pontes',
  'Aplicação de Botox',
  'Facetas de Porcelana',
];

export const DEFAULT_TONES: Tone[] = [
    {
        id: 'default-1',
        name: 'Profissional e Educativo',
        prompt: 'Escreva de forma clara, informativa e baseada em evidências. Use uma linguagem precisa, mas evite jargões excessivos. O objetivo é educar o público de forma confiável e profissional.',
        isDefault: true,
    },
    {
        id: 'default-2',
        name: 'Empático e Acolhedor',
        prompt: 'Use uma linguagem calorosa, tranquilizadora e de apoio. Fale diretamente com as preocupações e sentimentos do paciente. O objetivo é construir confiança e fazer o público se sentir compreendido e seguro.',
        isDefault: true,
    },
    {
        id: 'default-3',
        name: 'Direto e Inspirador',
        prompt: 'Seja direto, motivacional e focado na ação. Use frases curtas e fortes. O objetivo é inspirar o público a tomar medidas positivas em relação à sua saúde e bem-estar.',
        isDefault: true,
    }
];

export const GUEST_SETTINGS: AccountSettings = {
    toneId: DEFAULT_TONES[0].id,
    customTones: [],
    socialHandles: {},
    brandColors: {
      primary: '#3b82f6',
      secondary: '#f9fafb'
    },
    brandLogo: null,
    brandVoice: 'Profissional, mas acessível. Foco em educar e construir confiança com os pacientes.'
};

export const PLAN_TIERS: PlanTier[] = [
  {
    name: 'Iniciante',
    price: { monthly: 0, annual: 0 },
    description: 'Para experimentar a plataforma e ver o poder da IA.',
    features: [
      '5 Gerações de Conteúdo/mês',
      'Pesquisa de Tendências com IA',
      'Acesso ao Modelo Padrão (Gemini)',
      'Suporte via Comunidade',
    ],
    cta: 'Começar Agora',
  },
  {
    name: 'Pro',
    price: { monthly: 247, annual: 2470 },
    description: 'Para profissionais que buscam crescimento e consistência.',
    features: [
      '100 Gerações de Conteúdo/mês',
      'Pesquisa de Tendências com IA',
      'Personalização de Voz e Marca',
      'Geração de Arte com IA (DALL-E)',
      'Acesso a Modelos Avançados (GPT-4, Claude 3)',
      'Suporte via E-mail',
    ],
    cta: 'Assinar o Pro',
    isPopular: true,
  },
  {
    name: 'Ultra',
    price: { monthly: 497, annual: 4970 },
    description: 'Para quem quer o máximo de impacto com conteúdo visual e suporte premium.',
    features: [
      '300 Gerações de Conteúdo/mês',
      'Tudo do plano Pro',
      'Acesso a todos os Modelos (Grok, Claude 4)',
      'Geração de Vídeo com IA (Em breve)',
      'Analytics de Performance Avançado',
      'Suporte Prioritário via WhatsApp',
    ],
    cta: 'Assinar o Ultra',
  },
   {
    name: 'Agência',
    price: { monthly: 0, annual: 0 }, // Custom price
    description: 'Para agências gerenciando múltiplos clientes e marcas.',
    features: [
      'Gerações de Conteúdo Ilimitadas',
      'Tudo do plano Ultra',
      'Múltiplas Marcas/Perfis',
      'Gerente de Conta Dedicado',
      'API de Integração (Sob Demanda)',
    ],
    cta: 'Fale Conosco',
  },
];