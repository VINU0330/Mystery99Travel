import type React from "react"
import { cn } from "@/lib/utils"

interface CardContainerProps {
  children: React.ReactNode
  className?: string
}

export function CardContainer({ children, className }: CardContainerProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8",
        className,
      )}
    >
      {children}
    </div>
  )
}
