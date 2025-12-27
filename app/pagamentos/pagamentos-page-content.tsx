"use client"

import { useEffect } from "react"
import { Pagamentos } from "@/lib/types"

interface PagamentoPageContentProps {
  pagamentos: Pagamentos[],
  userPermissions: Record<string, any>
}

export default function PagamentoPageContent({userPermissions, pagamentos}: PagamentoPageContentProps) {
 
  useEffect(() => {
    console.log("PAYLOAD RECEIVED:", pagamentos);
  }, [pagamentos]);

  return (
    <div>Oi</div>
  )
}