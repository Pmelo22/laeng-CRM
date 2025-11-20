import { verificarJWT } from "@/lib/auth/jwt";

try {
  const result = verificarJWT("teste");
  console.log("JWT validado:", result);
} catch (error) {
  console.error("Erro ao validar JWT:", error);
}
