export const OBRA_CATEGORY_ID = "522c635e-0957-4c93-90e7-ffb7b6d23e75"

export type Category = {
  label: string;
  value: string
}

export type Subcategory = {
  id: string;
  name: string;
  categories_id: string
}

export type ObraData = {
  id: number
  cliente_id: number
  cliente_nome: string
  empreiteiro: number
  material: number
  pintor: number
  eletricista: number
  gesseiro: number
  azulejista: number
  manutencao: number
}

export type modalsState = {
  isCatOpen: boolean
  isSubOpen: boolean
  isDeleteOpen: boolean
  isLinkOpen: boolean
  isFinanceiroLinkOpen: boolean
}

export type editingData = {
  category: { id: string, name: string } | null
  subcategory: { id: string, name: string, catId: string } | null
  toDelete: { type: 'cat' | 'sub', id: string, name: string } | null
}


export const OBRA_SUBCATEGORIES_MAP: Record<string, string> = {
  manutencao: "23264d1e-0936-4682-9d08-098015450f76",
  material: "534610b3-bf0e-49a1-bda5-18b1c6e4cb1d",
  empreiteiro: "5890a7ee-8714-4433-bed5-c317e6ccfcf0",
  pintor: "886292e3-92ee-4697-8e4a-9a5a371a79e8",
  gesseiro: "977872c4-dc01-406e-a233-e260624a3999",
  azulejista: "9ae93e09-def7-4cd8-9d38-41a34fb4d287",
  eletricista: "fb9e7584-bb23-4f56-9c36-6ead6cb9fa52"
}

export const MEDICOES_MAP: Record<string, { id: string; name: string; key: string }> = {
  medicao_01: { id: "68b871d8-318c-4d83-911a-3a4a826f1870", name: "Medição 1", key: "medicao_01" },
  medicao_02: { id: "972c3d02-6f0e-4d33-973a-558e6c3b8bef", name: "Medição 2", key: "medicao_02" },
  medicao_03: { id: "ce001eaf-a191-4579-92d7-1a4b97862adb", name: "Medição 3", key: "medicao_03" },
  medicao_04: { id: "729947c9-ae13-4f98-a589-a33899f8594f", name: "Medição 4", key: "medicao_04" },
  medicao_05: { id: "9b8d8ebf-93ef-4b7b-a2de-a639c57d3dc7", name: "Medição 5", key: "medicao_05" },
}

export const DESPESAS_OBRAS_MAP: Record<string, { id: string; name: string; key: string }> = {
  manutencao: { id: "23264d1e-0936-4682-9d08-098015450f76", name: "MANUNTENÇÃO", key: "manutencao" },
  material: { id: "534610b3-bf0e-49a1-bda5-18b1c6e4cb1d", name: "MATERIAL", key: "material" },
  empreiteiro: { id: "5890a7ee-8714-4433-bed5-c317e6ccfcf0", name: "EMPREITEIRO", key: "empreiteiro" },
  pintor: { id: "886292e3-92ee-4697-8e4a-9a5a371a79e8", name: "PINTOR", key: "pintor" },
  gesseiro: { id: "977872c4-dc01-406e-a233-e260624a3999", name: "GESSEIRO", key: "gesseiro" },
  azulejista: { id: "9ae93e09-def7-4cd8-9d38-41a34fb4d287", name: "AZULEJISTA", key: "azulejista" },
  eletricista: { id: "fb9e7584-bb23-4f56-9c36-6ead6cb9fa52", name: "ELETRICISTA", key: "eletricista" },
}

export const FINANCEIRO_SUBCATEGORIES_MAP: Record<string, string> = {
  entrada: "ce001eaf-a191-4579-92d7-1a4b97862adb",
  subsidio: "68b871d8-318c-4d83-911a-3a4a826f1870",
  valor_financiado: "972c3d02-6f0e-4d33-973a-558e6c3b8bef"
}

export const MONTHS = [
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" }, { value: "3", label: "Abril" },
  { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" }, { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
]