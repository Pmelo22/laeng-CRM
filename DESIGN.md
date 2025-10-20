# 🏗️ Setor Escritório - Sistema de Gestão de Engenharia

Sistema moderno de gestão para escritórios de engenharia, com identidade visual personalizada e experiência otimizada.

## 🎨 Identidade Visual

O sistema foi desenvolvido com base na identidade visual da empresa:
- **Cor Principal**: Amarelo vibrante (#F5C800)
- **Marca**: Logo "A" minimalista
- **Estilo**: Moderno, clean e profissional

## ✨ Funcionalidades de UX

### 📱 Sidebar Retrátil
- **Desktop**: Sidebar que expande/contrai com botão toggle
- **Estado Expandido**: Mostra ícones + textos (largura: 288px)
- **Estado Contraído**: Mostra apenas ícones (largura: 80px)
- **Indicador Visual**: Item ativo destacado em amarelo
- **Transições Suaves**: Animações em 300ms

### 📱 Design Responsivo Completo
- **Mobile (< 1024px)**: 
  - Sidebar overlay com backdrop escuro
  - Menu hamburguer no header
  - Fechamento automático ao navegar
  - Bloqueio de scroll quando aberto
- **Tablet/Desktop**: 
  - Sidebar fixa lateral
  - Botão de colapsar/expandir
  - Grid responsivo em todos os componentes

### 🎯 Melhorias de Experiência

1. **Cards com Gradientes**: Stats cards coloridos com animações hover
2. **Loading States**: Skeleton screens durante carregamento
3. **Acesso Rápido**: Cards clicáveis para navegação rápida
4. **Feedback Visual**: 
   - Hover states em todos os elementos interativos
   - Transições suaves
   - Shadows dinâmicas
5. **Login Moderno**:
   - Logo animado
   - Gradiente de fundo
   - Botão com gradiente amarelo
   - Animação de loading

## 🚀 Tecnologias

- **Next.js 15**: Framework React
- **Tailwind CSS 4**: Estilização
- **Supabase**: Backend e autenticação
- **TypeScript**: Type safety
- **Lucide Icons**: Ícones modernos

## 📂 Estrutura

```
app/
├── auth/
│   └── login/         # Página de login com nova identidade
├── dashboard/
│   ├── layout.tsx     # Layout com sidebar retrátil
│   ├── loading.tsx    # Loading state
│   ├── page.tsx       # Dashboard principal
│   ├── clientes/      # Gestão de clientes
│   ├── obras/         # Gestão de obras
│   └── financeira/    # Gestão financeira
└── globals.css        # Tema personalizado
```

## 🎨 Tema de Cores

```css
--primary: 245 200 0           /* Amarelo (#F5C800) */
--sidebar: 30 30 30            /* Fundo escuro */
--sidebar-foreground: 245 245 245  /* Texto claro */
```

## 🔐 Autenticação

O sistema usa Supabase Authentication:
- Login com email/senha
- Sessões persistentes
- Middleware de proteção de rotas
- Logout com redirecionamento

## 📱 Breakpoints Responsivos

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Sidebar Toggle**: Visível apenas em desktop (lg)

## 🎯 Próximas Implementações

- [ ] CRUD completo de Obras
- [ ] Sistema de documentos/anexos
- [ ] Gráficos e relatórios
- [ ] Notificações em tempo real
- [ ] Sistema de permissões
- [ ] Modo escuro

## 🚀 Como Usar

1. **Instalar dependências**:
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente** (.env):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   ```

3. **Rodar em desenvolvimento**:
   ```bash
   pnpm dev
   ```

4. **Acessar**: http://localhost:3000

## 📝 Notas de Design

- Sidebar escura (#1E1E1E) com detalhes amarelos
- Cards com gradientes coloridos para stats
- Hover states com escala e sombra
- Transições em 300ms para suavidade
- Mobile-first approach
- Acessibilidade (ARIA labels, keyboard navigation)

---

Desenvolvido com ❤️ para gestão eficiente de engenharia
