"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Plus, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Aviso } from "@/lib/types"

interface DashboardAlertsProps {
  avisosPendentes: Aviso[]
}

export function DashboardAlerts({ avisosPendentes: initialAvisos }: DashboardAlertsProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const [avisos, setAvisos] = useState<Aviso[]>(initialAvisos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [newAviso, setNewAviso] = useState({ titulo: "", descricao: "", urgencia: "MÉDIA" })
  const [avisoSelecionado, setAvisoSelecionado] = useState<Aviso | null>(null)

  const urgenciaColors: Record<string, { bg: string; border: string; badge: string }> = {
    BAIXA: { bg: "bg-green-50", border: "border-green-400", badge: "bg-green-100 text-green-800" },
    MÉDIA: { bg: "bg-blue-50", border: "border-blue-400", badge: "bg-blue-100 text-blue-800" },
    ALTA: { bg: "bg-orange-50", border: "border-orange-400", badge: "bg-orange-100 text-orange-800" },
    CRÍTICA: { bg: "bg-red-50", border: "border-red-400", badge: "bg-red-100 text-red-800" },
  }

  const urgenciaEmojis: Record<string, string> = { BAIXA: "🟢", MÉDIA: "🔵", ALTA: "🟠", CRÍTICA: "🔴" }

  const urgenciaOrder: Record<string, number> = { CRÍTICA: 0, ALTA: 1, MÉDIA: 2, BAIXA: 3 }

  // Ordenar avisos por urgência
  const avisosSorted = [...avisos].sort((a, b) => urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia])

  const handleAddAviso = async () => {
    if (!newAviso.titulo.trim()) {
      toast({ title: "Campo obrigatório", description: "Preencha o título", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Usuário não autenticado")

      const { data, error } = await supabase
        .from("avisos")
        .insert([{
          titulo: newAviso.titulo,
          descricao: newAviso.descricao || null,
          urgencia: newAviso.urgencia,
          status: "PENDENTE",
          criado_por: userData.user.id,
          criado_por_nome: userData.user.email?.split("@")[0] || "Usuário",
        }])
        .select()

      if (error) throw error
      setAvisos([...avisos, data[0]])
      setNewAviso({ titulo: "", descricao: "", urgencia: "MÉDIA" })
      setIsModalOpen(false)
      toast({ title: "Aviso criado", description: "Adicionado com sucesso" })
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Falha ao criar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteAviso = async (avisoId: string) => {
    setCompletingId(avisoId)
    try {
      const { error } = await supabase
        .from("avisos")
        .update({ 
          status: "CONCLUIDO",
          data_conclusao: new Date().toISOString() 
        })
        .eq("id", avisoId)

      if (error) throw error
      
      // Remove do estado com animação suave
      setAvisos(avisos.filter(a => a.id !== avisoId))
      toast({ title: "Concluído", description: "Tarefa marcada como concluída" })
      
      // Sincroniza os dados do servidor sem reload completo
      setTimeout(() => {
        router.refresh()
      }, 300)
    } catch (error) {
      console.error(error)
      setCompletingId(null)
      toast({ title: "Erro", description: "Falha ao completar tarefa", variant: "destructive" })
    }
  }

  return (
    <>
      <div className="rounded-lg shadow-lg overflow-hidden flex flex-col bg-[#F5C800] w-full h-[360px]">
        {/* Header */}
        <div className="bg-[#1E1E1E] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-[#F5C800] uppercase">Avisos</h2>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#F5C800] hover:bg-[#FFC700] text-[#1E1E1E] h-9 w-9 p-0 rounded-full flex items-center justify-center font-bold">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Area - Fixed Height */}
        <div className="flex-1 overflow-y-auto">
          {avisosSorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <CheckCircle2 className="h-12 w-12 text-[#1E1E1E] mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#1E1E1E] opacity-70">Sem avisos pendentes</p>
            </div>
          ) : (
            <div className="p-3 space-y-2" ref={containerRef}>
              {avisosSorted.map((aviso) => {
                const cores = urgenciaColors[aviso.urgencia]
                const isCompleting = completingId === aviso.id
                return (
                  <div 
                    key={aviso.id}
                    onClick={() => setAvisoSelecionado(aviso)}
                    className={`p-3 border-l-4 rounded-lg transition-all group ${cores.border} ${cores.bg} hover:shadow-md flex-shrink-0 cursor-pointer ${isCompleting ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="text-lg flex-shrink-0 pt-0.5">{urgenciaEmojis[aviso.urgencia]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-bold text-xs text-[#1E1E1E] uppercase line-clamp-1">{aviso.titulo}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 whitespace-nowrap ${cores.badge}`}>
                              {aviso.urgencia}
                            </span>
                          </div>
                          {aviso.descricao && (
                            <p className="text-[11px] text-[#1E1E1E] opacity-70 line-clamp-1">
                              {aviso.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCompleteAviso(aviso.id) }}
                          disabled={isCompleting}
                          className="w-5 h-5 border-2 border-[#1E1E1E] rounded flex items-center justify-center hover:bg-[#1E1E1E] hover:text-[#F5C800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Marcar como concluído"
                        >
                          <Check className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Novo Aviso */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-slate-300 rounded-lg p-0">
          <DialogHeader className="border-b-2 border-slate-200 px-6 py-5">
            <DialogTitle className="text-2xl font-bold text-[#1E1E1E] uppercase">Novo Aviso</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E1E1E] uppercase block">Título *</label>
              <Input 
                placeholder="Ex: Revisar medições..." 
                value={newAviso.titulo} 
                onChange={(e) => setNewAviso({ ...newAviso, titulo: e.target.value })} 
                className="border-2 border-slate-300 focus:border-[#F5C800] focus:ring-0 text-base px-4 py-3 rounded-md" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E1E1E] uppercase block">Descrição</label>
              <textarea 
                placeholder="Detalhes..." 
                value={newAviso.descricao} 
                onChange={(e) => setNewAviso({ ...newAviso, descricao: e.target.value })} 
                className="w-full p-3 border-2 border-slate-300 focus:border-[#F5C800] focus:ring-0 rounded-md resize-none text-base min-h-24 font-medium" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1E1E1E] uppercase block">Urgência</label>
              <Select value={newAviso.urgencia} onValueChange={(v) => setNewAviso({ ...newAviso, urgencia: v })}>
                <SelectTrigger className="border-2 border-slate-300 focus:border-[#F5C800] focus:ring-0 text-base px-4 py-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">🟢 Baixa</SelectItem>
                  <SelectItem value="MÉDIA">🔵 Média</SelectItem>
                  <SelectItem value="ALTA">🟠 Alta</SelectItem>
                  <SelectItem value="CRÍTICA">🔴 Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t-2 border-slate-200 px-6 py-5 flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)} 
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-base font-bold px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAviso}
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#FFC700] font-bold uppercase text-base px-8 py-2"
            >
              {isLoading ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Visualizar Aviso Completo */}
      <Dialog open={avisoSelecionado !== null} onOpenChange={(open) => !open && setAvisoSelecionado(null)}>
        <DialogContent className="max-w-md bg-white border-2 border-slate-300 rounded-lg p-0">
          {avisoSelecionado && (
            <>
              <DialogHeader className={`border-b-2 px-6 py-5 ${urgenciaColors[avisoSelecionado.urgencia]?.bg}`} style={{ borderBottomColor: avisoSelecionado.urgencia === 'BAIXA' ? '#22c55e' : avisoSelecionado.urgencia === 'MÉDIA' ? '#3b82f6' : avisoSelecionado.urgencia === 'ALTA' ? '#f97316' : '#dc2626' }}>
                <DialogTitle className="text-2xl font-bold text-[#1E1E1E] uppercase flex items-center gap-3">
                  <span className="text-3xl">{urgenciaEmojis[avisoSelecionado.urgencia]}</span>
                  {avisoSelecionado.titulo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 px-6 py-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Urgência</label>
                  <div className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${urgenciaColors[avisoSelecionado.urgencia].badge}`}>
                    {avisoSelecionado.urgencia}
                  </div>
                </div>

                {avisoSelecionado.descricao && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Descrição</label>
                    <p className="text-sm text-[#1E1E1E] whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {avisoSelecionado.descricao}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 uppercase block mb-1">Criado por</label>
                    <p className="text-[#1E1E1E]">{avisoSelecionado.criado_por_nome || "Sistema"}</p>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 uppercase block mb-1">Data</label>
                    <p className="text-[#1E1E1E]">
                      {avisoSelecionado.created_at ? new Date(avisoSelecionado.created_at).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t-2 border-slate-200 px-6 py-5 flex gap-3 justify-end">
                <Button
                  onClick={(e) => { e.stopPropagation(); handleCompleteAviso(avisoSelecionado.id); setAvisoSelecionado(null) }}
                  className="bg-green-600 text-white hover:bg-green-700 font-bold uppercase text-sm px-4 py-2"
                >
                  ✓ Marcar como Concluído
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setAvisoSelecionado(null)} 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold px-4 py-2"
                >
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
