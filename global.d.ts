/**
 * Declarações de tipos globais para o projeto
 */

// Declaração para imports CSS
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
