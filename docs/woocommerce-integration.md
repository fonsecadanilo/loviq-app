# Integração WooCommerce

## Visão Geral

Integração com WooCommerce seguindo o mesmo padrão arquitetural da integração Shopify, usando Supabase Edge Functions para comunicação com a API do WooCommerce e persistência no banco.

## Configuração

- Crie uma loja em `stores` com `store_type = 'woocommerce'` e credenciais em `api_credentials` contendo `site_url`, `consumer_key`, `consumer_secret`.
- Configure variáveis no `.env` para o frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## Edge Functions

- `woocommerce-list-products`: lista produtos diretamente da API do WooCommerce para importação.
- `woocommerce-sync-products`: sincroniza produtos para a tabela `products` com `external_product_id` e `store_id`.
- `woocommerce-create-order`: cria pedidos no WooCommerce a partir de pedidos locais.
- `woocommerce-order-webhook`: recebe webhooks de pedidos para atualização de status.
- `woocommerce-register-webhooks`: registra webhooks no WooCommerce.

## Fluxos

- Produtos: listagem remota, importação e sincronização para `products`.
- Pedidos: criação via Edge Function e atualização por webhook.

## Boas Práticas

- Trate erros e retente chamadas críticas.
- Mantenha compatibilidade com WooCommerce v3 da API REST.

## Troubleshooting

- Verifique credenciais em `stores.api_credentials`.
- Confirme a URL do site `site_url` com protocolo `https`.
- Verifique permissões das chaves no WooCommerce.

