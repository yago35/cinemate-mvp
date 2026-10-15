"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, MapPin, Film, Users, List, Star, Settings, Pencil, Heart, Calendar, BadgeCheck } from "lucide-react"
import { USER_PROFILE } from "@/lib/user"
import { useAppStore } from "@/lib/store"
import { StarRating } from "@/components/star-rating"
import { FilmDetailModal } from "@/components/film-detail-modal"
import { TmdbSearchModal } from "@/components/tmdb-search-modal"
import { FILM_DETAILS } from "@/lib/film-details"
import { useTranslation } from "@/lib/i18n"

function ProfileFavoriteCard({ film, idx, onClick, onEdit }: { film: any, idx: number, onClick: () => void, onEdit: () => void }) {
  const [poster, setPoster] = useState(film?.poster || "")
  const updateFilmPoster = useAppStore(state => state.updateFilmPoster)
  
  const title = film?.title || ""
  const cleanTitle = title ? title.replace(/\s*\(\d{4}\)$/, '') : ""

  useEffect(() => {
    if (film?.poster && film.poster !== poster) {
      setPoster(film.poster)
    } else if (!poster && cleanTitle) {
      const localPoster = FILM_DETAILS[title]?.poster || FILM_DETAILS[cleanTitle]?.poster
      
      if (localPoster) {
        setPoster(localPoster)
        updateFilmPoster(title, localPoster)
      } else {
        fetch(`/api/tmdb?query=${encodeURIComponent(cleanTitle)}`)
          .then(r => r.json())
          .then(data => {
            if (data.results && data.results[0] && data.results[0].poster) {
              setPoster(data.results[0].poster)
              updateFilmPoster(title, data.results[0].poster)
            }
          }).catch(() => {})
      }
    }
  }, [film?.poster, title, cleanTitle, poster, updateFilmPoster])

  return (
    <div className="flex flex-col gap-1 relative group">
      <div 
        className="relative shrink-0 rounded-md border border-border cursor-pointer hover:scale-105 transition-transform bg-secondary overflow-hidden"
        onClick={onClick}
        style={{ width: "72px", height: "108px" }}
      >
        <div className="absolute inset-0 w-full h-full">
          {poster ? (
            <Image
              src={poster}
              alt={`${cleanTitle || title} poster`}
              fill
              sizes="100px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-1 text-[9px] font-medium text-foreground text-center break-words leading-tight bg-secondary">
              {cleanTitle || title || "Film"}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit overlay */}
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        aria-label="Edit favorite film"
        className="absolute -top-2 -right-2 bg-card border border-border rounded-full p-1.5 shadow-md opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 hover:bg-secondary hover:text-rate-green cursor-pointer"
      >
        <Pencil className="size-3" />
      </button>

      <StarRating value={film?.rating || 5} size={9} className="justify-center mt-1" />
      <span className="text-[9px] text-muted-foreground text-center line-clamp-2 leading-tight px-0.5 mt-0.5">
        {cleanTitle || title}
      </span>
    </div>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const [selectedFilm, setSelectedFilm] = useState<{title: string; year: number; poster: string; rating: number} | null>(null)
  const [editingFavoriteIndex, setEditingFavoriteIndex] = useState<number | null>(null)
  
  const letterboxdUsername = useAppStore(state => state.letterboxdUsername)
  const avatarUrl = useAppStore(state => state.avatarUrl)
  const userFilms = useAppStore(state => state.userFilms)
  const totalLoggedFilms = useAppStore(state => state.totalLoggedFilms)
  const totalLikes = useAppStore(state => state.totalLikes)
  const selectedFavorites = useAppStore(state => state.selectedFavorites)
  const userPhotos = useAppStore(state => state.userPhotos)
  const userPrompts = useAppStore(state => state.userPrompts) || USER_PROFILE.prompts
  const setSelectedFavorites = useAppStore(state => state.setSelectedFavorites)
  const profileName = useAppStore(state => state.profileName)
  const profileAge = useAppStore(state => state.profileAge)
  const profileLocation = useAppStore(state => state.profileLocation)
  const userBio = useAppStore(state => state.userBio)

  useEffect(() => {
    if (letterboxdUsername && totalLoggedFilms === 0) {
      fetch(`/api/letterboxd/stats?username=${encodeURIComponent(letterboxdUsername)}`)
        .then(r => r.json())
        .then(data => {
          if (data.totalLoggedFilms || data.totalLikes) {
            useAppStore.setState({ 
              totalLoggedFilms: data.totalLoggedFilms || 0,
              totalLikes: data.totalLikes || 0
            })
          }
        })
        .catch(() => {})
    }
  }, [letterboxdUsername, totalLoggedFilms])

  const defaultFavs = USER_PROFILE.favorites
  const displayFavorites = [0, 1, 2, 3].map(idx => {
    const title = (selectedFavorites && selectedFavorites[idx]) || defaultFavs[idx]?.title || ""
    const existingFilm = userFilms.find(f => f.title === title)
    if (existingFilm) return existingFilm
    const defaultFilm = defaultFavs.find(f => f.title === title)
    if (defaultFilm) return defaultFilm
    return { title, poster: "", rating: 5, year: 2024 }
  })

  const displayName = profileName || letterboxdUsername || USER_PROFILE.name
  const displayAge = profileAge || USER_PROFILE.age
  const displayLocation = profileLocation || USER_PROFILE.location
  const displayBio = userBio || USER_PROFILE.bio
  const displayAvatar = avatarUrl || (userPhotos && userPhotos.length > 0 ? userPhotos[0] : null)
  const displayFilmsCount = totalLoggedFilms > 0 ? totalLoggedFilms : USER_PROFILE.filmsLogged

  return (
    <>
      <main className="relative flex min-h-dvh flex-col items-center bg-background">
        {/* Ambient cinematic glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        />

        <div className="relative flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5 pb-24">
          {/* Hero section */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="size-28 rounded-full bg-gradient-to-br from-rate-green via-rate-orange to-rate-blue p-[3px] overflow-hidden shadow-lg">
                <div className="relative flex size-full items-center justify-center rounded-full bg-card overflow-hidden">
                  {displayAvatar ? (
                    <Image src={displayAvatar} alt={displayName} fill className="object-cover" />
                  ) : (
                    <User className="size-12 text-muted-foreground" />
                  )}
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 bg-card border border-border rounded-full p-2 shadow-md text-foreground hover:bg-secondary hover:text-rate-green transition-colors"
                title={t("profile.edit_profile")}
              >
                <Pencil className="size-3.5" />
              </Link>
            </div>

            {/* Name + age */}
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center">
              <span>{displayName}</span>
              {displayAge ? (
                <span className="ml-2 font-light text-muted-foreground">
                  {displayAge}
                </span>
              ) : null}
            </h1>

            {/* Location */}
            {displayLocation && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                <span>{displayLocation}</span>
              </div>
            )}

            {/* Bio */}
            {displayBio && (
              <p className="max-w-xs text-center text-sm leading-relaxed text-foreground/80">
                {displayBio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col items-center gap-0.5">
              <Film className="size-5 text-rate-green mb-1" />
              <span className="text-2xl font-bold text-foreground">
                {displayFilmsCount.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("home.films_logged")}
              </span>
            </div>
          </div>

          {/* Four Favorites */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("profile.four_favorites")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {displayFavorites.slice(0, 4).map((film, idx) => (
                <ProfileFavoriteCard 
                  key={idx}
                  film={film}
                  idx={idx}
                  onClick={() => setSelectedFilm({ title: film.title, poster: film.poster, year: (film as any).year || 2024, rating: film.rating || 0 })}
                  onEdit={() => setEditingFavoriteIndex(idx)}
                />
              ))}
            </div>
          </div>

          {/* Recently Watched */}
          {userFilms && userFilms.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("profile.recently_watched")}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {userFilms.slice(0, 50).map((film, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col gap-1 relative shrink-0 snap-start"
                    onClick={() => setSelectedFilm({ title: film.title, poster: film.poster, year: (film as any).year || 2024, rating: film.rating || 0 })}
                  >
                    <div 
                      className="relative rounded-md border border-border cursor-pointer hover:scale-105 transition-transform bg-secondary overflow-hidden"
                      style={{ width: "72px", height: "108px" }}
                    >
                      <div className="absolute inset-0 w-full h-full">
                        {film.poster ? (
                          <Image
                            src={film.poster}
                            alt={`${film.title} poster`}
                            fill
                            sizes="100px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-1.5 text-[10px] font-bold text-foreground/80 text-center break-words leading-snug bg-gradient-to-br from-secondary to-background border-t border-white/5 shadow-inner">
                            {film.title}
                          </div>
                        )}
                      </div>
                    </div>
                    {film.rating ? <StarRating value={film.rating} size={9} className="justify-center mt-1" /> : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("home.top_genres")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {USER_PROFILE.topGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* User Photos and Prompts */}
          {(userPhotos && userPhotos.length > 0) || (userPrompts && userPrompts.length > 0) ? (
            <div className="flex flex-col gap-4 w-full pt-4">
              {(userPhotos || []).map((photo, i) => (
                <div key={`photo-${i}`} className="flex flex-col gap-4">
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                    <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                  </div>
                  {/* Render prompt if one exists for this index */}
                  {userPrompts && userPrompts[i] && (
                    <div className="rounded-2xl bg-secondary/50 p-6 border border-border shadow-sm">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {userPrompts[i].question}
                      </p>
                      <p className="text-lg font-medium text-foreground leading-snug">
                        {userPrompts[i].answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {/* Render any remaining prompts */}
              {userPrompts && userPrompts.slice(Math.max(0, userPhotos?.length || 0)).map((prompt, i) => (
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
          ) : null}

          {/* Action buttons */}
          <div className="mt-4 flex w-full flex-col gap-2">
            <Link
              href="/profile/edit"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Pencil className="size-4" />
              {t("profile.edit_profile")}
            </Link>
            <Link
              href="/settings"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
              {t("profile.settings")}
            </Link>
          </div>
        </div>
      </main>
      <FilmDetailModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />

      <TmdbSearchModal
        isOpen={editingFavoriteIndex !== null}
        onClose={() => setEditingFavoriteIndex(null)}
        onSelect={(film) => {
          if (editingFavoriteIndex !== null) {
            const defaultFavTitles = USER_PROFILE.favorites.map(f => f.title)
            const currentFavTitles = [0, 1, 2, 3].map(idx => {
              return (selectedFavorites && selectedFavorites[idx]) || defaultFavTitles[idx] || ""
            })
            currentFavTitles[editingFavoriteIndex] = film.title
            setSelectedFavorites(currentFavTitles)
            useAppStore.setState(state => {
              const exists = state.userFilms.find(f => f.title === film.title)
              if (!exists) {
                return { userFilms: [film, ...state.userFilms] }
              }
              return state
            })
            setEditingFavoriteIndex(null)
          }
        }}
      />
    </>
  )
}
