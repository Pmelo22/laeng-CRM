import type { PermissoesUsuario } from "@/lib/types"

const mapAcao = (view?: boolean, create?: boolean, edit?: boolean, del?: boolean) => ({
  ver: !!view,
  criar: !!create,
  editar: !!edit,
  deletar: !!del,
})

export function mapPermissoesToModulos(permissoes: PermissoesUsuario) {
  return {
    logs: {
      modulo: "logs",
      acoes: mapAcao(
        permissoes.logs?.view, permissoes.logs?.create, permissoes.logs?.edit, permissoes.logs?.delete
      ),
    },
    admin: {
      modulo: "admin",
      acoes: mapAcao(
        permissoes.admin?.view, permissoes.admin?.create, permissoes.admin?.edit, permissoes.admin?.delete
      ),
    },
    dashboard: {
      modulo: "dashboard",
      acoes: mapAcao(
        permissoes.dashboard?.view, permissoes.dashboard?.create, permissoes.dashboard?.edit, permissoes.dashboard?.delete
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
