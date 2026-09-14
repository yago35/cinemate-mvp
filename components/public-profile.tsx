"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Film, Sparkles } from "lucide-react"
import type { Profile } from "@/lib/profiles"
import { FilmDetailModal } from "@/components/film-detail-modal"
import { FILM_DETAILS } from "@/lib/film-details"

function ProfileFavoriteCard({ film, idx, onClick }: { film: any, idx: number, onClick: () => void }) {
  const [poster, setPoster] = useState(film.poster)
  
  useEffect(() => {
    if (film.poster && film.poster !== poster) {
      setPoster(film.poster)
    } else if (!poster) {
      const cleanTitle = film.title.replace(/\s*\(\d{4}\)$/, '')
      const localPoster = FILM_DETAILS[film.title]?.poster || FILM_DETAILS[cleanTitle]?.poster
      
      if (localPoster) {
        setPoster(localPoster)
      } else {
        fetch(`/api/tmdb?query=${encodeURIComponent(cleanTitle)}`)
          .then(r => r.json())
          .then(data => {
            if (data.results && data.results[0] && data.results[0].poster) {
              setPoster(data.results[0].poster)
            }
          }).catch(() => {})
      }
    }
  }, [film.poster, film.title, poster])

  return (
    <div className="flex flex-col gap-1.5">
      <div 
        className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:scale-105 cursor-pointer"
        onClick={onClick}
      >
        {poster ? (
          <Image src={poster} alt={film.title} fill sizes="(max-width: 480px) 120px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-1 text-[9px] font-medium text-foreground text-center break-words leading-tight bg-secondary">
            {film.title}
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-[9px] font-medium leading-tight text-muted-foreground text-center px-0.5">
        {film.title}
      </p>
    </div>
  )
}

export function PublicProfile({ profile, matchScore }: { profile: Profile, matchScore?: number }) {
  const [selectedFilm, setSelectedFilm] = useState<{ title: string; year: number; poster: string; rating: number } | null>(null)

  const photos = profile.photos && profile.photos.length > 0 ? [...profile.photos] : [profile.photo]

  return (
    <>
      <div className="relative h-full w-full overflow-y-auto overflow-x-hidden rounded-3xl bg-background scrollbar-hide">
        <div className="relative flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 pb-24 mx-auto">
          {/* Hero section */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Avatar */}
            <div className="relative">
              <div className="size-28 rounded-full bg-gradient-to-br from-rate-green via-rate-orange to-rate-blue p-[3px] overflow-hidden">
                <div className="relative flex size-full items-center justify-center rounded-full bg-card overflow-hidden">
                  <Image src={photos[0] || "/placeholder.svg"} alt={profile.name} fill className="object-cover" />
                </div>
              </div>
              {matchScore && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-rate-green shadow-xl flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {matchScore}% Match
                </div>
              )}
            </div>

            {/* Name + age */}
            <h1 className="mt-2 text-2xl font-bold text-foreground">
              {profile.name}
              <span className="ml-2 font-light text-muted-foreground">
                {profile.age}
              </span>
            </h1>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {profile.location}
            </div>

            {/* Bio */}
            <p className="max-w-xs text-center text-sm leading-relaxed text-foreground/80">
              {profile.bio}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col items-center gap-0.5">
              <Film className="size-5 text-rate-green mb-1" />
              <span className="text-2xl font-bold text-foreground">
                {profile.filmsLogged.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Films Logged
              </span>
            </div>
          </div>

          {/* Four Favorites */}
          {profile.favorites && profile.favorites.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Four favorites
              </p>
              <div className="grid grid-cols-4 gap-2">
                {profile.favorites.slice(0, 4).map((film, idx) => (
                  <ProfileFavoriteCard 
                    key={idx}
                    film={film}
                    idx={idx}
                    onClick={() => setSelectedFilm({ title: film.title, poster: film.poster, year: film.year || 2024, rating: film.rating || 0 })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {profile.topGenres && profile.topGenres.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Top genres
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.topGenres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photos and Prompts */}
          {(photos.length > 1 || (profile.prompts && profile.prompts.length > 0)) && (
            <div className="flex flex-col gap-4 w-full pt-4">
              {photos.slice(1).map((photo, i) => (
                <div key={`photo-${i}`} className="flex flex-col gap-4">
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                    <Image src={photo} alt={`${profile.name}'s photo ${i + 2}`} fill className="object-cover" />
                  </div>
                  {/* Render prompt if one exists for this index */}
                  {profile.prompts && profile.prompts[i] && (
                    <div className="rounded-2xl bg-secondary/50 p-6 border border-border shadow-sm">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {profile.prompts[i].question}
                      </p>
                      <p className="text-lg font-medium text-foreground leading-snug">
                        {profile.prompts[i].answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {/* If there are more prompts than extra photos, render the remaining prompts */}
              {profile.prompts && profile.prompts.slice(Math.max(0, photos.length - 1)).map((prompt, i) => (
                <div key={`prompt-extra-${i}`} className="rounded-2xl bg-secondary/50 p-6 border border-border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {prompt.question}
                  </p>
                  <p className="text-lg font-medium text-foreground leading-snug">
                    {prompt.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <FilmDetailModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </>
  )
}
