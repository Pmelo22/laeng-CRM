import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona direto para a página de login
  redirect('/auth/login');
}
