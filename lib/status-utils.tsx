import { Badge } from "@/components/ui/badge"

export type ClienteStatus = 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'
export type ObraStatus = 'FINALIZADO' | 'EM ANDAMENTO'

interface StatusConfig {
  color: string
  label: string
}

const clienteStatusConfig: Record<ClienteStatus, StatusConfig> = {
  "FINALIZADO": { 
    color: "bg-green-100 text-green-700 border-green-300", 
    label: "Finalizado"
  },
  "EM ANDAMENTO": { 
    color: "bg-red-100 text-red-700 border-red-300", 
    label: "Em Andamento"
  },
  "PENDENTE": { 
    color: "bg-blue-100 text-blue-700 border-blue-300", 
    label: "Pendente"
  },
}

const obraStatusConfig: Record<ObraStatus, StatusConfig> = {
  "FINALIZADO": { 
    color: "bg-green-100 text-green-700 border-green-300", 
    label: "Finalizado"
  },
  "EM ANDAMENTO": { 
    color: "bg-orange-100 text-orange-700 border-orange-300", 
    label: "Em Andamento"
  },
}

export function getClienteStatusConfig(status: string): StatusConfig {
  return clienteStatusConfig[status as ClienteStatus] || clienteStatusConfig["PENDENTE"]
}

export function getObraStatusConfig(status: string): StatusConfig {
  return obraStatusConfig[status as ObraStatus] || obraStatusConfig["EM ANDAMENTO"]
}

export function getClienteStatusBadge(status: string) {
  const config = getClienteStatusConfig(status)
  return (
    <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs`}>
      <span className="font-bold">{config.label}</span>
    </Badge>
  )
}

export function getObraStatusBadge(status: string) {
  const config = getObraStatusConfig(status)
  return (
    <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs`}>
      <span className="font-bold">{config.label}</span>
    </Badge>
  )
}
