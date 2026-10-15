"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bookmark, Share2 } from "lucide-react"
import { FILM_DETAILS } from "@/lib/film-details"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n"

type FilmProps = {
  title: string
  year: number
  poster: string
  rating: number
}

export function FilmDetailModal({
  film,
  onClose,
}: {
  film: FilmProps | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [details, setDetails] = useState<{ genres: string[], synopsis: string, director: string, duration: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (film) {
      // Small delay to ensure the modal is in DOM before animating
      requestAnimationFrame(() => setVisible(true))
      
      const title = film?.title || ""
      const cleanTitle = title ? title.replace(/\s*\(\d{4}\)$/, '') : ""
      const localData = FILM_DETAILS[title] || (cleanTitle ? FILM_DETAILS[cleanTitle] : null)
      
      if (localData) {
        setDetails(localData)
        setLoading(false)
        return
      }
      
      // Fetch dynamic details if not in local mock
      setLoading(true)
      setDetails(null)
      fetch(`/api/tmdb/details?title=${encodeURIComponent(film.title)}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error && data.synopsis) {
            setDetails(data)
          } else {
            setDetails({ genres: ["Drama"], synopsis: "No synopsis available.", director: "Unknown", duration: "Unknown" })
          }
        })
        .catch(() => {
          setDetails({ genres: ["Drama"], synopsis: "No synopsis available.", director: "Unknown", duration: "Unknown" })
        })
        .finally(() => setLoading(false))

    } else {
      setVisible(false)
    }
  }, [film])

  if (!film) return null

  const displayDetails = details || {
    genres: ["..."],
    synopsis: "Loading...",
    director: "...",
    duration: "...",
  }

  // Handle closing with animation
  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300) // match the transition duration
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )} 
        onClick={handleClose} 
      />

      {/* Bottom Sheet */}
      <div 
        className={cn(
          "relative z-[91] flex max-h-[85vh] w-full flex-col items-center overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-8 pt-2 shadow-2xl transition-transform duration-300",
          visible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag handle */}
        <div className="mb-6 h-1 w-10 rounded-full bg-muted-foreground/40" />

        {/* Poster */}
        <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl border border-border shadow-2xl">
          <Image
            src={film.poster || "/placeholder.svg"}
            alt={`${film.title} poster`}
            fill
            sizes="192px"
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="mt-6 flex flex-col items-center px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {film.title} <span className="font-light text-muted-foreground">{film.year}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("film.directed_by")} {displayDetails.director}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{displayDetails.duration}</span>
            <span>•</span>
            <span className="flex items-center text-rate-green text-xs">
              {"★".repeat(Math.floor(film.rating))}
              {film.rating % 1 !== 0 && "½"}
            </span>
          </div>

          {/* Genres */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {displayDetails.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="mt-6 text-sm leading-relaxed text-foreground/80">
            {displayDetails.synopsis}
          </p>

          {/* Actions */}
          <div className="mt-8 flex w-full justify-center gap-3">
            <button className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary cursor-pointer">
              <Bookmark className="size-4" />
              {t("film.watchlist")}
            </button>
            <button className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary cursor-pointer">
              <Share2 className="size-4" />
              {t("film.share")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
