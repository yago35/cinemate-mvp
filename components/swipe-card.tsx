"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, BadgeCheck, Film, Users, Clapperboard, Star } from "lucide-react"
import type { Profile } from "@/lib/profiles"
import { StarRating } from "@/components/star-rating"
import { FilmDetailModal } from "@/components/film-detail-modal"
import { cn } from "@/lib/utils"

import { useAppStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"

export function SwipeCard({
  profile,
  matchScore,
  overlay,
  onSuperLike,
}: {
  profile: Profile
  matchScore: number
  overlay?: "like" | "nope" | null
  onSuperLike?: () => void
}) {
  const [selectedFilm, setSelectedFilm] = useState<{title: string; year: number; poster: string; rating: number} | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const { t } = useTranslation()

  const userPhotos = useAppStore((state) => state.userPhotos)

  const photos = profile.photos && profile.photos.length > 0 ? [...profile.photos] : [profile.photo]
  if (userPhotos && userPhotos.length > 0) {
    photos[0] = userPhotos[0]
  }

  const currentPhoto = photos[photoIndex]

  const handlePhotoClick = (e: React.MouseEvent, dir: "next" | "prev") => {
    e.stopPropagation()
    if (dir === "next" && photoIndex < photos.length - 1) {
      setPhotoIndex(i => i + 1)
    } else if (dir === "prev" && photoIndex > 0) {
      setPhotoIndex(i => i - 1)
    }
  }

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden rounded-3xl border border-border bg-card shadow-2xl select-none scrollbar-hide">
      
      {/* Hero Section (Takes up full initial viewport) */}
      <div className="relative h-full w-full shrink-0">
        {/* Photo Navigation Overlay */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/2 h-[70%]" onClick={(e) => handlePhotoClick(e, "prev")} />
          <div className="w-1/2 h-[70%]" onClick={(e) => handlePhotoClick(e, "next")} />
        </div>

        {/* Photo Navigation Indicators */}
        {photos.length > 1 && (
          <div className="absolute top-2 inset-x-2 z-20 flex gap-1">
            {photos.map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full bg-white transition-opacity", i === photoIndex ? "opacity-100" : "opacity-30")} />
            ))}
          </div>
        )}

        {/* Photo */}
        <Image
          src={currentPhoto || "/placeholder.svg"}
          alt={`${profile.name}'s profile photo`}
          fill
          priority
          draggable={false}
          sizes="(max-width: 480px) 100vw, 420px"
          className="object-cover object-top"
        />

        {/* Cinematic gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 via-35% to-transparent pointer-events-none z-0" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/70 to-transparent pointer-events-none z-0" />

        {/* LIKE / NOPE stamps */}
        <div
          className={cn(
            "absolute left-5 top-6 -rotate-12 rounded-md border-4 border-rate-green px-3 py-1 text-2xl font-extrabold tracking-widest text-rate-green transition-opacity duration-100",
            overlay === "like" ? "opacity-100" : "opacity-0",
          )}
        >
          LIKE
        </div>
        <div
          className={cn(
            "absolute right-5 top-6 rotate-12 rounded-md border-4 border-destructive px-3 py-1 text-2xl font-extrabold tracking-widest text-destructive transition-opacity duration-100",
            overlay === "nope" ? "opacity-100" : "opacity-0",
          )}
        >
          NOPE
        </div>

        {/* Top chips */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md">
            <Clapperboard className="size-3.5 text-rate-orange" />
            {t("home.watching")} {profile.nowWatching}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {matchScore}% {t("home.taste_match")}
          </span>
        </div>

        {/* Bottom content overlay on Hero */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between items-end p-5 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-pretty text-3xl font-bold leading-none text-foreground">
                {profile.name}
                <span className="ml-2 text-2xl font-light text-muted-foreground">
                  {profile.age}
                </span>
              </h2>
              <BadgeCheck className="size-5 text-rate-blue" aria-label="Verified" />
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {profile.location}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1.5">
                <Film className="size-3.5 text-rate-green" />
                <span className="font-semibold text-foreground">
                  {profile.filmsLogged.toLocaleString()}
                </span>
                {t("home.films")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-rate-orange" />
                <span className="font-semibold text-foreground">
                  {profile.followers}
                </span>
                {t("home.followers")}
              </span>
            </div>
          </div>

          {onSuperLike && (
            <button 
              onClick={(e) => { e.stopPropagation(); onSuperLike(); }}
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rate-blue to-blue-400 text-white shadow-[0_0_25px_rgba(0,192,255,0.4)] border border-white/20 transition-transform hover:scale-110 active:scale-95 mb-2 mr-1 z-50 pointer-events-auto"
            >
              <Star className="size-7" fill="currentColor" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Scrollable Content */}
      <div className="flex flex-col gap-6 p-5 bg-card">
        {/* Bio */}
        <p className="text-pretty text-sm leading-relaxed text-foreground/90">
          {profile.bio}
        </p>

        {/* Favorite films */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("home.four_favorites")}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {profile.favorites.map((film) => (
              <div key={film.title} className="flex flex-col gap-1.5">
                <div 
                  className="relative aspect-[2/3] overflow-hidden rounded-md border border-border cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  onClick={() => setSelectedFilm(film)}
                >
                  <Image
                    src={film.poster || "/placeholder.svg"}
                    alt={`${film.title} poster`}
                    fill
                    draggable={false}
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
                <StarRating value={film.rating} size={9} className="justify-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("home.top_genres")}
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.topGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Photos and Prompts */}
        {(photos.length > 1 || (profile.prompts && profile.prompts.length > 0)) && (
          <div className="flex flex-col gap-4 w-full">
            {photos.slice(1).map((photo, i) => (
              <div key={`photo-${i}`} className="flex flex-col gap-4">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                  <Image src={photo} alt={`Photo ${i + 2}`} fill className="object-cover" />
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

      <FilmDetailModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </div>
  )
}
