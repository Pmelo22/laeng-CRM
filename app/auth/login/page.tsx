"use client";

import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authLogin(login, senha);
    } catch (erro: unknown) {
      setError(
        erro instanceof Error ? erro.message : "Erro ao fazer login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-slate-50 to-yellow-50">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F5C800] to-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/30 transform hover:scale-105 transition-transform">
                <Image 
                  src="/icon.jpg" 
                  alt="LA Engenharia Logo" 
                  width={90}
                  height={90}
                  className="w-27 h-27"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Engravers Gothic BT', sans-serif" }}>
                LA Engenharia
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestão
              </p>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="login" className="text-sm font-medium">
                    Login
                  </Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="seu_usuario"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={isLoading}
                    className="h-11 border-slate-200 focus:border-[#F5C800] focus:ring-[#F5C800]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="senha" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={isLoading}
                    className="h-11 border-slate-200 focus:border-[#F5C800] focus:ring-[#F5C800]"
                  />
                </div>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <span className="font-medium">⚠</span>
                    <span>{error}</span>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-[#F5C800] to-yellow-400 hover:from-yellow-400 hover:to-[#F5C800] text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all hover:shadow-xl hover:shadow-yellow-500/40" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            © 2025 LA Engenharia
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido por{" "}
            <a 
              href="https://www.linkedin.com/in/pmelo22" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-[#F5C800] hover:text-yellow-400 transition-colors underline"
            >
              Patrick Albuquerque
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
