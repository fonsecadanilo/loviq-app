/**
 * Serviço de API para campanhas
 * 
 * Por enquanto, processa localmente. Preparado para integração com Supabase.
 */

import { parseCampaignStep1Prompt } from "./step1";
import type { Step1ParseResult } from "./types";

/**
 * Processa o prompt do Step 1 e retorna o resultado parseado
 * 
 * TODO: Integrar com Supabase para persistir o resultado
 * 
 * @param rawPrompt - O prompt do usuário
 * @param campaignId - ID da campanha (opcional, para persistência futura)
 * @returns Resultado do parse com validação dos 3 critérios
 */
export async function processStep1Prompt(
  rawPrompt: string,
  campaignId?: string
): Promise<Step1ParseResult> {
  // Por enquanto, processa localmente
  // No futuro, pode chamar uma Supabase Edge Function ou API route
  
  const result = parseCampaignStep1Prompt(rawPrompt);
  
  // TODO: Persistir no Supabase quando campaignId for fornecido
  // if (campaignId) {
  //   await supabase
  //     .from('campaigns')
  //     .update({ step1_data: result })
  //     .eq('id', campaignId);
  // }
  
  return result;
}

/**
 * Cria uma nova campanha no banco de dados
 * 
 * TODO: Implementar com Supabase
 */
export async function createCampaign(
  step1Data: Step1ParseResult
): Promise<{ id: string }> {
  // TODO: Implementar criação de campanha no Supabase
  // const { data, error } = await supabase
  //   .from('campaigns')
  //   .insert({
  //     brand_id: getCurrentBrandId(),
  //     step1_data: step1Data,
  //     status: 'draft',
  //   })
  //   .select()
  //   .single();
  
  // Simulação por enquanto
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: `campaign-${Date.now()}` });
    }, 500);
  });
}

