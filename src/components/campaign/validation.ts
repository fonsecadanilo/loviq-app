export interface ValidationCriteria {
  quantity: boolean;
  profile: boolean;
  segment: boolean;
}

export interface CampaignData {
  quantity: number;
  profile: string;
  segment: string;
}

export interface ValidationResult {
  validation: ValidationCriteria;
  data: CampaignData;
}

export function validateCampaignInput(input: string): ValidationResult {
  const validation: ValidationCriteria = {
    quantity: false,
    profile: false,
    segment: false
  };
  
  const data: CampaignData = {
    quantity: 0,
    profile: '',
    segment: ''
  };

  // Validação de quantidade (ex: "3 lives", "5 live streams") - apenas números inteiros
  // Pegar apenas números inteiros que aparecem antes de "live/lives/transmissão"
  const quantityMatch = input.match(/(\d+)\s*(?:live|lives|transmissão|transmissões)/i);
  if (quantityMatch) {
    const numberText = quantityMatch[1];
    const number = parseInt(numberText);
    
    // Verificar se não é parte de um número decimal olhando o contexto
    const matchStartIndex = quantityMatch.index!;
    const charBeforeMatch = matchStartIndex > 0 ? input[matchStartIndex - 1] : '';
    
    // Se o caractere antes for um ponto, é um decimal - ignorar
    const isPartOfDecimal = charBeforeMatch === '.';
    
    if (number > 0 && Number.isInteger(number) && !isPartOfDecimal) {
      validation.quantity = true;
      data.quantity = number;
    }
  }

  // Validação de perfil (Micro/Mid/Top) - priorizar termos com hífen primeiro
  const profilePatterns = [
    /(micro-influencer)/i,
    /(mid-tier)/i,
    /(top-tier)/i,
    /(micro)/i,
    /(mid)/i,
    /(top)/i
  ];
  
  for (const pattern of profilePatterns) {
    const profileMatch = input.match(pattern);
    if (profileMatch) {
      validation.profile = true;
      data.profile = profileMatch[1].toLowerCase();
      break;
    }
  }

  // Validação de segmento - pegar o primeiro que aparece
  const segments = ['fitness', 'lifestyle', 'beauty', 'fashion', 'tech', 'food', 'travel', 'health'];
  const inputLower = input.toLowerCase();
  
  for (const segment of segments) {
    if (inputLower.includes(segment)) {
      validation.segment = true;
      data.segment = segment;
      break; // Pegar o primeiro segmento encontrado
    }
  }

  return { validation, data };
}