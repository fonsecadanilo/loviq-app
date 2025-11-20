import { describe, it, expect } from 'vitest';

interface ValidationCriteria {
  quantity: boolean;
  profile: boolean;
  segment: boolean;
}

interface CampaignData {
  quantity: number;
  profile: string;
  segment: string;
}

interface ValidationResult {
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

describe('validateCampaignInput', () => {
  describe('Quantity Validation', () => {
    it('should validate "3 lives"', () => {
      const result = validateCampaignInput('Quero 3 lives com creators');
      expect(result.validation.quantity).toBe(true);
      expect(result.data.quantity).toBe(3);
    });

    it('should validate "5 live streams"', () => {
      const result = validateCampaignInput('Preciso de 5 live streams');
      expect(result.validation.quantity).toBe(true);
      expect(result.data.quantity).toBe(5);
    });

    it('should validate "10 transmissões"', () => {
      const result = validateCampaignInput('10 transmissões para meu produto');
      expect(result.validation.quantity).toBe(true);
      expect(result.data.quantity).toBe(10);
    });

    it('should not validate without quantity', () => {
      const result = validateCampaignInput('Quero lives com creators');
      expect(result.validation.quantity).toBe(false);
      expect(result.data.quantity).toBe(0);
    });

    it('should validate single digit quantities', () => {
      const result = validateCampaignInput('1 live para testar');
      expect(result.validation.quantity).toBe(true);
      expect(result.data.quantity).toBe(1);
    });
  });

  describe('Profile Validation', () => {
    it('should validate "micro"', () => {
      const result = validateCampaignInput('Quero creators micro');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('micro');
    });

    it('should validate "mid"', () => {
      const result = validateCampaignInput('Preciso de creators mid');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('mid');
    });

    it('should validate "top"', () => {
      const result = validateCampaignInput('Quero creators top');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('top');
    });

    it('should validate "micro-influencer"', () => {
      const result = validateCampaignInput('micro-influencer para campanha');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('micro-influencer');
    });

    it('should validate "mid-tier"', () => {
      const result = validateCampaignInput('mid-tier creators');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('mid-tier');
    });

    it('should validate "top-tier"', () => {
      const result = validateCampaignInput('top-tier influencers');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('top-tier');
    });

    it('should be case insensitive', () => {
      const result = validateCampaignInput('MICRO creators');
      expect(result.validation.profile).toBe(true);
      expect(result.data.profile).toBe('micro');
    });

    it('should not validate without profile', () => {
      const result = validateCampaignInput('Quero creators para campanha');
      expect(result.validation.profile).toBe(false);
      expect(result.data.profile).toBe('');
    });
  });

  describe('Segment Validation', () => {
    const validSegments = ['fitness', 'lifestyle', 'beauty', 'fashion', 'tech', 'food', 'travel', 'health'];

    validSegments.forEach(segment => {
      it(`should validate "${segment}"`, () => {
        const result = validateCampaignInput(`Quero creators de ${segment}`);
        expect(result.validation.segment).toBe(true);
        expect(result.data.segment).toBe(segment);
      });
    });

    it('should be case insensitive', () => {
      const result = validateCampaignInput('FITNESS creators');
      expect(result.validation.segment).toBe(true);
      expect(result.data.segment).toBe('fitness');
    });

    it('should not validate invalid segment', () => {
      const result = validateCampaignInput('Quero creators de esportes');
      expect(result.validation.segment).toBe(false);
      expect(result.data.segment).toBe('');
    });

    it('should validate first segment when multiple are present', () => {
      const result = validateCampaignInput('Quero creators fitness e lifestyle');
      expect(result.validation.segment).toBe(true);
      expect(result.data.segment).toBe('fitness'); // First match wins
    });
  });

  describe('Complete Validation', () => {
    it('should validate complete input with all criteria', () => {
      const result = validateCampaignInput('Quero 5 lives com creators micro de fitness');
      expect(result.validation).toEqual({
        quantity: true,
        profile: true,
        segment: true
      });
      expect(result.data).toEqual({
        quantity: 5,
        profile: 'micro',
        segment: 'fitness'
      });
    });

    it('should validate complex input', () => {
      const result = validateCampaignInput('Preciso de 3 transmissões com influencers top-tier do segmento beauty');
      expect(result.validation).toEqual({
        quantity: true,
        profile: true,
        segment: true
      });
      expect(result.data).toEqual({
        quantity: 3,
        profile: 'top-tier',
        segment: 'beauty'
      });
    });

    it('should handle empty input', () => {
      const result = validateCampaignInput('');
      expect(result.validation).toEqual({
        quantity: false,
        profile: false,
        segment: false
      });
      expect(result.data).toEqual({
        quantity: 0,
        profile: '',
        segment: ''
      });
    });

    it('should handle partial validation', () => {
      const result = validateCampaignInput('Quero 2 lives');
      expect(result.validation).toEqual({
        quantity: true,
        profile: false,
        segment: false
      });
      expect(result.data).toEqual({
        quantity: 2,
        profile: '',
        segment: ''
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters and punctuation', () => {
      const result = validateCampaignInput('!!! Quero 7 lives, com creators micro de fitness !!!');
      expect(result.validation).toEqual({
        quantity: true,
        profile: true,
        segment: true
      });
    });

    it('should handle numbers with decimals (should not match)', () => {
      const result = validateCampaignInput('Quero 3.5 lives');
      expect(result.validation.quantity).toBe(false);
      expect(result.data.quantity).toBe(0);
    });

    it('should handle multiple numbers (should match the one before lives)', () => {
      const result = validateCampaignInput('Quero 3 ou 5 lives');
      expect(result.validation.quantity).toBe(true);
      expect(result.data.quantity).toBe(5); // The number that appears before "lives"
    });

    it('should handle very long input', () => {
      const longInput = 'Quero ' + 'muito '.repeat(50) + '5 lives com creators micro de fitness';
      const result = validateCampaignInput(longInput);
      expect(result.validation).toEqual({
        quantity: true,
        profile: true,
        segment: true
      });
    });

    it('should handle unicode characters', () => {
      const result = validateCampaignInput('Quero 3 lives 👍 com creators micro de fitness 🏋️');
      expect(result.validation).toEqual({
        quantity: true,
        profile: true,
        segment: true
      });
    });
  });
});