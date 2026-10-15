"use client"

import { useState, useEffect } from "react"
import { X, Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { UserFilm } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"

interface TmdbSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (film: UserFilm) => void
}

export function TmdbSearchModal({ isOpen, onClose, onSelect }: TmdbSearchModalProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setResults([])
      setError("")
      return
    }

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      setError("")
      try {
        const res = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setResults(data.results || [])
      } catch (err: any) {
        setError(t("search.failed"))
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [query, isOpen, t])

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] z-[101] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-md mx-auto">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input 
            type="text"
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="size-8 text-rate-green animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-10">{error}</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {results.map((movie) => (
                <div 
                  key={movie.tmdbId} 
                  className="flex flex-col gap-1 cursor-pointer group"
                  onClick={() => onSelect({ title: movie.title, poster: movie.poster, year: movie.year, rating: movie.rating })}
                >
                  <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-secondary border border-border group-hover:border-rate-green transition-colors">
                    {movie.poster ? (
                      <Image src={movie.poster} alt={movie.title} fill sizes="100px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[10px] text-center">
                        {movie.title}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground line-clamp-2 leading-tight px-0.5">
                    {movie.title} {movie.year ? `(${movie.year})` : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center text-muted-foreground mt-10">No movies found.</div>
          ) : (
            <div className="text-center text-muted-foreground mt-10 text-sm">
              Type a movie name to search TMDB.
            </div>
          )}
        </div>
      </div>
    </>
  )
}