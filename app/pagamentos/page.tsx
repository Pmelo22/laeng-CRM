import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PagamentosPageContent from "./pagamentos-page-content"
import { getUserContext } from "../auth/context/userContext";

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  const supabase = await createClient()

  const { userPermissions } = await getUserContext();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  return <PagamentosPageContent userPermissions={userPermissions} />
}
