import AdminPageContent from "./admin-page-content"
import { getUsuarios } from "@/components/actions/userGetLogics"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const usuarios = await getUsuarios()

  console.log(usuarios)

  return <AdminPageContent usuarios={usuarios} />
}
