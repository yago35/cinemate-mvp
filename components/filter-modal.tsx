"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

export function FilterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const storeMinAge = useAppStore(state => state.minAge)
  const storeMaxAge = useAppStore(state => state.maxAge)
  const storeDistance = useAppStore(state => state.maxDistance)
  const storeMinFilms = useAppStore(state => state.minFilms)
  const storeGenres = useAppStore(state => state.preferredGenres)
  const setDiscoverySettings = useAppStore(state => state.setDiscoverySettings)

  const [visible, setVisible] = useState(false)
  const [ageMin, setAgeMin] = useState(storeMinAge)
  const [ageMax, setAgeMax] = useState(storeMaxAge)
  const [distance, setDistance] = useState(storeDistance)
  const [minFilms, setMinFilms] = useState(storeMinFilms)
  
  const allGenres = [
    "Drama", "Comedy", "Thriller", "Sci-fi", "Romance", 
    "Horror", "Documentary", "Animation", "Neo-noir", "Arthouse"
  ]
  const [selectedGenres, setSelectedGenres] = useState<string[]>(storeGenres || allGenres)

  // Sync when opened
  useEffect(() => {
    if (isOpen) {
      setAgeMin(storeMinAge)
      setAgeMax(storeMaxAge)
      setDistance(storeDistance)
      setMinFilms(storeMinFilms)
      setSelectedGenres(storeGenres || allGenres)
    }
  }, [isOpen, storeMinAge, storeMaxAge, storeDistance, storeMinFilms, storeGenres])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen && !visible) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
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
          "relative z-[91] flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl border-t border-border bg-card shadow-2xl transition-transform duration-300",
          visible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-6 py-4 backdrop-blur-md">
          <h2 className="text-xl font-bold">Preferences</h2>
          <button 
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Age */}
          <div className="mb-6 border-b border-border pb-6">
            <div className="mb-4 flex items-center justify-between">
              <label className="font-medium">Age</label>
              <span className="text-sm text-muted-foreground">{ageMin} - {ageMax}</span>
            </div>
            <div className="relative h-6 w-full">
              <input 
                type="range" min="18" max="50" 
                value={ageMin} 
                onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 1))}
                className="pointer-events-none absolute w-full appearance-none bg-transparent accent-rate-green [&::-webkit-slider-thumb]:pointer-events-auto"
                style={{ accentColor: "var(--rate-green)" }}
              />
              <input 
                type="range" min="18" max="50" 
                value={ageMax} 
                onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 1))}
                className="pointer-events-none absolute w-full appearance-none bg-transparent accent-rate-green [&::-webkit-slider-thumb]:pointer-events-auto"
                style={{ accentColor: "var(--rate-green)" }}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="mb-6 border-b border-border pb-6">
            <div className="mb-4 flex items-center justify-between">
              <label className="font-medium">Distance</label>
              <span className="text-sm text-muted-foreground">{distance} km</span>
            </div>
            <input 
              type="range" min="1" max="100" 
              value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-rate-green"
              style={{ accentColor: "var(--rate-green)" }}
            />
          </div>

          {/* Minimum Films */}
          <div className="mb-6 border-b border-border pb-6">
            <div className="mb-4 flex items-center justify-between">
              <label className="font-medium">Minimum films logged</label>
              <span className="text-sm text-muted-foreground">{minFilms}</span>
            </div>
            <input 
              type="range" min="0" max="2000" step="50"
              value={minFilms} 
              onChange={(e) => setMinFilms(Number(e.target.value))}
              className="w-full accent-rate-green"
              style={{ accentColor: "var(--rate-green)" }}
            />
          </div>

          {/* Genres */}
          <div className="mb-8">
            <label className="mb-4 block font-medium">Preferred genres</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre)
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "border border-rate-green/40 bg-rate-green/20 text-rate-green"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setDiscoverySettings(distance, ageMin, ageMax, minFilms, selectedGenres)
                handleClose()
              }}
              className="w-full rounded-full bg-rate-green py-3 font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
            <button 
              onClick={() => {
                setAgeMin(21); setAgeMax(35); setDistance(25); setMinFilms(100); setSelectedGenres(allGenres);
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
