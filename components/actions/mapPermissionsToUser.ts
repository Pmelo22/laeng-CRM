import type { PermissoesUsuario } from "@/lib/types"

const mapAcao = (view?: boolean, create?: boolean, edit?: boolean, del?: boolean) => {
  const obj: any = {}

  if (view !== undefined) obj.ver = view
  if (create !== undefined) obj.criar = create
  if (edit !== undefined) obj.editar = edit
  if (del !== undefined) obj.deletar = del

  return obj
}


export function mapPermissoesToModulos(permissoes: PermissoesUsuario) {
  return {
    logs: {
      modulo: "logs",
      acoes: mapAcao(
        permissoes.logs?.view
      ),
    },
    dashboard: {
      modulo: "dashboard",
      acoes: mapAcao(
        permissoes.dashboard?.view
      ),
    },
    clientes: {
      modulo: "clientes",
      acoes: mapAcao(
        permissoes.clientes?.view, permissoes.clientes?.create, permissoes.clientes?.edit, permissoes.clientes?.delete
      ),
    },
    obras: {
      modulo: "obras",
      acoes: mapAcao(
        permissoes.obras?.view,  permissoes.obras?.create,  permissoes.obras?.edit, permissoes.obras?.delete
      ),
    },
    financeira: {
      modulo: "financeira",
      acoes: mapAcao(  permissoes.financeira?.view,  permissoes.financeira?.create, permissoes.financeira?.edit, permissoes.financeira?.delete
      ),
    },
  }
}
