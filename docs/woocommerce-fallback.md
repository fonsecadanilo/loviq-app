# Solução de Fallback para Importação WooCommerce

## Visão Geral
Para garantir a robustez da integração com WooCommerce, foi implementado um mecanismo de fallback na listagem de produtos remotos. Isso assegura que, mesmo se as Edge Functions do Supabase estiverem indisponíveis ou falharem, a aplicação continuará funcionando ao se comunicar diretamente com a API do WooCommerce.

## O Problema
Durante o desenvolvimento local ou em ambientes onde as Edge Functions não foram implantadas, a tentativa de invocar `woocommerce-list-products` resulta em erro ("Failed to send a request to the Edge Function"), bloqueando a importação de produtos.

## A Solução
Modificamos o `WooCommerceService.listRemoteProducts` para:
1. Tentar invocar a Edge Function primeiro.
2. Se a invocação falhar (erro ou retorno vazio), executar um fluxo alternativo (fallback):
   - Buscar as credenciais da loja (`api_credentials`) diretamente na tabela `stores`.
   - Realizar uma chamada `fetch` direta para a API REST do WooCommerce (`/wp-json/wc/v3/products`).
   - Usar autenticação Basic Auth com `consumer_key` e `consumer_secret`.
   - Mapear a resposta para o formato esperado pela UI.

## Implementação Técnica
- **Arquivo**: `src/services/woocommerce.ts`
- **Método**: `listRemoteProducts`
- **Lógica**:
  ```typescript
  const { data, error } = await supabase.functions.invoke('woocommerce-list-products', ...)
  if (!error && data && !data.error) return data

  // Fallback
  const { data: store } = await supabase.from('stores')...
  const res = await fetch(`${site_url}/wp-json/wc/v3/products...`, { headers: { Authorization: ... } })
  // ... processamento
  ```

## Isolamento
Esta alteração é estritamente confinada ao `WooCommerceService`. O `ShopifyService` e seus componentes (`ShopifyImportModal`, etc.) permanecem intocados, garantindo risco zero de regressão para a integração existente.

## Testes
Foram adicionados testes unitários em `src/services/woocommerce.test.ts` validando:
1. Sucesso via Edge Function.
2. Sucesso via Fallback (simulando falha da function).
3. Tratamento de erros de credenciais.
