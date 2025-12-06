# Shopify Fetch Shipping Edge Function

Esta Edge Function busca dados de envio (shipping zones, rates) e localizações físicas de uma loja Shopify conectada.

## Escopos OAuth Necessários

Para que esta função funcione corretamente, você precisa atualizar os escopos OAuth no Supabase:

```bash
# Adicione esses escopos à variável de ambiente SHOPIFY_SCOPES
SHOPIFY_SCOPES=read_products,read_orders,read_inventory,read_shipping,read_locations
```

### Como atualizar os escopos:

1. Acesse o painel do Supabase
2. Vá em **Project Settings** > **Edge Functions** > **Secrets**
3. Atualize a variável `SHOPIFY_SCOPES` para incluir:
   - `read_shipping` - Acesso às zonas e taxas de envio
   - `read_locations` - Acesso aos locais físicos da loja

**⚠️ Importante:** Após atualizar os escopos, os usuários precisarão **reconectar** suas lojas Shopify para que as novas permissões sejam aplicadas.

## Endpoints Shopify Utilizados

- `GET /admin/api/2024-01/shipping_zones.json` - Zonas de envio com países, províncias e taxas
- `GET /admin/api/2024-01/locations.json` - Locais físicos da loja

## Request

```json
POST /functions/v1/shopify-fetch-shipping

{
  "store_id": 123,
  "include_raw": false  // Opcional: inclui dados brutos do Shopify
}
```

## Response

```json
{
  "success": true,
  "shipping_zones": [
    {
      "id": 1,
      "name": "Domestic",
      "regions": [
        {
          "id": "country-123",
          "name": "United States",
          "code": "US",
          "type": "country"
        },
        {
          "id": "province-456",
          "name": "California",
          "code": "CA",
          "type": "state",
          "country_code": "US",
          "country_name": "United States"
        }
      ],
      "rates": [
        {
          "id": 1,
          "name": "Standard Shipping",
          "price": 5.99,
          "currency": "USD",
          "type": "flat"
        },
        {
          "id": 2,
          "name": "Express Shipping",
          "price": 12.99,
          "currency": "USD",
          "type": "weight_based",
          "conditions": {
            "min_weight": 0,
            "max_weight": 10
          }
        }
      ]
    }
  ],
  "locations": [
    {
      "id": 1,
      "name": "Main Warehouse",
      "address": {
        "line1": "123 Main St",
        "line2": null,
        "city": "Los Angeles",
        "province": "California",
        "province_code": "CA",
        "country": "United States",
        "country_code": "US",
        "zip": "90001"
      },
      "phone": "+1 555-1234",
      "active": true
    }
  ]
}
```

## Uso no Frontend

```typescript
import { ShopifyService } from '../services/shopify';

// Buscar todos os dados de shipping
const data = await ShopifyService.fetchShippingData(storeId);

if (data.success) {
  console.log('Zonas de envio:', data.shipping_zones);
  console.log('Localizações:', data.locations);
}

// Buscar apenas regiões (útil para dropdown de delivery regions)
const regions = await ShopifyService.getAllShippingRegions(storeId);

// Buscar apenas taxas de envio
const rates = await ShopifyService.getAllShippingRates(storeId);
```

## Deploy

Para fazer deploy desta função:

```bash
supabase functions deploy shopify-fetch-shipping
```

Ou via MCP:
```
mcp_supabase_deploy_edge_function
```

