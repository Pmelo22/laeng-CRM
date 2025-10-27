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
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#F5C800] transition-colors bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getActionColor(log.action)} font-bold px-3 py-1`}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <Badge variant="outline" className="font-semibold">
                          <Database className="h-3 w-3 mr-1" />
                          {getTableLabel(log.table_name)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {log.user_email || "Sistema"}
                      </span>
                    </div>

                    {log.record_id && (
                      <div className="text-xs text-muted-foreground">
                        ID do registro: <code className="bg-gray-100 px-2 py-1 rounded">{log.record_id}</code>
                      </div>
                    )}

                    {/* Detalhes da operação */}
                    {log.action === "INSERT" && log.new_data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800">
                          Ver dados criados
                        </summary>
                        <pre className="mt-2 p-3 bg-green-50 rounded text-xs overflow-x-auto border border-green-200">
                          {JSON.stringify(log.new_data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {log.action === "UPDATE" && (log.old_data || log.new_data) && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">
                          Ver alterações
                        </summary>
                        <div className="mt-2 grid md:grid-cols-2 gap-3">
                          {log.old_data && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Antes:</p>
                              <pre className="p-3 bg-red-50 rounded text-xs overflow-x-auto border border-red-200">
                                {JSON.stringify(log.old_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_data && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">Depois:</p>
                              <pre className="p-3 bg-green-50 rounded text-xs overflow-x-auto border border-green-200">
                                {JSON.stringify(log.new_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    {log.action === "DELETE" && log.old_data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                          Ver dados excluídos
                        </summary>
                        <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-x-auto border border-red-200">
                          {JSON.stringify(log.old_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
