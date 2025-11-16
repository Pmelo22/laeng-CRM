# Sistema de Avisos - Documentação

## 📋 Resumo

Implementado novo sistema dinâmico de **Avisos** (notificações/tarefas) na página de Dashboard com as seguintes características:

### ✨ Funcionalidades

1. **Card Visual com Identidade Visual**
   - Fundo amarelo (#F5C800) com texto preto (#1E1E1E)
   - Design limpo e minimalista (Apple Notes style)
   - Botão "+" no topo direito para adicionar novos avisos

2. **Níveis de Urgência com Cores**
   - 🟢 **BAIXA** (verde) - Tarefas normais
   - 🔵 **MÉDIA** (azul) - Prioridade normal
   - 🟠 **ALTA** (laranja) - Urgente
   - 🔴 **CRÍTICA** (vermelho) - Máxima prioridade

3. **Funcionalidades de Usuário**
   - ✅ **Adicionar avisos** - Modal com campos: título, descrição, urgência
   - ✅ **Clicar para completar** - Clique no aviso marca como concluído
   - ✅ **Deletar aviso** - Botão X ao passar o mouse
   - ✅ **Scroll ilimitado** - Suporta múltiplos avisos
   - ✅ **Animações GSAP** - Entrada staggered, saída suave

4. **Persistência em Banco de Dados**
   - Tabela: `avisos` no Supabase PostgreSQL
   - RLS policies com controle de acesso
   - Campos: id, titulo, descricao, urgencia, status, criado_por, atribuido_para, data_vencimento, timestamps

5. **Animações**
   - Entrada: Staggered y:20 → y:0 com opacity fade-in
   - Hover: Scale 1.02 com elevação
   - Saída ao completar: Fade-out com slide-right
   - Saída ao deletar: Scale down com fade-out

## 📂 Arquivos Modificados

### `components/dashboard-alerts.tsx` (NOVO - Totalmente reescrito)
```tsx
// Componente dinâmico com:
// - Fetch de avisos do banco de dados
// - Modal para criar novos avisos
// - Animações GSAP
// - Handlers de completar/deletar
```

**Props:**
```typescript
interface DashboardAlertsProps {
  avisosPendentes: Aviso[]
}
```

**Estados:**
- `avisos`: Array de avisos pendentes
- `isModalOpen`: Controla visibilidade do modal
- `isLoading`: Controla estado de carregamento
- `newAviso`: Dados do novo aviso sendo criado

**Handlers:**
- `handleAddAviso()` - Salva novo aviso no DB
- `handleCompleteAviso()` - Marca aviso como concluído
- `handleDeleteAviso()` - Remove aviso do sistema
- `handleAvisoClick()` - Completa aviso ao clicar

### `app/dashboard/page.tsx` (MODIFICADO)
```tsx
// Adicionada query paralela para avisos
const [avisos] = await supabase
  .from("avisos")
  .select("*")
  .eq("status", "PENDENTE")
  .order("urgencia", { ascending: false })
  .order("created_at", { ascending: false })

// Passagem de props para DashboardAlerts
<DashboardAlerts avisosPendentes={avisos || []} />
```

### `lib/types.ts` (ATUALIZADO)
```typescript
// Nova interface Aviso
interface Aviso {
  id: string
  titulo: string
  descricao?: string
  urgencia: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA'
  status: 'PENDENTE' | 'CONCLUÍDO'
  criado_por: string
  criado_por_nome?: string
  atribuido_para?: string
  atribuido_para_nome?: string
  data_vencimento?: string
  data_conclusao?: string
  created_at: string
  updated_at: string
}
```

### Banco de Dados - `avisos` Table (CRIADA)
```sql
CREATE TABLE avisos (
  id UUID PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  urgencia VARCHAR NOT NULL CHECK (urgencia IN ('BAIXA', 'MÉDIA', 'ALTA', 'CRÍTICA')),
  status VARCHAR NOT NULL CHECK (status IN ('PENDENTE', 'CONCLUÍDO')),
  criado_por UUID NOT NULL REFERENCES auth.users,
  criado_por_nome VARCHAR,
  atribuido_para UUID REFERENCES auth.users,
  atribuido_para_nome VARCHAR,
  data_vencimento TIMESTAMP,
  data_conclusao TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_avisos_status ON avisos(status);
CREATE INDEX idx_avisos_urgencia ON avisos(urgencia);
CREATE INDEX idx_avisos_atribuido_para ON avisos(atribuido_para);
CREATE INDEX idx_avisos_criado_por ON avisos(criado_por);

-- RLS Policies
-- SELECT: Todos usuários autenticados podem ver
-- INSERT: Apenas criador pode criar
-- UPDATE: Criador ou atribuído podem atualizar
-- DELETE: Apenas criador pode deletar
```

## 🎨 Cores e Estilos

### Paleta Principal
- **Fundo do Card**: `bg-gradient-to-br from-[#F5C800] to-[#F5C800]/90`
- **Header**: `bg-[#1E1E1E]` (preto)
- **Texto Header**: `text-[#F5C800]` (amarelo)
- **Texto Corpo**: `text-[#1E1E1E]` (preto)
- **Botão +**: `bg-[#F5C800] hover:bg-[#F5C800]/90` com `text-[#1E1E1E]`

### Cores por Urgência
```
BAIXA:    bg-green-50,    border-green-500,    badge: bg-green-100 text-green-800
MÉDIA:    bg-blue-50,     border-blue-500,     badge: bg-blue-100 text-blue-800
ALTA:     bg-orange-50,   border-orange-500,   badge: bg-orange-100 text-orange-800
CRÍTICA:  bg-red-50,      border-red-500,      badge: bg-red-100 text-red-800
```

## 🎯 Como Usar

### 1. **Adicionar um Aviso**
1. Clique no botão "+" no topo direito do card
2. Preencha o título (obrigatório)
3. Opcionalmente adicione descrição
4. Selecione nível de urgência (BAIXA, MÉDIA, ALTA, CRÍTICA)
5. Clique em "Adicionar"
6. Aviso aparece com animação de entrada

### 2. **Marcar Aviso como Concluído**
1. Clique no aviso desejado
2. Aviso sai com animação de fade-out
3. Status no banco muda para "CONCLUÍDO"
4. Toast de confirmação aparece

### 3. **Deletar um Aviso**
1. Passe o mouse sobre o aviso
2. Botão X aparece no lado direito
3. Clique no botão X
4. Aviso sai com animação de scale-down
5. Removido do sistema

### 4. **Visualizar Avisos**
- Avisos aparecem em ordem de urgência (CRÍTICA → ALTA → MÉDIA → BAIXA)
- Dentro da mesma urgência: ordenados por data de criação (mais recentes primeiro)
- Scroll automático para múltiplos avisos
- Indicador visual "Sem avisos pendentes" quando vazio

## 🔧 Detalhes Técnicos

### Animações GSAP

**Entrada (ao montar):**
```javascript
gsap.from(alertsRef.current.filter(Boolean), {
  duration: 0.6,
  y: 20,
  opacity: 0,
  stagger: 0.08,
  ease: "back.out"
})
```

**Hover:**
```javascript
// Mouseenter
gsap.to(element, { duration: 0.3, scale: 1.02, y: -5 })
// Mouseleave
gsap.to(element, { duration: 0.3, scale: 1, y: 0 })
```

**Saída ao Completar:**
```javascript
gsap.to(element, {
  duration: 0.4,
  opacity: 0,
  x: 100,
  ease: "power2.in"
})
```

**Saída ao Deletar:**
```javascript
gsap.to(element, {
  duration: 0.3,
  opacity: 0,
  scale: 0.9,
  ease: "back.in"
})
```

### Cliente Supabase

```typescript
// Criar novo aviso
const { data, error } = await supabase
  .from("avisos")
  .insert([{ titulo, descricao, urgencia, ... }])
  .select()

// Completar aviso
const { error } = await supabase
  .from("avisos")
  .update({ status: "CONCLUÍDO", data_conclusao: new Date() })
  .eq("id", avisoId)

// Deletar aviso
const { error } = await supabase
  .from("avisos")
  .delete()
  .eq("id", avisoId)

// Fetch avisos pendentes
const { data: avisos } = await supabase
  .from("avisos")
  .select("*")
  .eq("status", "PENDENTE")
  .order("urgencia", { ascending: false })
```

## 📊 Estrutura do Modal

```
Dialog
├── DialogHeader
│   ├── DialogTitle: "Novo Aviso"
│   └── DialogDescription
├── Form Fields
│   ├── Input: Título (obrigatório)
│   ├── Textarea: Descrição
│   └── Select: Urgência
└── DialogFooter
    ├── Button: Cancelar
    └── Button: Adicionar (com loading state)
```

## 🚀 Integração no Dashboard

O card aparece:
- **Posição**: Lado direito da seção Clientes
- **Tamanho**: 1/3 da largura em desktop (100% em mobile)
- **Layout**: Grid com max-height: 500px e scroll
- **Responsividade**: Adapta padding, font-size em sm/md breakpoints

## ✅ Checklist de Funcionalidades

- ✅ Card com cores da identidade visual (#F5C800 + #1E1E1E)
- ✅ Botão "+" para adicionar avisos
- ✅ Modal com form para criar novo aviso
- ✅ Campos: título, descrição, urgência
- ✅ Níveis de urgência com cores próprias
- ✅ Clique no aviso marca como concluído
- ✅ Botão delete com animação
- ✅ Scroll para múltiplos avisos
- ✅ Animações GSAP (entrada, hover, saída)
- ✅ Persistência em banco de dados
- ✅ RLS policies para segurança
- ✅ Toast notifications para feedback
- ✅ Loading states
- ✅ Responsividade mobile
- ✅ Ordenação por urgência e data

## 🔮 Futuras Melhorias

- [ ] Atribuição de avisos a outros usuários
- [ ] Data de vencimento com alerta
- [ ] Editar aviso existente
- [ ] Filtro por urgência/usuário
- [ ] Busca de avisos
- [ ] Avisos recorrentes
- [ ] Notificações em tempo real (websockets)
- [ ] Marcar como lido/não lido
- [ ] Avisos assinalados para grupo
- [ ] Histórico de avisos concluídos

## 🐛 Troubleshooting

### Avisos não aparecem
1. Verifique se o usuário está autenticado
2. Confirme se existem avisos com status 'PENDENTE' no banco
3. Verifique as RLS policies

### Erro ao criar aviso
1. Valide se o título foi preenchido
2. Confirme se o usuário tem permissão de INSERT na tabela
3. Verifique console para detalhes do erro

### Animações não funcionam
1. Confirme se GSAP está instalado: `pnpm ls gsap`
2. Verifique se refs estão sendo atribuídas corretamente
3. Abra DevTools e procure por erros JavaScript

---

**Build Status**: ✅ Compilado com sucesso
**Database**: ✅ Tabela criada e RLS configurado
**Tipo**: ✅ TypeScript types definidos
