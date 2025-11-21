/**
 * Lógica de parse e validação do Step 1 da criação de campanha
 * 
 * Extrai do prompt do usuário:
 * 1. Quantidade de lives (critério 1)
 * 2. Seguidores do creator para cada live (critério 2)
 * 3. Segmentos de creator por live (critério 3)
 */

import type {
  Step1ParseResult,
  Step1LiveConfig,
  Step1Segment,
  SegmentKey,
  Step1Criteria,
  CriteriaStatus,
} from "./types";

/**
 * Mapeamento de números por extenso (português e inglês) para números
 */
const NUMBER_WORDS_PT: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quatorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20,
};

const NUMBER_WORDS_EN: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const NUMBER_WORDS_ES: Record<string, number> = {
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
};

/**
 * Converte número por extenso para número inteiro
 */
function wordToNumber(word: string): number | null {
  const lower = word.toLowerCase().trim();
  return NUMBER_WORDS_PT[lower] || NUMBER_WORDS_EN[lower] || NUMBER_WORDS_ES[lower] || null;
}

/**
 * CRITÉRIO 1: Extrai a quantidade total de lives da campanha
 * 
 * REGRA IMPORTANTE: Só considera um número como totalLives se ele estiver diretamente
 * associado a palavras-chave que indiquem live/stream.
 * 
 * Palavras-chave aceitas (case-insensitive):
 * - "live stream", "live streams", "live", "stream", "streams"
 * - "live shop", "live shopping"
 * - "transmissão", "transmissões", "sessão ao vivo", "sessões ao vivo"
 */
function extractTotalLives(rawPrompt: string): number | null {
  const lowerPrompt = rawPrompt.toLowerCase();

  // Padrão regex que captura número seguido diretamente de palavras-chave de live/stream
  // Suporta números digitados e números por extenso
  const livePatterns = [
    // Número digitado + palavras-chave
    /(\d+)\s*(?:live\s*streams?|lives?|streams?|transmiss(?:ão|ões)|transmisi(?:ón|ones)|sess(?:ão|ões)\s*ao\s*vivo|live\s*shop(?:ping)?|envivo|en\s*vivo|creators?|influencers?|perfis?|profiles?|influenciad(?:or|ores)|cread(?:or|ores))/i,
    // Número por extenso + palavras-chave
    /\b(um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|one|two|three|four|five|six|seven|eight|nine|ten|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(?:live\s*streams?|lives?|streams?|transmiss(?:ão|ões)|transmisi(?:ón|ones)|sess(?:ão|ões)\s*ao\s*vivo|live\s*shop(?:ping)?|envivo|en\s*vivo|creators?|influencers?|perfis?|profiles?|influenciad(?:or|ores)|cread(?:or|ores))/i,
  ];

  const matches: Array<{ number: number; index: number }> = [];

  // Buscar matches usando os padrões restritivos
  for (const pattern of livePatterns) {
    let match;
    const regex = new RegExp(pattern.source, "gi");
    while ((match = regex.exec(rawPrompt)) !== null) {
      let number: number;

      // Se o match é um número por extenso
      const wordNumber = wordToNumber(match[1]);
      if (wordNumber !== null) {
        number = wordNumber;
      } else {
        // É um número digitado
        number = parseInt(match[1], 10);
      }

      if (number > 0 && Number.isInteger(number)) {
        matches.push({ number, index: match.index });
      }
    }
  }

  // Se não encontrou nenhum match com padrão restritivo, retorna null
  // NÃO aceita números soltos sem contexto de live/stream
  if (matches.length === 0) {
    return null;
  }

  // Se encontrou múltiplos matches, escolher o primeiro (mais próximo do início)
  // Todos já são válidos pois passaram pelo padrão restritivo
  return matches[0].number;
}

// Alias para manter compatibilidade
function parseTotalLives(prompt: string): number | null {
  return extractTotalLives(prompt);
}

/**
 * Normaliza um token numérico para número inteiro
 * 
 * Suporta formatos:
 * - "1M" ou "1.5M" => multiplica por 1_000_000
 * - "100k" ou "1.2k" => multiplica por 1_000
 * - "10 mil" => 10 * 1_000
 * - "100.000" / "100,000" => remove ponto/vírgula de milhar e parseInt
 */
function normalizeNumberToken(token: string): number | null {
  const cleaned = token.trim().toLowerCase();

  // Caso 1: Termina com M (milhões) ou "mi"
  // Nota: "mi" pode ser seguido de "de" (ex: "1.5 mi de seguidores"), então usamos regex mais flexível
  const mMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:m|mi|milhão|milhões|millions|million|millones)(?:\s+de)?$/);
  if (mMatch) {
    const num = parseFloat(mMatch[1]);
    if (!isNaN(num)) {
      return Math.round(num * 1_000_000);
    }
  }

  // Caso 2: Termina com k (milhares)
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*k$/);
  if (kMatch) {
    const num = parseFloat(kMatch[1]);
    if (!isNaN(num)) {
      return Math.round(num * 1_000);
    }
  }

  // Caso 3: Contém "mil" ou "thousand" (mas não milhão)
  if ((cleaned.includes("mil") || cleaned.includes("thousand")) && !cleaned.includes("milh")) {
    const numMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:mil|thousand)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1].replace(",", "."));
      if (!isNaN(num)) {
        return Math.round(num * 1_000);
      }
    }
  }

  // Caso 3.5: Contém "milhão" ou "milhões" ou "million" explicitamente no meio da string
  if (cleaned.includes("milh") || cleaned.includes("million") || cleaned.includes("millon")) {
    const numMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*(?:milh(?:ão|ões)|millions?|millones)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1].replace(",", "."));
      if (!isNaN(num)) {
        return Math.round(num * 1_000_000);
      }
    }
  }

  // Caso 4: Número com ponto/vírgula de milhar (ex: "100.000" ou "100,000")
  const thousandMatch = cleaned.match(/^(\d{1,3}(?:[.,]\d{3})+)$/);
  if (thousandMatch) {
    const num = parseFloat(thousandMatch[1].replace(/[,.]/g, ""));
    if (!isNaN(num)) {
      return Math.round(num);
    }
  }

  // Caso 5: Número simples
  const simpleMatch = cleaned.match(/^(\d+)$/);
  if (simpleMatch) {
    const num = parseInt(simpleMatch[1], 10);
    if (!isNaN(num)) {
      return num;
    }
  }

  return null;
}

/**
 * Converte string de seguidores para número (mantida para compatibilidade)
 * @deprecated Use normalizeNumberToken em vez disso
 */
function parseFollowersString(str: string): number | null {
  return normalizeNumberToken(str);
}

/**
 * CRITÉRIO 2: Extrai informações de seguidores para cada live
 * 
 * REGRA IMPORTANTE: Só considera números como followers se estiverem próximos
 * das palavras "followers", "follower", "seguidores" ou "seguidor".
 * 
 * Suporta formatos:
 * - "100k followers"
 * - "100k de seguidores"
 * - "with creators of 100k, 1M and 600k followers"
 * - "entre 10 mil e 50 mil seguidores"
 */
function parseFollowers(
  prompt: string,
  totalLives: number
): Array<{ followersMin: number | null; followersMax: number | null }> | null {
  const result: Array<{ followersMin: number | null; followersMax: number | null }> = [];

  // Tentar encontrar ranges globais que mencionem followers/seguidores explicitamente
  // PRIORIDADE ALTA: Ranges devem ser verificados antes de listas ou números únicos
  // para evitar que o final do range seja capturado como um número único
  const rangePatterns = [
    // "entre 10k e 50k followers" / "entre 10 mil e 50 mil seguidores"
    /(?:entre|between)\s+(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)\s+(?:e|and|y)\s+(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:followers?|seguidores?)/i,
    // "10k to 50k followers" / "10k a 50k seguidores"
    /(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)\s*(?:to|a)\s*(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:followers?|seguidores?)/i,
    // "até 20k followers" / "até 20 mil seguidores"
    /(?:até|up\s+to|until|hasta)\s+(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:followers?|seguidores?)/i,
    // "acima de 100k followers" / "acima de 100 mil seguidores"
    /(?:acima\s+de|above|over|more\s+than|más\s+de)\s+(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:followers?|seguidores?)/i,
  ];

  for (const pattern of rangePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      if (match[2]) {
        // Range com min e max
        const min = normalizeNumberToken(match[1]);
        const max = normalizeNumberToken(match[2]);
        if (min !== null && max !== null) {
          for (let i = 0; i < totalLives; i++) {
            result.push({ followersMin: min, followersMax: max });
          }
          return result;
        }
      } else {
        // Range com apenas um valor (até/acima de)
        const value = normalizeNumberToken(match[1]);
        if (value !== null) {
          if (pattern.source.includes("até|up\\s+to|until|hasta")) {
            for (let i = 0; i < totalLives; i++) {
              result.push({ followersMin: 0, followersMax: value });
            }
          } else {
            for (let i = 0; i < totalLives; i++) {
              result.push({ followersMin: value, followersMax: null });
            }
          }
          return result;
        }
      }
    }
  }

  // ESTRATÉGIA FINAL (Promovida): Buscar todas as ocorrências de números de seguidores no texto
  // Útil para: "uma live com 10k e outra com 50k" e também para listas "10k, 20k e 30k"
  // Regex busca números que tenham sufixos k/m/mil OU sejam seguidos de followers/seguidores
  // ESTRATÉGIA FINAL (Promovida): Buscar todas as ocorrências de números de seguidores no texto
  // Útil para: "uma live com 10k e outra com 50k" e também para listas "10k, 20k e 30k"
  // Regex busca números que tenham sufixos k/m/mil OU sejam seguidos de followers/seguidores
  const allFollowerNumbersPattern = /(\d+(?:[.,]\d+)?\s*(?:[kKmM]|mi|mil|million|millions|millones|milhão|milhões|thousand|thousands))\b|\b(\d+)\s*(?:followers|seguidores)/gi;

  const allMatches = [];
  let match;
  while ((match = allFollowerNumbersPattern.exec(prompt)) !== null) {
    // match[1] é o número com sufixo (ex: "10k")
    // match[2] é o número sem sufixo mas seguido de followers (ex: "10000")
    const token = match[1] || match[2];
    const num = normalizeNumberToken(token);

    // Filtrar números muito pequenos que provavelmente são contagem de lives (ex: "3" lives)
    // Assumimos que seguidores geralmente são > 100 ou têm k/m
    const hasSuffix = /[kKmM]|mil|thousand/.test(token);
    if (num !== null && (hasSuffix || num > 100)) {
      allMatches.push(num);
    }
  }

  // Se encontrou exatamente a quantidade de números igual ao total de lives
  if (allMatches.length === totalLives) {
    for (const num of allMatches) {
      result.push({ followersMin: num, followersMax: num });
    }
    return result;
  }

  // Se encontrou MAIS de um número, mas a quantidade não bate com o total de lives,
  // isso é um erro de validação (usuário tentou listar mas errou a conta)
  if (allMatches.length > 1 && allMatches.length !== totalLives) {
    // Retornar null para indicar erro explícito
    return null;
  }

  // Primeiro, tentar encontrar lista de números associados a followers/seguidores
  // Padrão: captura lista de números seguida de "followers" ou "seguidores"
  // Exemplo: "100k, 1M and 600k followers" ou "100k, 1M e 600k seguidores"
  // Estratégia: capturar sequência de números (com k/M/mil ou simples) separados por vírgula, "and" ou "e"
  // seguida de "followers"/"seguidores"
  const followersListPattern = /((?:\d+(?:\.\d+)?\s*(?:[kKmM]|mil)|\d+)(?:\s*(?:[,]|\s+(?:and|e)\s+)\s*(?:\d+(?:\.\d+)?\s*(?:[kKmM]|mil)|\d+))*)\s*(?:followers?|seguidores?)/i;

  const listMatch = prompt.match(followersListPattern);
  if (listMatch) {
    // Extrair a parte da lista (ex: "100k, 1M and 600k")
    let listStr = listMatch[1].trim();

    // Normalizar separadores: trocar " and " / " e " por vírgula
    // Usar regex global para substituir todas as ocorrências
    listStr = listStr.replace(/\s+(?:and|e)\s+/gi, ",");

    // Separar em tokens (por vírgula)
    const tokens = listStr.split(/\s*,\s*/).map(t => t.trim()).filter(t => t.length > 0);

    // Filtrar apenas tokens que parecem números (contêm dígitos)
    const numberTokens = tokens.filter(t => /\d/.test(t));

    // Normalizar cada token para número
    const numbers: number[] = [];
    for (const token of numberTokens) {
      const normalized = normalizeNumberToken(token);
      if (normalized !== null) {
        numbers.push(normalized);
      }
    }

    // Distribuir números para lives conforme regras
    if (numbers.length === totalLives) {
      // Um número para cada live, na ordem
      for (const num of numbers) {
        result.push({ followersMin: num, followersMax: num });
      }
      return result;
    } else if (numbers.length === 1) {
      // Se encontrou apenas um número, verificar se pode aplicar a todas as lives
      // REGRA: Se totalLives > 1, só aplica se tiver "cada" ou "each" explícito
      // Caso contrário, é considerado erro (mismatch)
      const hasEach = /\b(?:each|cada)\b/i.test(prompt);

      if (totalLives > 1 && !hasEach) {
        return null; // Erro: pediu X lives mas só deu 1 valor sem especificar "cada"
      }

      // Mesmo número para todas as lives
      for (let i = 0; i < totalLives; i++) {
        result.push({ followersMin: numbers[0], followersMax: numbers[0] });
      }
      return result;
    }
    // Se numbers.length não bate com totalLives e não for 1, considerar erro explícito
    if (numbers.length > 1) {
      return null;
    }
  }


  // Se não encontrou lista nem range nem match exato de quantidade, 
  // tentar encontrar número único próximo de followers/seguidores para aplicar a todos
  // Padrão: número seguido de "followers" ou "seguidores" (com "de" opcional)
  const singleFollowerPatterns = [
    /(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:de\s+)?(?:followers?|seguidores?)/i,
    /(?:with|com|de|of|con)\s+creators?\s+(?:of|de|com|with|con)?\s*(\d+(?:\.\d+)?\s*(?:[kKmM]|mi|mil|milhão|milhões)?|\d+\s*mil)[\s-]*(?:followers?|seguidores?)/i,
  ];

  for (const pattern of singleFollowerPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      const normalized = normalizeNumberToken(match[1]);
      if (normalized !== null) {
        // Verificar "cada" / "each"
        const hasEach = /\b(?:each|cada)\b/i.test(prompt);

        if (totalLives > 1 && !hasEach) {
          // Se encontrou match único mas são várias lives e não tem "cada",
          // pode ser que o usuário ainda vá digitar ou esqueceu.
          // Mas conforme regra estrita, se já detectamos lives > 1 e um valor, e não é lista,
          // devemos considerar erro se não tiver "cada".
          // PORÉM: singleFollowerPatterns é o último recurso.
          return null;
        }

        // Aplicar o mesmo número para todas as lives
        for (let i = 0; i < totalLives; i++) {
          result.push({ followersMin: normalized, followersMax: normalized });
        }
        return result;
      }
    }
  }

  // Se não encontrou nenhum padrão válido, retornar array vazio
  // Isso será tratado como critério 2 inválido na validação
  return [];
}

/**
 * Extrai range global de seguidores do prompt
 * 
 * @deprecated Esta função não é mais usada diretamente.
 * A lógica foi movida para parseFollowers que agora é mais restritiva.
 */
function parseGlobalFollowersRange(
  prompt: string
): { followersMin: number | null; followersMax: number | null } {
  // Esta função não é mais usada, mas mantida para compatibilidade
  // A lógica foi movida para parseFollowers
  return { followersMin: null, followersMax: null };
}

/**
 * CRITÉRIO 3: Extrai segmentos de creator por live
 * 
 * Mapeia termos do prompt para segmentos da taxonomia.
 * Pode ser global (aplicado a todas as lives) ou específico por live.
 */
function parseSegments(
  prompt: string,
  totalLives: number
): Step1Segment[][] {
  const lowerPrompt = prompt.toLowerCase();
  const result: Step1Segment[][] = [];

  // Mapeamento de termos para segmentos
  const segmentMapping: Array<{
    keywords: string[];
    key: SegmentKey;
    label: string;
  }> = [
      {
        keywords: [
          "makeup",
          "maquiagem",
          "beleza",
          "skincare",
          "beauty",
          "cosmetic",
          "cosméticos",
          "cuidados com a pele",
          "skincare routine",
          "cuidados",
          "care",
        ],
        key: "beauty_makeup",
        label: "Beauty & Makeup",
      },
      {
        keywords: [
          "moda",
          "fashion",
          "style",
          "look do dia",
          "outfit",
          "roupa",
          "clothing",
          "apparel",
          "estilo",
        ],
        key: "fashion_style",
        label: "Fashion & Style",
      },
      {
        keywords: [
          "fitness",
          "gym",
          "academia",
          "workout",
          "exercício",
          "exercise",
          "sports",
          "esportes",
          "treino",
          "training",
          "deporte",
          "entrenamiento",
        ],
        key: "fitness_sports",
        label: "Fitness & Sports",
      },
      {
        keywords: [
          "lifestyle",
          "dia a dia",
          "rotina",
          "routine",
          "daily",
          "vida",
          "life",
          "estilo de vida",
        ],
        key: "lifestyle",
        label: "Lifestyle",
      },
      {
        keywords: [
          "tech",
          "tecnologia",
          "gadgets",
          "eletrônicos",
          "electronics",
          "smartphone",
          "computador",
          "computer",
          "computadora",
          "ordenador",
        ],
        key: "tech_gadgets",
        label: "Tech & Gadgets",
      },
      {
        keywords: [
          "gaming",
          "games",
          "jogos",
          "esports",
          "e-sports",
          "streamer",
          "gamer",
          "juegos",
          "videojuegos",
        ],
        key: "gaming_esports",
        label: "Gaming & Esports",
      },
      {
        keywords: [
          "home",
          "casa",
          "decoração",
          "decoration",
          "decor",
          "interior",
          "interiores",
          "hogar",
        ],
        key: "home_decor",
        label: "Home & Decor",
      },
      {
        keywords: [
          "food",
          "comida",
          "cooking",
          "culinária",
          "receita",
          "recipe",
          "gastronomia",
          "gastronomy",
          "cocina",
          "receta",
        ],
        key: "food_cooking",
        label: "Food & Cooking",
      },
      {
        keywords: [
          "mother",
          "mãe",
          "baby",
          "bebê",
          "family",
          "família",
          "parenting",
          "maternidade",
          "paternidade",
          "madre",
          "bebe",
          "familia",
        ],
        key: "mother_baby_family",
        label: "Mother, Baby & Family",
      },
      {
        keywords: [
          "business",
          "negócios",
          "education",
          "educação",
          "curso",
          "course",
          "empreendedorismo",
          "entrepreneurship",
          "negocios",
          "educacion",
        ],
        key: "business_education",
        label: "Business & Education",
      },
      {
        keywords: [
          "health",
          "saúde",
          "wellness",
          "bem-estar",
          "mental health",
          "saúde mental",
          "meditation",
          "meditação",
          "salud",
          "bienestar",
        ],
        key: "health_wellness",
        label: "Health & Wellness",
      },
    ];

  // Buscar todos os segmentos mencionados no prompt
  const foundSegments: Step1Segment[] = [];
  for (const mapping of segmentMapping) {
    for (const keyword of mapping.keywords) {
      if (lowerPrompt.includes(keyword)) {
        // Evitar duplicatas
        if (!foundSegments.find((s) => s.key === mapping.key)) {
          foundSegments.push({ key: mapping.key, label: mapping.label });
        }
      }
    }
  }

  // Se não encontrou nenhum segmento conhecido, tentar extrair termos desconhecidos
  if (foundSegments.length === 0) {
    // Padrão para encontrar segmentos mencionados explicitamente
    const explicitSegmentPattern = /(?:segment|segmento|niche|nicho|category|categoria|área|area)\s*(?:de|of|:)?\s*([^,.\n]+)/i;
    const explicitMatch = prompt.match(explicitSegmentPattern);
    if (explicitMatch) {
      const segmentText = explicitMatch[1].trim();
      foundSegments.push({
        key: "other",
        label: segmentText,
      });
    }
  }

  // Tentar encontrar segmentos específicos por live
  // Padrão: "primeira live em Fitness", "segunda em Beauty", etc
  const liveSpecificPatterns = [
    /(?:primeira|first|1st|1ª)\s*(?:live|stream|transmissão).*?(?:em|in|with|com)\s*([^,.\n]+)/i,
    /(?:segunda|second|2nd|2ª)\s*(?:live|stream|transmissão).*?(?:em|in|with|com)\s*([^,.\n]+)/i,
    /(?:terceira|third|3rd|3ª)\s*(?:live|stream|transmissão).*?(?:em|in|with|com)\s*([^,.\n]+)/i,
    /(?:quarta|fourth|4th|4ª)\s*(?:live|stream|transmissão).*?(?:em|in|with|com)\s*([^,.\n]+)/i,
    /(?:quinta|fifth|5th|5ª)\s*(?:live|stream|transmissão).*?(?:em|in|with|com)\s*([^,.\n]+)/i,
  ];

  const liveSpecificSegments: Array<{ index: number; segments: Step1Segment[] }> = [];

  for (let i = 0; i < liveSpecificPatterns.length && i < totalLives; i++) {
    const match = prompt.match(liveSpecificPatterns[i]);
    if (match) {
      const segmentText = match[1].trim().toLowerCase();
      const segmentsForLive: Step1Segment[] = [];

      // Verificar se o texto corresponde a algum segmento conhecido
      for (const mapping of segmentMapping) {
        for (const keyword of mapping.keywords) {
          if (segmentText.includes(keyword)) {
            if (!segmentsForLive.find((s) => s.key === mapping.key)) {
              segmentsForLive.push({ key: mapping.key, label: mapping.label });
            }
          }
        }
      }

      // Se não encontrou correspondência, usar como "other"
      if (segmentsForLive.length === 0) {
        segmentsForLive.push({
          key: "other",
          label: segmentText,
        });
      }

      liveSpecificSegments.push({ index: i, segments: segmentsForLive });
    }
  }

  // Se encontrou segmentos específicos por live, usar eles
  if (liveSpecificSegments.length > 0) {
    for (let i = 0; i < totalLives; i++) {
      const specific = liveSpecificSegments.find((s) => s.index === i);
      if (specific && specific.segments.length > 0) {
        result.push(specific.segments);
      } else {
        // Se não encontrou específico para esta live, usar segmentos globais
        result.push(foundSegments.length > 0 ? [...foundSegments] : []);
      }
    }
    return result;
  }

  // Se não encontrou segmentos específicos, aplicar segmentos globais a todas as lives
  for (let i = 0; i < totalLives; i++) {
    result.push(foundSegments.length > 0 ? [...foundSegments] : []);
  }

  return result;
}

/**
 * Função principal que orquestra o parse do Step 1
 */
export function parseCampaignStep1Prompt(
  rawPrompt: string
): Step1ParseResult {
  // Critério 1: Quantidade de lives
  const totalLives = parseTotalLives(rawPrompt);
  const criterion1Valid: CriteriaStatus =
    totalLives !== null && totalLives >= 1 ? "valid" : "invalid";

  // Se não conseguiu determinar a quantidade de lives, retornar resultado inválido
  if (totalLives === null || totalLives < 1) {
    return {
      rawPrompt,
      totalLives: null,
      lives: [],
      criteria: {
        livesCount: "invalid",
        followers: "invalid",
        segments: "invalid",
      },
    };
  }

  // Critério 2: Seguidores por live
  const livesFollowers = totalLives ? parseFollowers(rawPrompt, totalLives) : [];

  // Se parseFollowers retornou null, significa erro explícito (mismatch de quantidade)
  const followersError = livesFollowers === null;
  const validFollowers = !followersError && livesFollowers.length > 0;

  // Critério 3: Segmentos por live
  const livesSegments = totalLives ? parseSegments(rawPrompt, totalLives) : [];
  const validSegments = livesSegments.length > 0 && livesSegments.every(l => l.length > 0);

  // Montar resultado
  const lives: Step1LiveConfig[] = [];
  if (totalLives) {
    for (let i = 0; i < totalLives; i++) {
      lives.push({
        index: i + 1,
        followersMin: !followersError && livesFollowers && livesFollowers[i] ? livesFollowers[i].followersMin : null,
        followersMax: !followersError && livesFollowers && livesFollowers[i] ? livesFollowers[i].followersMax : null,
        segments: livesSegments[i] || [],
      });
    }
  }

  return {
    rawPrompt,
    totalLives,
    lives,
    criteria: {
      livesCount: "valid",
      followers: followersError ? "error" : (validFollowers ? "valid" : "invalid"),
      segments: validSegments ? "valid" : "invalid",
    },
  };
}
