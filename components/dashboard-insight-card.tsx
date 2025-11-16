"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import gsap from "gsap"

interface DashboardInsightCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: "blue" | "green" | "orange" | "red" | "purple"
  trend?: {
    direction: "up" | "down"
    percentage: number
  }
}

const colorMap = {
  blue: "from-blue-50 to-blue-100/50 text-blue-600",
  green: "from-green-50 to-green-100/50 text-green-600",
  orange: "from-orange-50 to-orange-100/50 text-orange-600",
  red: "from-red-50 to-red-100/50 text-red-600",
  purple: "from-purple-50 to-purple-100/50 text-purple-600",
}

export function DashboardInsightCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}: DashboardInsightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const valueElement = valueRef.current
    if (!card || !valueElement) return

    // Animação de entrada
    gsap.from(card, {
      duration: 0.6,
      y: 20,
      opacity: 0,
      ease: "back.out"
    })

    // Animação do número - contador
    if (typeof value === "number") {
      gsap.from(valueElement, {
        duration: 1,
        textContent: 0,
        snap: { textContent: 1 },
        ease: "power1.out"
      })
    }

    // Hover com GSAP
    const handleMouseEnter = () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1.05,
        y: -8,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1,
        y: 0,
        ease: "power2.out"
      })
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [value])

  return (
    <div ref={cardRef}>
      <Card className={`border-0 shadow-lg bg-gradient-to-br ${colorMap[color]} hover:shadow-xl transition-shadow cursor-default`}>
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase">
              {title}
            </CardTitle>
            <div className="text-xl sm:text-2xl">{icon}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold" ref={valueRef}>
            {value}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center justify-between">
            <span>{subtitle}</span>
            {trend && (
              <span className={`font-bold ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
