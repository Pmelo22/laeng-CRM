# Laeng CRM - AI Assistant Instructions

**Project**: Sistema de Gestão para Escritório de Engenharia (Construction/Engineering Management CRM)  
**Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase, Shadcn/ui  
**Branch**: homologation

## Architecture Overview

### Core Stack Decisions
- **Next.js App Router** (not Pages Router): Server components by default; use `"use client"` explicitly for interactive components
- **Supabase**: PostgreSQL backend with RLS policies (Row Level Security) enabled on all tables
- **Shadcn/ui + Radix UI**: Pre-built components in `components/ui/`; customize via Tailwind CSS, not component modification
- **Tailwind CSS v4**: Use utility classes; primary color is `#F5C800` (yellow), secondary `#1E1E1E` (black)
- **React Hook Form + Zod**: Form handling with client-side validation; schemas define data structure and constraints

### Data Model Structure
The system tracks **Clientes** (Clients) → **Obras** (Projects) → **Medições** (Measurements) & **Financeiro** (Financial):

1. **clientes**: Client records with aggregated financial data from obras
2. **obras**: Construction projects with detailed cost breakdown (empreiteiro, material, mão de obra, especialistas)
3. **contratos**: Contracts linking clients to projects
4. **financeiro**: Financial transactions and cash flow tracking
5. **profiles**: User profiles linked to Supabase auth.users

**Key Pattern**: Cliente data contains aggregated values (valor_total, entrada, etc.) calculated FROM obra records—don't modify directly in cliente table during obra updates.

## Developer Workflows

### Running the Project
```bash
pnpm dev          # Development (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint check
```

### Database Access Patterns
- **Server Components**: Use `createClient()` from `lib/supabase/server.ts` (has admin access via middleware)
- **Client Components**: Use `createClient()` from `lib/supabase/client.ts` (browser client, respects RLS)
- **Sequential IDs**: Use `getNextCode(supabase, tableName)` from `lib/supabase-utils.ts` to generate sequential codigo values
- **Parallel Queries**: Dashboard page fetches stats in `Promise.all()` to reduce latency

### Authentication & Routing
- All dashboard routes require authentication; middleware redirects unauthenticated users to `/auth/login`
- Session managed via Supabase SSR cookies; user role stored in `profiles.cargo` (admin | funcionario)
- When creating a Cliente, **always create associated Obra record** with same codigo (see `cliente-modal.tsx` for pattern)

## Project-Specific Patterns & Conventions

### Type System (`lib/types.ts`)
- **Cliente**: Base client data; includes optional aggregated fields (valor_total, entrada, valor_financiado, subsidio)
- **Obra**: Complete project record with nested cost fields (empreiteiro, material, mao_de_obra, pintor, eletricista, gesseiro, azulejista, manutencao, terceirizado)
- **ObraComCliente**: Obra with denormalized cliente info (client_nome, client_endereco)
- **ObraFinanceiro**: Obra + calculated financials (custo_total, resultado, margem_lucro, percentual_pago)
- **DashboardFinanceiro & FluxoResumo**: Aggregate metrics for dashboard (use these for financial summaries)

### Form Handling
- **Modal patterns** in `components/cliente-modal.tsx`, `cliente-edit-modal.tsx`, `obra-edit-modal.tsx`:
  - Use Dialog from Shadcn + form state in useState (not external form libraries for modals)
  - Validation with Zod before Supabase insert
  - On success: `router.refresh()` + optional `window.location.reload()` to sync server state
  - On error: Keep modal open, show error toast, allow user to correct data
- **CEP Integration**: `buscarCepViaCep()` from `lib/utils.ts` auto-fills address fields (Cidade, Estado, Endereço)
- **Currency Fields**: Use `formatMoneyInput()` for display, `parseMoneyInput()` for parsing (converts string with locale formatting to number)

### UI/Status Badge System
- **Status Types**: 'FINALIZADO' (green), 'EM ANDAMENTO' (red), 'PENDENTE' (blue)
- **Badge Helpers**: `getClienteStatusBadge()` in `lib/status-utils.tsx` returns pre-styled badge components
- **Tables**: Use Shadcn table component; implement sorting client-side (asc → desc → none), pagination with items-per-page select

### Dashboard & Charting
- **Charts**: All graphs use **Recharts** (v2.15.4); see `components/dashboard-charts.tsx` for examples
- **Chart Types Used**: BarChart (faturamento × fase), PieChart (obras × fase), LineChart (faturamento × ano, local_obra × valor)
- **Metrics Calculations**:
  - Total receita = sum of obra.valor_total
  - Obras ativas = count where status = 'EM ANDAMENTO'
  - Margem de lucro = (valor_total - valor_obra) / valor_total

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with theme provider and toast system |
| `lib/types.ts` | All TypeScript interfaces (Cliente, Obra, ObraFinanceiro, etc.) |
| `lib/supabase/client.ts` | Browser Supabase client (RLS enforced) |
| `lib/supabase/server.ts` | Server Supabase client (authenticated) |
| `lib/utils.ts` | Formatters: formatCurrency, formatDate, CEP lookup, money parsing |
| `lib/supabase-utils.ts` | getNextCode() for sequential IDs |
| `components/cliente-modal.tsx` | Exemplar: Form modal pattern (new + edit) |
| `components/clientes-table.tsx` | Exemplar: Client-side sorting, pagination, search |
| `app/dashboard/page.tsx` | Exemplar: Parallel data fetching, metric cards, chart composition |

## Integration Points & External Dependencies

### Supabase Specifics
- **Auth Flow**: Signup/Login via `auth/login`, redirects to callback handler
- **RLS Policies**: All authenticated users can SELECT, INSERT, UPDATE, DELETE (project-specific policy)
- **Middleware**: `lib/supabase/middleware.ts` refreshes user session on request
- **Admin Access**: Service role key used server-side only (never expose in client code)

### ViaCEP Integration
- Called when CEP input reaches 8 digits: `buscarCepViaCep(cep)` returns { logradouro, localidade, uf, erro? }
- Fields auto-populated in form (can be overridden by user)

### Vercel Analytics
- Configured in `next.config.mjs`; no additional setup needed

## Common Tasks & Gotchas

### Adding a New Table
1. Define TypeScript interface in `lib/types.ts`
2. Add Supabase RLS policies (SELECT/INSERT/UPDATE/DELETE for authenticated users)
3. Create UI component in `components/` (typically a modal for create/edit)
4. Fetch data in page component using `createClient()` from server
5. Don't forget sequential codigo if needed: use `getNextCode(supabase, "table_name")`

### Modifying Obra Financial Fields
- Updates trigger automatic calculated fields (valor_total = entrada + valor_financiado + subsidio)
- Empreiteiro saldo and percentual calculated: saldo = empreiteiro - empreiteiro_valor_pago
- Always fetch ObraFinanceiro view (or calculate on client) for margin/result metrics

### Client-Side vs Server-Side Rendering
- Dashboard stats page: **Server component** (parallel `Promise.all()` queries)
- Modals & tables with interaction: **Client components** (`"use client"`)
- Hybrid: Page fetches data server-side, passes to client component for rendering/sorting

### Environment Variables
- Place in `.env.local` (gitignored)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: injected at build time
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, never exposed to browser

## Conventions to Follow

- **File Naming**: kebab-case for files (`cliente-modal.tsx`, not `clienteModal.tsx`)
- **Component Naming**: PascalCase (`ClienteModal`, not `clienteModal`)
- **Type/Interface Naming**: PascalCase with descriptive name (`ObraFinanceiro`, not `ObraFin`)
- **Toast Notifications**: Use `useToast()` hook from `hooks/use-toast.ts`; provide title + description
- **Loading States**: Show `<Loader2 className="animate-spin" />` icon + disable form inputs during async operations
- **Tailwind**: Prefer utility classes; use `cn()` helper from `lib/utils.ts` for conditional classes (combines clsx + tailwind-merge)

## Documentation & Support
See `README.md` for full feature list, database schema details, and future enhancements planned.
