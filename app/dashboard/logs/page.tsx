import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollText, User, Calendar, Database } from "lucide-react"

export const dynamic = 'force-dynamic';

interface AuditLog {
  id: string
  user_email: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

export default async function LogsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar logs ordenados por data (mais recentes primeiro)
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  const auditLogs = (logs as AuditLog[]) || []

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date))
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-100 text-green-800 border-green-300"
      case "UPDATE":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "INSERT":
        return "Criação"
      case "UPDATE":
        return "Edição"
      case "DELETE":
        return "Exclusão"
      default:
        return action
    }
  }

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      clientes: "Clientes",
      obras: "Obras",
      contratos: "Contratos",
      financeiro: "Financeiro",
    }
    return labels[tableName] || tableName
  }

  // Função para gerar resumo amigável das mudanças
  const generateChangeSummary = (log: AuditLog): string => {
    if (log.action === "INSERT") {
      const data = log.new_data as Record<string, unknown>
      if (log.table_name === "clientes") {
        return `Novo cliente "${data?.nome || 'sem nome'}" foi cadastrado no sistema`
      }
      if (log.table_name === "obras") {
        return `Nova obra "${data?.nome || 'sem nome'}" foi cadastrada`
      }
      return `Novo registro foi criado`
    }

    if (log.action === "UPDATE") {
      const oldData = log.old_data as Record<string, unknown>
      const newData = log.new_data as Record<string, unknown>
      const changes: string[] = []

      if (log.table_name === "clientes") {
        if (oldData?.status !== newData?.status) {
          changes.push(`Status alterado de "${oldData?.status || 'Não definido'}" para "${newData?.status || 'Não definido'}"`)
        }
        if (oldData?.nome !== newData?.nome) {
          changes.push(`Nome alterado de "${oldData?.nome}" para "${newData?.nome}"`)
        }
        if (oldData?.email !== newData?.email) {
          changes.push(`Email atualizado`)
        }
        if (oldData?.telefone !== newData?.telefone) {
          changes.push(`Telefone atualizado`)
        }
        if (oldData?.endereco !== newData?.endereco) {
          changes.push(`Endereço atualizado`)
        }
        if (oldData?.cidade !== newData?.cidade || oldData?.estado !== newData?.estado) {
          changes.push(`Localização atualizada`)
        }
      }

      if (log.table_name === "obras") {
        if (oldData?.nome !== newData?.nome) {
          changes.push(`Nome alterado de "${oldData?.nome}" para "${newData?.nome}"`)
        }
        if (oldData?.status !== newData?.status) {
          changes.push(`Status alterado de "${oldData?.status}" para "${newData?.status}"`)
        }
        if (oldData?.valor_total !== newData?.valor_total) {
          const oldValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(oldData?.valor_total) || 0)
          const newValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(newData?.valor_total) || 0)
          changes.push(`Valor total alterado de ${oldValue} para ${newValue}`)
        }
      }

      if (changes.length > 0) {
        return changes.join("; ")
      }
      
      // Conta campos alterados genericamente
      const changedFields = Object.keys(newData || {}).filter(
        key => JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])
      ).length
      
      return `${changedFields} campo(s) foi(ram) atualizado(s)`
    }

    if (log.action === "DELETE") {
      const data = log.old_data as Record<string, unknown>
      if (log.table_name === "clientes") {
        return `Cliente "${data?.nome || 'sem nome'}" foi excluído do sistema`
      }
      if (log.table_name === "obras") {
        return `Obra "${data?.nome || 'sem nome'}" foi excluída`
      }
      return `Registro foi excluído`
    }

    return "Operação realizada"
  }

  // Função para destacar as principais mudanças em formato de lista
  const getMainChanges = (log: AuditLog): string[] => {
    if (log.action !== "UPDATE") return []
    
    const oldData = log.old_data as Record<string, unknown>
    const newData = log.new_data as Record<string, unknown>
    const changes: string[] = []

    // Campos importantes para destacar
    const importantFields: Record<string, string> = {
      nome: "Nome",
      status: "Status",
      email: "Email",
      telefone: "Telefone",
      endereco: "Endereço",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      valor_total: "Valor Total",
      data_inicio: "Data de Início",
      data_fim: "Data de Término",
    }

    Object.keys(importantFields).forEach(field => {
      if (oldData?.[field] !== newData?.[field] && (oldData?.[field] || newData?.[field])) {
        const fieldLabel = importantFields[field]
        const oldValue = oldData?.[field] || "(vazio)"
        const newValue = newData?.[field] || "(vazio)"
        
        // Formatação especial para valores monetários
        if (field === "valor_total" && typeof newValue === 'number') {
          const formattedOld = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(oldValue) || 0)
          const formattedNew = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newValue)
          changes.push(`${fieldLabel}: ${formattedOld} → ${formattedNew}`)
        } else {
          changes.push(`${fieldLabel}: "${oldValue}" → "${newValue}"`)
        }
      }
    })

    return changes
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b-4 border-[#F5C800]">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <ScrollText className="h-8 w-8 text-[#F5C800]" />
            <div>
              <h1 className="text-3xl font-bold text-white uppercase">LOGS DE AUDITORIA</h1>
              <p className="text-[#F5C800] font-medium text-sm">
                Histórico completo de todas as operações no sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Card de Resumo */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-green-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase">TOTAL DE CRIAÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {auditLogs.filter(log => log.action === "INSERT").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase">TOTAL DE EDIÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {auditLogs.filter(log => log.action === "UPDATE").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase">TOTAL DE EXCLUSÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {auditLogs.filter(log => log.action === "DELETE").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F5C800] shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase">TOTAL DE OPERAÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1E1E1E]">
                {auditLogs.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Logs */}
        <Card className="shadow-lg border-t-4 border-t-[#F5C800]">
          <CardHeader className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white rounded-t-lg py-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 uppercase">
              <ScrollText className="h-6 w-6" />
              HISTÓRICO DE OPERAÇÕES
            </CardTitle>
            <CardDescription className="text-[#F5C800] font-medium text-base mt-2">
              {auditLogs.length} registro(s) encontrado(s) - últimos 100
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum log registrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => {
                  const mainChanges = getMainChanges(log)
                  const summary = generateChangeSummary(log)
                  
                  return (
                    <div
                      key={log.id}
                      className="p-5 rounded-lg border-2 border-gray-200 hover:border-[#F5C800] transition-colors bg-white shadow-sm hover:shadow-md"
                    >
                      {/* Cabeçalho do Log */}
                      <div className="flex items-start justify-between mb-4 pb-3 border-b">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getActionColor(log.action)} font-bold px-3 py-1.5 text-sm`}>
                            {getActionLabel(log.action)}
                          </Badge>
                          <Badge variant="outline" className="font-semibold text-sm">
                            <Database className="h-3.5 w-3.5 mr-1.5" />
                            {getTableLabel(log.table_name)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(log.created_at)}
                        </div>
                      </div>

                      {/* Resumo da Operação */}
                      <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          📋 {summary}
                        </p>
                      </div>

                      {/* Usuário Responsável */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Realizado por:</span>
                        <span className="text-[#000000] font-semibold">
                          {log.user_email || "Sistema Automático"}
                        </span>
                      </div>

                      {/* Principais Mudanças (para UPDATE) */}
                      {log.action === "UPDATE" && mainChanges.length > 0 && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-900 mb-2 uppercase">
                            ✏️ Principais Alterações:
                          </p>
                          <ul className="space-y-1.5">
                            {mainChanges.map((change, idx) => (
                              <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">•</span>
                                <span className="font-mono">{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* ID do Registro */}
                      {log.record_id && (
                        <div className="text-xs text-muted-foreground mb-3">
                          <span className="font-semibold">Identificador do registro:</span>{" "}
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                            {log.record_id}
                          </code>
                        </div>
                      )}

                      {/* Detalhes Técnicos (Expandível) */}
                      {log.action === "INSERT" && log.new_data && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2">
                            <span>🔍 Ver dados técnicos completos</span>
                          </summary>
                          <pre className="mt-2 p-3 bg-green-50 rounded text-xs overflow-x-auto border border-green-200 max-h-60">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.action === "UPDATE" && (log.old_data || log.new_data) && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center gap-2">
                            <span>🔍 Ver comparação técnica completa (Antes/Depois)</span>
                          </summary>
                          <div className="mt-2 grid md:grid-cols-2 gap-3">
                            {log.old_data && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                  <span className="text-red-600">❌</span> Valores Anteriores:
                                </p>
                                <pre className="p-3 bg-red-50 rounded text-xs overflow-x-auto border border-red-200 max-h-60">
                                  {JSON.stringify(log.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                  <span className="text-green-600">✅</span> Valores Novos:
                                </p>
                                <pre className="p-3 bg-green-50 rounded text-xs overflow-x-auto border border-green-200 max-h-60">
                                  {JSON.stringify(log.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      )}

                      {log.action === "DELETE" && log.old_data && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-2">
                            <span>🔍 Ver dados técnicos do registro excluído</span>
                          </summary>
                          <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-x-auto border border-red-200 max-h-60">
                            {JSON.stringify(log.old_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
