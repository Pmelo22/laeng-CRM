import { TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatPercentage } from "@/lib/utils"

/**
 * SISTEMA CENTRALIZADO DE CÉLULAS COLORIDAS
 * Fornece componentes reutilizáveis para células de tabela com cores contextuais
 */

// ============================================================================
// TIPOS E ENUMS
// ============================================================================

export enum CellColorType {
  SUCCESS = 'success',
  DANGER = 'danger',
  INFO = 'info',
  WARNING = 'warning',
  NEUTRAL = 'neutral',
}

export enum CellFormatType {
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  TEXT = 'text',
  NUMBER = 'number',
}

export type TableCellAlign = 'left' | 'center' | 'right'

export interface ColoredTableCellProps {
  value: number | string
  colorType?: CellColorType
  format?: CellFormatType
  align?: TableCellAlign
  className?: string
  minWidth?: string
}

export interface ConditionalColoredCellProps {
  value: number
  format?: CellFormatType
  align?: TableCellAlign
  className?: string
  minWidth?: string
}

export interface CodeBadgeCellProps {
  codigo: number
  padStart?: number
  className?: string
}

// ============================================================================
// CONFIGURAÇÕES DE CORES
// ============================================================================

const cellColorConfig: Record<string, string> = {
  success: 'text-green-700',
  danger: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
  neutral: 'text-gray-600',
}

const cellAlignConfig: Record<TableCellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

export function getCellColorByValue(value: number): CellColorType {
  if (value > 0) return CellColorType.SUCCESS
  if (value < 0) return CellColorType.DANGER
  return CellColorType.NEUTRAL
}

function formatCellValue(value: number | string, format: CellFormatType): string {
  if (typeof value === 'string') return value

  switch (format) {
    case CellFormatType.CURRENCY:
      return formatCurrency(value)
    case CellFormatType.PERCENTAGE:
      return formatPercentage(value)
    case CellFormatType.NUMBER:
      return value.toString()
    case CellFormatType.TEXT:
    default:
      return String(value)
  }
}

// ============================================================================
// COMPONENTES
// ============================================================================

export function ColoredTableCell({
  value,
  colorType = CellColorType.NEUTRAL,
  format = CellFormatType.CURRENCY,
  align = 'left',
  className = '',
  minWidth = '140px',
}: ColoredTableCellProps) {
  const colorClass = cellColorConfig[colorType]
  const alignClass = cellAlignConfig[align]
  const formattedValue = formatCellValue(value, format)

  return (
    <TableCell
      className={`py-3 ${alignClass} ${className}`}
      style={{ minWidth }}
    >
      <span className={`text-sm font-bold ${colorClass}`}>{formattedValue}</span>
    </TableCell>
  )
}

export function ConditionalColoredCell({
  value,
  format = CellFormatType.CURRENCY,
  align = 'left',
  className = '',
  minWidth = '140px',
}: ConditionalColoredCellProps) {
  const colorType = getCellColorByValue(value)
  return (
    <ColoredTableCell
      value={value}
      colorType={colorType}
      format={format}
      align={align}
      className={className}
      minWidth={minWidth}
    />
  )
}

export function CodeBadgeCell({ codigo, padStart = 3, className = '' }: CodeBadgeCellProps) {
  return (
    <TableCell className={`py-3 ${className}`}>
      <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
        #{String(codigo || 0).padStart(padStart, '0')}
      </Badge>
    </TableCell>
  )
}

export function CurrencyCell({
  value,
  colorType,
  align = 'left',
  className = '',
  minWidth = '140px',
}: Omit<ColoredTableCellProps, 'value' | 'format'> & { value: number }) {
  const finalColorType =
    colorType ||
    (value > 0 ? CellColorType.SUCCESS : value < 0 ? CellColorType.DANGER : CellColorType.NEUTRAL)

  return (
    <ColoredTableCell
      value={value}
      colorType={finalColorType}
      format={CellFormatType.CURRENCY}
      align={align}
      className={className}
      minWidth={minWidth}
    />
  )
}

export function PercentageCell({
  value,
  align = 'center',
  className = '',
  minWidth = '100px',
}: Omit<ColoredTableCellProps, 'value' | 'format'> & { value: number }) {
  return (
    <ColoredTableCell
      value={value}
      colorType={CellColorType.NEUTRAL}
      format={CellFormatType.PERCENTAGE}
      align={align}
      className={className}
      minWidth={minWidth}
    />
  )
}

export function ProgressCell({
  percentage,
  showText = true,
  className = '',
}: {
  percentage: number
  showText?: boolean
  className?: string
}) {
  const isComplete = percentage === 100
  const isPartial = percentage >= 50

  return (
    <TableCell className={`py-3 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className={`h-2 rounded-full transition-all ${
              isComplete ? 'bg-green-500' : isPartial ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {showText && <span className="text-xs font-bold text-gray-600">{formatPercentage(percentage)}</span>}
      </div>
    </TableCell>
  )
}

export function StatusIndicatorCell({
  status,
  colorType = CellColorType.NEUTRAL,
  className = '',
}: {
  status: string
  colorType?: CellColorType
  className?: string
}) {
  const dotColorMap: Record<string, string> = {
    success: 'bg-green-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    neutral: 'bg-gray-400',
  }

  return (
    <TableCell className={`py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColorMap[colorType]}`} />
        <span className="text-sm font-medium">{status}</span>
      </div>
    </TableCell>
  )
}
