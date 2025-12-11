import AdminPageContent from "./admin-page-content"
import type { Usuario } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {

  const usuarios: Usuario[] = []

  return <AdminPageContent usuarios={usuarios} />
}
