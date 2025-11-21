# 🎨 **LOVIQ — PRODUCT CANVAS (Versão Editável)**

> *Documento vivo. Atualize conforme regras e decisões evoluem.*

---

# 🚀 **1. VISÃO DO PRODUTO**

Loviq é uma plataforma internacional que conecta **marcas** a **criadores/influenciadores** de live commerce, oferecendo:

- Sistema próprio de lives (WebRTC + MediaMTX)
- Pages Commerce para influenciadores
- Campanhas de produtos
- Dashboards distintos para Marcas e Creators
- Integrações estratégicas (Shopify, Stripe Connect)
- Métricas em tempo real e tracking de vendas

---

# 👥 **2. PERSONAS PRINCIPAIS**

## 🟦 Brand (Loja / Ecommerce)

Recursos: Campanhas, Wallet, Integrações, Influenciadores, Relatórios.

## 🟪 Creator (Influenciador)

Recursos: Page Commerce (Apenas na v2), Lives, Campanhas aceitas, Wallet, Dashboard.

---

# 🧱 **3. PRINCIPAIS MÓDULOS DO MVP**

## 1) Landing Page

## 2) Autenticação (Brand e Creator)

## 3) Dashboard da Marca

## 4) Dashboard do Creator

## 5) Campanhas

## 6) Page Commerce (Apenas na v2 e não no MVP)

## 7) Lives internas (WebRTC)

## 8) Wallet & Pagamentos (Stripe Connect)

## 9) Integrações (Shopify)

---

# 🛒 **4. O QUE É UMA CAMPANHA**

Campanha conecta **Marca → Produtos → Creator → Live → Vendas**.
Elementos: nome, produtos, comissão, criadores, tracking.

---

# 📺 **5. LIVES NA LOVIQ**

Sistema baseado em WHIP/WHEP:

1. Creator cria live
2. Inicia transmissão via browser
3. O Creator exibe ao público
4. É mostrado produtos durante a live para serem comprados pelos espectadores
5. Tracking de vendas e Pagamentos de Comissão (Acontece Split via Stripe Connect)

---

#  **PAGAMENTOS E COMISSÃO**

Stripe Connect obrigatório para:

- Payouts
- Pagamentos dos produtos via Checkout da Stripe
- Comissões com Split de pagamento via Stripe
- Wallet
- Split de pagamento

Fluxo: Venda → Registro → Comissão → Wallet → Payout.

---

# 🔗 **7. INTEGRAÇÕES MVP**

- **Shopify** (importar produtos, estoque, tracking)
- **Stripe Connect** (payouts, comissões)
- **Supabase** (auth, banco, RLS)

---

# 📈 **8. MÉTRICAS PRINCIPAIS**

## Para Marcas:

- Vendas por campanha
- Cliques
- Visualizações
- ROI
- Quantidade de Lives em tempo real

## Para Creators:

- Conversão por produto
- Comissões
- Engajamento da live
- Quantidade de Lives feitas na semana e mes

---

# 🏛️ **9. ARQUITETURA TÉCNICA (MACRO)**

**Frontend:** Next.js (Trae)\
**Backend:** Supabase + Stripe + MediaMTX\
**Dev Tools:** Cursor (backend) + Trae (frontend)\
**Monorepo:** apps/web + packages/ui + backend/services

---

# 🔥 **10. REGRAS GERAIS DA PLATAFORMA**

1. Brand e Creator têm áreas separadas
2. Creator vê apenas dados de campanhas aceitas e Creator PRO consegue buscar e se canditar por outras campannhas
3. Brand não vê dados pessoais do Creator
4. Tracking obrigatório em todas as vendas
5. Lives acontecem na Page Commerce
6. Wallets separadas
7. Stripe Connect obrigatório para pagamentos

---

# 📌 **11. ROADMAP MVP**

## Sprint 1 — Brand

- Landing Page
- Login/Signup Brand
- Brand Dashboard
- Campaigns v1
- Wallet
- Integrations (Shopify, Woocommerce)
- Chat para comunicação entre Marca e Creator
- Plugin Shopify para rodar as lives dentro do Ecommerce das marcas

## Sprint 2 — Creator

- Signup Creator
- Creator Dashboard
- Page Commerce
- Wallet Creator
- Stripe Connect onboarding

## Sprint 3 — Lives

- Create Live
- Go Live Page
- Viewer Page
- Chat para comunicação entre Creator e Marca
- Real-time metrics

## Sprint 4 — Tracking

- Link tracking
- Event collector
- Conversion attribution
- Full analytics

---

# 📄 **12. GLOSSÁRIO**

**Brand:** Loja que cria campanhas\
**Creator:** Influenciador que vende nas lives\
**Campaign:** Conjunto produto + comissão\
**Page Commerce:** Página pública do Creator\
**Wallet:** Sistema de saldo e pagamentos\
**Tracking:** Registro de cliques e vendas

---



# 📎 **13. ANEXOS FUTUROS**

- UI Kit
- Banco de dados detalhado
- Webhooks Shopify
- APIs do backend

---

> *Edite, reordene ou expanda qualquer seção neste canvas conforme o projeto evoluir.*


---

# 🎨 **14. DESIGN SYSTEM — LOVIQ (MVP)**

## 📋 **RESUMO DO DESIGN SYSTEM - LOVIQ**

---

## 🎨 **PALETA DE CORES PRINCIPAL**

### **Cores Primárias da Marca:**
- **Loviq Purple**: #7D2AE8 (RGB: 125, 42, 232)
- **Loviq Magenta**: #8D3AEC (RGB: 141, 58, 236)
- **Gradiente Principal**: `linear-gradient(135deg, #7D2AE8 0%, #8D3AEC 100%)`

### **Cores de Apoio:**
- **Light Background**: #FEFFFE
- **Light Card**: #FFFFFF
- **Light Border**: #E2E8F0
- **Light Accent**: #F5F3FF
- **Light Purple**: #EDE9FE
- **Light Slate**: #F1F5F9

### **Cores do Sistema (CSS Variables):**
- `--background`: 255 255 255
- `--foreground`: 17 24 39
- `--primary`: 125 42 232
- `--secondary`: 241 245 249
- `--muted`: 248 250 252
- `--accent`: 245 243 255
- `--destructive`: 239 68 68

---

## 📝 **TIPOGRAFIA E FONTES**

### **Fonte Principal:**
- Sistema: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
- Feature Settings: "cv02", "cv03", "cv04", "cv11"

### **Tamanhos de Texto:**
- Texto pequeno: `text-sm` (14px)
- Texto base: padrão do sistema
- Títulos: `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`

### **Pesos de Fonte:**
- Normal: `font-normal`
- Médio: `font-medium`
- Semibold: `font-semibold`

---

## 📐 **ESPAÇAMENTOS E GRID SYSTEM**

### **Container:**
- Centralizado: `center: true`
- Padding: `2rem`
- Max-width: 1400px (`2xl`)
- Max-w-container: 1200px

### **Border Radius:**
- Padrão: `var(--radius)` (0.75rem)
- Grande: `calc(var(--radius) - 2px)`
- Pequeno: `calc(var(--radius) - 4px)`
- Cards: `rounded-2xl`, `rounded-3xl`
- Inputs: `rounded-lg`, `rounded-xl`

---

## 🧱 **COMPONENTES BASE**

### **Botões (Button):**
- Variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `glow`
- Tamanhos: default (h-10), sm (h-9), lg (h-11), icon (h-10 w-10)
- Classe base: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium`

### **Inputs:**
- Base: `loviq-input-base` (h-11, px-4, py-2)
- Variantes: `loviq-input-modern` (h-12, rounded-xl)
- Estados: hover, focus, disabled, error, success
- Textarea: `loviq-textarea-base` (min-h-[80px])

### **Cards:**
- Estrutura: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Estilos: `loviq-card`, `loviq-main-card`, `loviq-main-card-interactive`, `loviq-main-card-dynamic`
- Sombras: `shadow-sm`, `shadow-lg`

---

## ✨ **ANIMAÇÕES E TRANSIÇÕES**

### **Animações Principais:**
- `appear`: 0.5s ease-out (opacity + translateY)
- `appear-zoom`: 0.3s ease-out (opacity + scale)
- `fade-in`: 0.6s ease-out (opacity + translateY)
- `pulse-glow`: 2s ease-in-out infinite (box-shadow)
- `sparkle-pulse`: 1.5s ease-in-out infinite (opacity + scale)

### **Animações Customizadas:**
- `input-glow-bottom/top`
- `star-movement-bottom/top`
- `radar-pulse`
- `message-pop`
- `slide-up`

### **Transições:**
- Duração: `duration-200`, `duration-300`
- Delay: `delay-100`, `delay-300`, `delay-700`, `delay-1000`

---

## 🎯 **PADRÕES DE LAYOUT**

### **Backgrounds:**
- Gradiente principal: `linear-gradient(135deg, #fefffe 0%, #f8f7ff 50%, #f0edff 100%)`
- Gradiente hero: combinações radiais + linear
- Textura: Grain effect com SVG noise

### **Efeitos Visuais:**
- Glass effect: `backdrop-filter: blur(16px)`
- Glow effects: box-shadows nas cores da marca
- Hovers: scale, shadow, border transitions

### **Sombras:**
- Tooltip: `shadow-tooltip`
- Cards: `shadow-sm`, `shadow-lg`
- Personalizadas com variações roxo/magenta

---

## 🎨 **IDENTIDADE VISUAL**

### **Logo:**
- SVG customizado com gradiente linear
- Cores: #9E6EC5, #442367, #1D0A27, #4E2C62
- Versões: gradiente, claro, branco

### **Ícones:**
- Lucide React
- Custom SVGs
- Cores: `text-purple-400`, `text-purple-500`

### **Elementos Decorativos:**
- Background beams
- Sparkles
- Gradient text: `text-gradient-loviq`

---

## 📱 **RESPONSIVIDADE**
- Mobile-first
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Padding responsivo: `px-4 sm:px-6 lg:px-8`
- Tipografia escalável
- Grid adaptativo

---

## 🌙 **CONSIDERAÇÕES DE TEMA**
- Sistema baseado em CSS Variables
- Preparado para dark mode
- Light theme padrão
- Cores em HSL para fácil customização

---

> *Design System integrado. Pronto para expansão conforme o projeto evolui.*

---

# 🕒 **15. SISTEMA DE MINUTAGEM E PLANOS (BRAND & CREATOR)**

A Loviq opera com **monetização baseada em minutos de live transmitidos**. Esse é um dos pilares principais do modelo de negócios.

## 🎥 **FORMATOS DE LIVE**
Cada live criada pela **Marca** consome minutos do seu saldo mensal.

A plataforma terá **3 formatos oficiais de live**:

- **Live de 30 minutos** — consumo fixo de 30 minutos
- **Live de 60 minutos** — consumo fixo de 60 minutos
- **Live de 90 minutos** — consumo fixo de 90 minutos

A marca escolhe o formato **antes da live começar**.

> 🔑 **O consumo de minutos é sempre debitado da carteira de minutos da MARCA.**

---

## 💼 **PLANOS PARA MARCAS (Brand Plans)**
As marcas terão três planos principais, cada um com limites e benefícios.

### 🟦 **Starter — $79,90/mês**
- Pacote fixo de minutos: **120 min/mês**
- Lives permitidas/mês: **até 4 lives**
- Criação de campanhas: **até 3 campanhas/mês**
- Acesso ao chat Marca ↔ Creator
- Plugins básicos (Shopify/WooCommerce)

### 🟪 **Pro — $129,90/mês**
- Pacote fixo de minutos: **300 min/mês**
- Lives permitidas/mês: **até 8 lives**
- Criação de campanhas: **até 10 campanhas/mês**
- Chat Marca ↔ Creator
- Acesso ao plugin Shopify para lives internas no ecommerce
- Prioridade na busca de Creators

### 🟧 **Ultra — $399,90/mês**
- Pacote fixo de minutos: **1000 min/mês**
- Lives ilimitadas (limitadas apenas pelos minutos)
- Criação de campanhas ilimitadas
- Acesso total às integrações
- Matchmaking avançado com Creators
- Suporte prioritário
- Preferência na lista de recomendações da plataforma

> 🚨 **Se uma marca ficar sem minutos → não poderá iniciar novas lives até adquirir mais minutos (ou renovar o plano).**

---

## 🧩 **PACOTES EXTRA DE MINUTOS (Add-ons)**
As marcas podem comprar pacotes adicionais de minutos a qualquer momento.

- **Pacote 100 min** — $19,90
- **Pacote 300 min** — $49,90
- **Pacote 500 min** — $79,90
- **Pacote 1000 min** — $149,90

Regras:
- Minutos extras **não expiram** enquanto o plano estiver ativo
- Caso o plano expire, minutos extras ficam congelados
- Pacotes são debitados **antes** dos minutos mensais

---

# 👤 **PLANOS PARA CREATORS (Influenciadores)**
Creators não consomem minutos — quem paga os minutos é sempre a **Marca**.

Creators têm dois planos:

### 🟩 **Creator FREE (padrão)**
- Pode participar de campanhas se for convidado pela marca
- Pode criar até **2 lives por semana**
- Acesso básico ao dashboard
- Comissões normais
- Chat Marca ↔ Creator

### 🟪 **Creator PRO — $19,90/mês**
- Pode **buscar campanhas** e se candidatar
- Pode criar **lives ilimitadas** (dependendo das campanhas)
- Destaque nas recomendações para marcas
- Acesso a métricas avançadas
- Acesso antecipado a campanhas premium
- Page Commerce com customização extra

---

# 💰 **REGRAS DE MONETIZAÇÃO (RESUMO FINAL)**

### ✔️ O consumo de minutos sempre pertence à MARCA
Criador nunca paga por minutos.

### ✔️ Criador pode ter plano PRO para aumentar visibilidade e funções extra
Não interfere no consumo de minutos.

### ✔️ Cada live desconta um bloco fixo de minutos
Independente de terminar antes.

### ✔️ Planos de marca definem limites de campanhas e lives
Além dos minutos inclusos.

### ✔️ Pacotes avulsos complementam o saldo
E permitem aumento sazonal de lives.

### ✔️ Minutos mensais não acumulam, pacotes extras sim
Minutos do plano expiram no mês; pacotes extras permanecem.

---

> *Se quiser, posso adicionar tabelas comparativas, grids visuais de cada plano,
> ou transformar esta seção em um módulo separado no Canva.*
