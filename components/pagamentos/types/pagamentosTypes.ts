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

export const FINANCEIRO_SUBCATEGORIES_MAP: Record<string, string> = {
  entrada: "ce001eaf-a191-4579-92d7-1a4b97862adb",
  subsidio: "68b871d8-318c-4d83-911a-3a4a826f1870",
  valor_financiado: "972c3d02-6f0e-4d33-973a-558e6c3b8bef"
}