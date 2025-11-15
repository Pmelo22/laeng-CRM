import { Badge } from "@/components/ui/badge"
import { 
  SelectItem, 
  SelectContent 
} from "@/components/ui/select"

export type ClienteStatus = 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'
export type ObraStatus = 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'

interface StatusConfig {
  color: string
  label: string
  badgeColor: string
  badgeHoverColor: string
  dotColor: string
}

const statusConfig: Record<ClienteStatus | ObraStatus, StatusConfig> = {
  "FINALIZADO": { 
    color: "bg-green-100 text-green-700 border-green-200", 
    label: "Finalizado",
    badgeColor: "bg-green-500",
    badgeHoverColor: "bg-green-600",
    dotColor: "bg-green-500"
  },
  "EM ANDAMENTO": { 
    color: "bg-red-100 text-red-700 border-red-200", 
    label: "Em Andamento",
    badgeColor: "bg-red-500",
    badgeHoverColor: "bg-red-600",
    dotColor: "bg-red-500"
  },
  "PENDENTE": { 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    label: "Pendente",
    badgeColor: "bg-blue-600",
    badgeHoverColor: "bg-blue-700",
    dotColor: "bg-blue-600"
  },
}

export function getStatusConfig(status: string): StatusConfig {
  return statusConfig[status as ClienteStatus | ObraStatus] || statusConfig["PENDENTE"]
}

export function getClienteStatusConfig(status: string): StatusConfig {
  return getStatusConfig(status)
}

export function getObraStatusConfig(status: string): StatusConfig {
  return getStatusConfig(status)
}

export function getClienteStatusBadge(status: string) {
  const config = getStatusConfig(status)
  return (
    <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs font-bold`}>
      {config.label}
    </Badge>
  )
}

export function getObraStatusBadge(status: string) {
  const config = getStatusConfig(status)
  return (
    <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs font-bold`}>
      {config.label}
    </Badge>
  )
}

/**
 * Função genérica para obter o badge de status (funciona para qualquer tipo)
 * Uso: {getStatusBadge(status)}
 */
export function getStatusBadge(status: string) {
  const config = getStatusConfig(status)
  return (
    <Badge variant="outline" className={`${config.color} border font-medium px-2 py-1 text-xs font-bold`}>
      {config.label}
    </Badge>
  )
}

/**
 * Componente reutilizável para renderizar opções de status com cores
 * Uso: <StatusSelectContent currentStatus={formData.status} />
 */
export function StatusSelectContent() {
  return (
    <SelectContent>
      <SelectItem value="all">STATUS</SelectItem>
      <SelectItem value="PENDENTE">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Pendente</span>
        </div>
      </SelectItem>
      <SelectItem value="EM ANDAMENTO">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Em Andamento</span>
        </div>
      </SelectItem>
      <SelectItem value="FINALIZADO">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Finalizado</span>
        </div>
      </SelectItem>
    </SelectContent>
  )
}

/**
 * Função para obter a classe CSS do ponto colorido baseado no status
 * Uso: className={getStatusDotClass(status)}
 */
export function getStatusDotClass(status: string): string {
  const config = getStatusConfig(status)
  return config.dotColor
}
