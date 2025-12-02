# Integração Shopify - Loviq App

## Visão Geral

A integração com Shopify permite que marcas conectem suas lojas para sincronizar produtos, receber pedidos e gerenciar estoque diretamente na plataforma Loviq.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  ┌─────────────────────────┐   ┌─────────────────────────────────┐  │
│  │  ShopifyConnectButton   │   │      StoreIntegration Page      │  │
│  └────────────┬────────────┘   └──────────────┬──────────────────┘  │
│               │                                │                      │
│               └────────────┬───────────────────┘                     │
│                            ▼                                         │
│              ┌─────────────────────────────────┐                     │
│              │       ShopifyService            │                     │
│              │  (src/services/shopify.ts)      │                     │
│              └─────────────┬───────────────────┘                     │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS                          │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ shopify-auth          │ shopify-callback   │ shopify-sync-  │    │
│  │ (gerar URL OAuth)     │ (trocar código     │  products      │    │
│  │                       │  por token)        │ (sincronizar)  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                        SUPABASE DB                                   │
│                            ▼                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────────┐     │
│  │   stores    │───▶│  products   │───▶│   shopify_products   │     │
│  │ (lojas)     │    │ (produtos)  │    │   (detalhes Shopify) │     │
│  └─────────────┘    └─────────────┘    └──────────────────────┘     │
│                            │                                         │
│                            ▼                                         │
│                   ┌──────────────────┐                              │
│                   │ shopify_sync_logs│                              │
│                   │   (logs sync)    │                              │
│                   └──────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

## Configuração

### 1. Variáveis de Ambiente do Frontend

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase
VITE_SUPABASE_URL=https://gxqzlxsbpcqqckeccvtl.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 2. Secrets das Edge Functions (Supabase Dashboard)

Acesse o [Supabase Dashboard](https://app.supabase.com/project/gxqzlxsbpcqqckeccvtl/settings/functions) e configure:

| Secret | Descrição |
|--------|-----------|
| `SHOPIFY_API_KEY` | API Key do app Shopify |
| `SHOPIFY_API_SECRET` | API Secret do app Shopify |
| `SHOPIFY_SCOPES` | Permissões necessárias (ex: `read_products,read_orders`) |

### 3. Criar App no Shopify Partners

1. Acesse [partners.shopify.com](https://partners.shopify.com/)
2. Crie um novo app
3. Configure a **Redirect URL**: `https://gxqzlxsbpcqqckeccvtl.supabase.co/functions/v1/shopify-callback`
4. Copie as credenciais (API Key e Secret)

## Fluxo de Conexão

1. **Usuário digita domínio da loja** no `ShopifyConnectButton`
2. **Frontend chama** `ShopifyService.connectStore(brandId, shopDomain)`
3. **Edge Function `shopify-auth`** gera URL de autorização OAuth
4. **Usuário é redirecionado** para Shopify para autorizar
5. **Shopify redireciona** para `shopify-callback` com código de autorização
6. **Callback troca código** por access token
7. **Token é salvo** na tabela `stores.api_credentials`
8. **Usuário pode sincronizar** produtos via `ShopifyService.syncProducts()`

## Tabelas do Banco de Dados

### `stores`
Armazena informações das lojas conectadas.

```sql
- id: SERIAL PRIMARY KEY
- brand_id: INTEGER (FK -> brands)
- name: VARCHAR
- store_type: ENUM ('shopify', 'woocommerce', 'internal')
- external_store_id: VARCHAR (domínio da loja)
- api_credentials: JSONB (access_token, shop_domain, scope)
- created_at, updated_at: TIMESTAMP
```

### `products`
Produtos sincronizados do Shopify ou criados manualmente.

```sql
- id: SERIAL PRIMARY KEY
- store_id: INTEGER (FK -> stores)
- name: VARCHAR
- description: TEXT
- price: DECIMAL
- currency: VARCHAR
- image_url: VARCHAR
- product_source_type: ENUM ('shopify', 'manual')
- external_product_id: VARCHAR (ID do produto no Shopify)
- created_at, updated_at: TIMESTAMP
```

### `shopify_products`
Detalhes específicos de produtos Shopify.

```sql
- id: SERIAL PRIMARY KEY
- product_id: INTEGER (FK -> products, UNIQUE)
- shopify_variant_id: VARCHAR
- last_sync_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

### `shopify_sync_logs`
Logs de sincronização para monitoramento.

```sql
- id: SERIAL PRIMARY KEY
- store_id: INTEGER (FK -> stores)
- sync_type: ENUM ('products', 'orders', 'inventory')
- status: ENUM ('success', 'failed', 'in_progress')
- message: TEXT
- started_at, finished_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

## Edge Functions

### `shopify-auth`
Gera a URL de autorização OAuth.

**Endpoint:** `POST /functions/v1/shopify-auth`

**Body:**
```json
{
  "shop": "store.myshopify.com",
  "brand_id": 1
}
```

**Response:**
```json
{
  "url": "https://store.myshopify.com/admin/oauth/authorize?...",
  "shop": "store.myshopify.com",
  "state": "uuid"
}
```

### `shopify-callback`
Processa o callback OAuth e salva as credenciais.

**Endpoint:** `POST /functions/v1/shopify-callback`

**Body:**
```json
{
  "code": "authorization_code",
  "shop": "store.myshopify.com",
  "brand_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "store": { "id": 1, "name": "store.myshopify.com", ... }
}
```

### `shopify-sync-products`
Sincroniza produtos do Shopify.

**Endpoint:** `POST /functions/v1/shopify-sync-products`

**Body:**
```json
{
  "store_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "synced": 45,
  "errors": 0,
  "total": 45
}
```

## Uso no Frontend

```typescript
import ShopifyService from '@/services/shopify';

// Verificar status da conexão
const status = await ShopifyService.getConnectionStatus(brandId);
// { connected: true, store: {...}, productsCount: 45, lastSync: '...' }

// Conectar loja
const result = await ShopifyService.connectStore(brandId, 'store.myshopify.com');
// { success: true, store: {...} }

// Sincronizar produtos
const syncResult = await ShopifyService.syncProducts(storeId);
// { success: true, synced: 45 }

// Listar produtos sincronizados
const products = await ShopifyService.getProducts(storeId);
// [{ id: 1, name: 'Produto', price: 99.90, ... }]

// Desconectar loja
await ShopifyService.disconnectStore(storeId);
```

## Segurança

- ✅ **RLS habilitado** em todas as tabelas
- ✅ **Access tokens** armazenados em JSONB (em produção, considere criptografia)
- ✅ **CORS configurado** nas Edge Functions
- ✅ **Validação de domínio** Shopify antes de iniciar OAuth
- ✅ **State parameter** para proteção CSRF
- ✅ **Search path fixo** nas functions do banco

## Troubleshooting

### "Supabase não configurado"
Verifique se o arquivo `.env` existe e contém `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### "Edge Function não disponível"
As Edge Functions fazem fallback para modo demo. Verifique se estão deployadas no Supabase Dashboard.

### "Failed to exchange code for token"
Verifique se os secrets `SHOPIFY_API_KEY` e `SHOPIFY_API_SECRET` estão configurados corretamente.

### "Store not found"
A loja não foi conectada corretamente ou o `store_id` está incorreto.

## Próximos Passos (Roadmap)

- [ ] Sincronização de pedidos (webhooks)
- [ ] Sincronização de inventário
- [ ] Webhook para atualizações em tempo real
- [ ] Suporte a múltiplas lojas por marca
- [ ] Dashboard de status de sincronização


