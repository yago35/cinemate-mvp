import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  value,
  className,
  size = 12,
}: {
  value: number
  className?: string
  size?: number
}) {
  const full = Math.floor(value)
  const hasHalf = value - full >= 0.5

  return (
    <span
      className={cn("inline-flex items-center text-rate-green", className)}
      aria-label={`Rated ${value} out of 5 stars`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} width={size} height={size} className="fill-current" />
      ))}
      {hasHalf && (
        <StarHalf width={size} height={size} className="fill-current" />
      )}
    </span>
  )
}
