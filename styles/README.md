# Estrutura de Estilos do Projeto

## 📁 Organização

```
styles/
├── pages/                    # Estilos específicos por página
│   ├── clientes.css         # Listagem de clientes
│   ├── cliente-perfil.css   # Perfil individual do cliente
│   ├── obras.css            # Gestão de obras
│   ├── contratos.css        # Gestão de contratos
│   ├── financeira.css       # Página financeira
│   └── dashboard.css        # Dashboard principal
└── index.css                # Arquivo de referência

app/
└── globals.css              # Estilos globais (variáveis CSS, reset, scrollbar)
```

## 🎨 Globals.css

O arquivo `app/globals.css` contém:
- **Variáveis CSS** (cores do tema, sidebar, etc.)
- **Reset de bordas** (remove bordas automáticas)
- **Estilos do body**
- **Scrollbar customizada** (fina e discreta)

**⚠️ IMPORTANTE:** Este é o ÚNICO arquivo globals.css. O antigo `styles/globals.css` foi removido para evitar duplicação.

## 📄 Arquivos por Página

Cada arquivo de página contém estilos específicos com prefixo da página:

### clientes.css
- `.clientes-header` - Header da página
- `.clientes-metrics` - Métricas e badges
- `.clientes-search` - Barra de busca
- `.clientes-filter-container` - Filtros e botões
- `.clientes-table-container` - Container da tabela

### cliente-perfil.css
- `.cliente-perfil-container` - Container principal
- `.cliente-perfil-header` - Header do perfil
- `.cliente-dados-card` - Card de dados essenciais
- `.cliente-status-badge` - Badges de status
- `.cliente-valores-grid` - Grid de valores financeiros

### obras.css
- `.obras-container` - Container principal
- `.obras-header` - Header da página
- `.obras-btn-novo` - Botão de nova obra
- `.obras-table-container` - Container da tabela

### contratos.css
- `.contratos-container` - Container principal
- `.contratos-header` - Header da página
- `.contratos-status-*` - Badges de status de contratos

### financeira.css
- `.financeira-container` - Container principal
- `.financeira-cards-grid` - Grid de cards de resumo
- `.financeira-charts-container` - Container de gráficos
- `.financeira-card-receita` - Card de receita (verde)
- `.financeira-card-despesa` - Card de despesa (vermelho)

### dashboard.css
- `.dashboard-container` - Container principal
- `.dashboard-metrics-grid` - Grid de métricas
- `.dashboard-charts-grid` - Grid de gráficos
- `.dashboard-quick-actions` - Ações rápidas

## 🚀 Como Usar

### Em uma página específica:

```tsx
// Em app/dashboard/clientes/page.tsx
import '@/styles/pages/clientes.css'

export default function ClientesPage() {
  return (
    <div className="clientes-container">
      <header className="clientes-header">
        <h1 className="clientes-title">Gestão de Clientes</h1>
      </header>
      {/* ... */}
    </div>
  )
}
```

### Mantendo Tailwind CSS:

Os estilos em CSS puro **NÃO substituem** o Tailwind. Você pode usar ambos:

```tsx
<div className="clientes-header p-4 sm:p-6">
  {/* 'clientes-header' vem do CSS */}
  {/* 'p-4 sm:p-6' vem do Tailwind */}
</div>
```

## 📐 Convenções de Nomenclatura

### Padrão BEM (Block Element Modifier)

```css
/* Bloco */
.clientes-header { }

/* Elemento */
.clientes-header-title { }

/* Modificador */
.clientes-header--fixed { }
```

### Prefixos por Página

Cada página tem seu prefixo único:
- `clientes-` → Página de clientes
- `cliente-perfil-` → Perfil do cliente
- `obras-` → Página de obras
- `contratos-` → Página de contratos
- `financeira-` → Página financeira
- `dashboard-` → Dashboard principal

Isso evita conflitos de nomes entre páginas diferentes.

## 🎯 Benefícios

✅ **Organização clara** - Cada página tem seus próprios estilos
✅ **Fácil manutenção** - Encontre rapidamente os estilos de uma página
✅ **Sem conflitos** - Prefixos únicos evitam sobreposição
✅ **Performance** - Importe apenas os estilos necessários
✅ **Compatível com Tailwind** - Use ambos juntos sem problemas
✅ **Responsividade** - Media queries organizadas por página

## 🔧 Manutenção

### Adicionando uma nova página:

1. Crie o arquivo CSS em `styles/pages/nome-da-pagina.css`
2. Use o prefixo `.nome-da-pagina-` para todas as classes
3. Importe no componente da página
4. Atualize este README com a nova página

### Modificando estilos globais:

Edite apenas `app/globals.css` para:
- Variáveis de cores
- Reset de estilos
- Utilitários globais (scrollbar, etc.)

**Nunca crie outro globals.css!**

## 📱 Responsividade

Todos os arquivos incluem media queries padrão:
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

Exemplo:
```css
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

---

**Última atualização:** Outubro 2025  
**Projeto:** LA Engenharia CRM
