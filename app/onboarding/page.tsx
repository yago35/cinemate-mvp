"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Clapperboard, CheckCircle2, Sparkles, Camera, Plus, Loader2, MapPin, Check } from "lucide-react"
import { FILMS } from "@/lib/profiles"
import { useAppStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { LogoIcon } from "@/components/logo"
import { LegalModal, type LegalTab } from "@/components/legal-modal"
import { useTranslation } from "@/lib/i18n"

function FilmCard({ film, isSelected, onClick }: { film: any, isSelected: boolean, onClick: () => void }) {
  const [posterUrl, setPosterUrl] = useState(film.poster)
  const updateFilmPoster = useAppStore(state => state.updateFilmPoster)

  useEffect(() => {
    if (film.poster && film.poster !== posterUrl) {
      setPosterUrl(film.poster)
    } else if (!posterUrl && film.link) {
      // Lazy load missing poster
      fetch(`/api/letterboxd/poster?link=${film.link}`)
        .then(r => r.json())
        .then(data => {
          if (data.poster) {
            setPosterUrl(data.poster)
            updateFilmPoster(film.title, data.poster)
          }
        })
        .catch(() => {})
    }
  }, [posterUrl, film.link, film.title, film.poster, updateFilmPoster])

  return (
    <div className="flex flex-col items-center gap-1.5 w-[76px] shrink-0" onClick={onClick}>
      <div 
        className={cn(
          "relative w-full rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-secondary",
          isSelected ? "border-rate-green scale-105 z-10" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
        )}
        style={{ height: "114px" }}
      >
        <div className="absolute inset-0 w-full h-full">
          {posterUrl ? (
            <Image 
              src={posterUrl} 
              alt={film.title} 
              fill 
              sizes="100px" 
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-1 text-[10px] font-medium text-foreground text-center break-words leading-tight bg-secondary">
              {film.title}
            </div>
          )}
          
          {isSelected && (
            <div className="absolute inset-0 bg-rate-green/20 flex items-center justify-center pointer-events-none">
              <CheckCircle2 className="size-8 text-rate-green bg-background rounded-full" />
            </div>
          )}
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground text-center line-clamp-2 leading-tight px-1 font-medium">
        {film.title.replace(/\s\(\d{4}\)$/, '')}
      </span>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const setUserData = useAppStore(state => state.setUserData)
  const setSelectedFavorites = useAppStore(state => state.setSelectedFavorites)
  const userFilmsStore = useAppStore(state => state.userFilms)
  
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalTab, setLegalTab] = useState<LegalTab>("terms")
  const [termsAccepted, setTermsAccepted] = useState(false)

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab)
    setLegalOpen(true)
  }
  
  const [photos, setPhotos] = useState<string[]>([])
  const [selectedFilms, setSelectedFilms] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [profileName, setProfileName] = useState("")
  const [profileAge, setProfileAge] = useState("")
  const [profileLocation, setProfileLocation] = useState("")
  const [gender, setGender] = useState("man")
  const [interestedIn, setInterestedIn] = useState("women")
  
  const setBasicInfo = useAppStore(state => state.setBasicInfo)

  const defaultFilmEntries = Object.entries(FILMS).map(([key, f]) => ({ title: f.title, poster: f.poster }))
  const displayFilms = userFilmsStore.filter(f => !defaultFilmEntries.some(dummy => dummy.title === f.title))

  const allGenres = [
    "Drama", "Comedy", "Thriller", "Sci-fi", "Romance", 
    "Horror", "Documentary", "Animation", "Neo-noir", 
    "Arthouse", "New Wave", "Coming-of-age"
  ]

  const setUserPhotos = useAppStore(state => state.setUserPhotos)

  const handleFinish = async () => {
    if (photos.length > 0) {
      setUserPhotos(photos.filter(Boolean))
    }
    setBasicInfo(profileName, profileAge, profileLocation, gender, interestedIn)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          name: profileName,
          age: parseInt(profileAge),
          location: profileLocation,
          gender: gender,
          interested_in: interestedIn,
          bio: "Write a short bio about your film taste...",
        })
        
        if (photos.length > 0) {
          const photoInserts = photos.filter(Boolean).map((url, index) => ({
            profile_id: session.user.id,
            photo_url: url,
            sort_order: index
          }))
          await supabase.from("user_photos").insert(photoInserts)
        }
      }
    } catch (e) {
      console.error("Failed to save profile to Supabase:", e)
    }

    localStorage.setItem("reelmate-onboarded", "true")
    router.push("/")
  }

  const addPhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos[index] = `https://picsum.photos/seed/${index + Date.now()}/400/600`
    setPhotos(newPhotos.filter(Boolean))
  }

  const [totalLoggedFilms, setTotalLoggedFilms] = useState<number>(0)

  const handleConnect = async () => {
    if (!username.trim()) return
    setIsFetching(true)
    setFetchError("")
    try {
      const res = await fetch(`/api/letterboxd?username=${encodeURIComponent(username.trim())}`)
      if (!res.ok) {
        throw new Error("Failed to fetch")
      }
      const data = await res.json()
      if (data.films && data.films.length > 0) {
        setUserData(data.username, data.avatarUrl || null, data.films, data.totalLoggedFilms, data.totalLikes)
        if (data.totalLoggedFilms) setTotalLoggedFilms(data.totalLoggedFilms)
        setStep(2)
      } else {
        setFetchError("No films found for this user.")
      }
    } catch (err) {
      setFetchError("Could not find user or error occurred.")
    } finally {
      setIsFetching(false)
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.state || "Unknown"
          const country = data.address.country_code ? data.address.country_code.toUpperCase() : ""
          setProfileLocation(`${city}${country ? `, ${country}` : ""}`)
        } catch (err) {
          setProfileLocation("Istanbul, TR")
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        alert("Please allow location access to use this feature.")
        setIsLocating(false)
      }
    )
  }

  const toggleFilm = (title: string) => {
    if (selectedFilms.includes(title)) {
      setSelectedFilms(selectedFilms.filter(f => f !== title))
    } else if (selectedFilms.length < 4) {
      setSelectedFilms([...selectedFilms, title])
    }
  }

  const handleFavoritesContinue = () => {
    setSelectedFavorites(selectedFilms)
    setStep(5)
  }

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center bg-background overflow-hidden">
      {/* Progress Dots */}
      {step > 0 && step < 6 && (
        <div className="absolute top-8 z-50 flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 w-10 rounded-full transition-colors duration-500",
                step >= s ? "bg-rate-green" : "bg-secondary"
              )}
            />
          ))}
        </div>
      )}

      {/* Step 0: Welcome */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-700", step === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none")}>
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <div className="grid grid-cols-3 gap-4 -rotate-12 scale-150 transform">
            {defaultFilmEntries.concat(defaultFilmEntries).map((film, i) => (
              <div key={i} className="relative aspect-[2/3] w-40 rounded-xl overflow-hidden">
                <Image src={film.poster || "/placeholder.svg"} alt={film.title} fill sizes="(max-width: 480px) 160px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-background/90" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="flex justify-center mb-6 drop-shadow-xl animate-pulse">
            <LogoIcon className="size-20" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Cine<span className="text-muted-foreground">mate</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-12">{t("onboarding.tagline")}</p>
          
          {/* Tik Atmalı Onay Kutusu */}
          <div 
            onClick={() => setTermsAccepted(!termsAccepted)}
            className={cn(
              "mb-5 flex items-start gap-2.5 max-w-xs text-left cursor-pointer rounded-2xl border p-3 transition-all select-none backdrop-blur-sm",
              termsAccepted 
                ? "border-rate-green/60 bg-rate-green/10" 
                : "border-border/80 bg-secondary/30 hover:border-border"
            )}
          >
            <div className={cn(
              "size-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all",
              termsAccepted 
                ? "bg-rate-green border-rate-green text-background" 
                : "border-muted-foreground/50 bg-card hover:border-rate-green"
            )}>
              {termsAccepted && <Check className="size-3 stroke-[3]" />}
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              {t("auth.agree_terms")}{" "}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openLegal("terms"); }}
                className="font-medium text-foreground underline underline-offset-2 hover:text-rate-green cursor-pointer"
              >
                {t("auth.terms_of_service")}
              </button>{" "}
              {t("auth.and")}{" "}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openLegal("privacy"); }}
                className="font-medium text-foreground underline underline-offset-2 hover:text-rate-green cursor-pointer"
              >
                {t("auth.privacy_policy")}
              </button>
              .
            </p>
          </div>

          <button 
            onClick={() => {
              if (!termsAccepted) {
                alert(t("auth.terms_error"))
                return
              }
              setStep(1)
            }}
            disabled={!termsAccepted}
            className="rounded-full bg-rate-green px-12 py-4 text-lg font-semibold text-background hover:opacity-90 transition-opacity mb-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rate-green/20"
          >
            {t("onboarding.get_started")}
          </button>
          
          <span className="text-[10px] text-muted-foreground/60 max-w-xs">
            {t("auth.disclaimer_text")}
          </span>
        </div>
      </div>

      {/* Step 1: Letterboxd */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-700", step === 1 ? "opacity-100 translate-x-0" : step > 1 ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center">
          <LogoIcon className="size-16 mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.link_letterboxd")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("onboarding.import_history")}</p>
          
          <input 
            type="text" 
            placeholder={t("onboarding.username_placeholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isFetching}
            className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green mb-2 disabled:opacity-50"
          />
          {fetchError && <p className="text-destructive text-sm w-full text-left mb-4 px-2">{fetchError}</p>}
          
          <div className="w-full mb-6 rounded-xl bg-rate-orange/10 border border-rate-orange/20 p-3 text-left">
            <p className="text-xs text-rate-orange/90 flex items-start gap-2 leading-relaxed">
              <span className="text-sm">ℹ️</span>
              {t("onboarding.sync_limit_info")}
            </p>
          </div>
          
          <button 
            onClick={handleConnect}
            disabled={isFetching || !username}
            className="w-full flex justify-center items-center gap-2 rounded-full bg-rate-green py-3.5 font-semibold text-background hover:opacity-90 transition-opacity mb-4 disabled:opacity-50 cursor-pointer"
          >
            {isFetching ? <Loader2 className="size-5 animate-spin" /> : t("onboarding.connect_btn")}
          </button>
          
          <button onClick={() => setStep(2)} disabled={isFetching} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer">
            {t("onboarding.skip")}
          </button>

          <div className="mt-8 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={() => openLegal("privacy")}
              className="hover:text-rate-green transition-colors cursor-pointer"
            >
              {t("auth.privacy_policy")}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegal("terms")}
              className="hover:text-rate-green transition-colors cursor-pointer"
            >
              {t("auth.terms_of_service")}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Basic Info */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-start pt-24 p-6 transition-all duration-700", step === 2 ? "opacity-100 translate-x-0" : step > 2 ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center text-center h-full">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.basic_info")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("onboarding.basic_info_subtitle")}</p>
          
          <div className="flex flex-col gap-4 w-full mb-8 text-left">
            <div>
              <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">{t("profile.name")}</label>
              <input 
                type="text" 
                placeholder="e.g. Maya"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">{t("profile.age")}</label>
                <input 
                  type="number" 
                  placeholder="24"
                  value={profileAge}
                  onChange={(e) => setProfileAge(e.target.value)}
                  className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
                  min="18"
                />
              </div>
              <div className="flex-1 relative">
                <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">{t("profile.location")}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. Istanbul, TR"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full rounded-full border border-border bg-card pl-5 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
                  />
                  <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-rate-green transition-colors disabled:opacity-50"
                    title="Get Current Location"
                  >
                    {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            {profileAge && parseInt(profileAge) < 18 && (
              <p className="text-destructive text-sm text-center -mt-2">{t("onboarding.age_warning")}</p>
            )}

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">{t("profile.gender")}</label>
                <div className="flex bg-card rounded-full p-1 border border-border">
                  {["man", "woman", "other"].map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn("flex-1 text-xs py-2 rounded-full font-medium capitalize transition-colors", gender === g ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground")}
                    >
                      {t(`profile.${g}` as any)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">{t("profile.interested_in")}</label>
                <div className="flex bg-card rounded-full p-1 border border-border">
                  {["men", "women", "everyone"].map(i => (
                    <button
                      key={i}
                      onClick={() => setInterestedIn(i)}
                      className={cn("flex-1 text-xs py-2 rounded-full font-medium capitalize transition-colors", interestedIn === i ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground")}
                    >
                      {t(`profile.${i}` as any)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-auto w-full pb-8">
            <button 
              onClick={() => setStep(3)}
              disabled={!profileName.trim() || !profileAge || parseInt(profileAge) < 18 || !profileLocation.trim()}
              className={cn("w-full rounded-full py-3.5 font-semibold transition-all cursor-pointer", (profileName.trim() && profileAge && parseInt(profileAge) >= 18 && profileLocation.trim()) ? "bg-rate-green text-background hover:opacity-90" : "bg-secondary text-muted-foreground opacity-40")}
            >
              {t("onboarding.continue")}
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Photos */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-start pt-24 p-6 transition-all duration-700", step === 3 ? "opacity-100 translate-x-0" : step > 3 ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center text-center h-full">
          <Camera className="size-12 text-rate-blue mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.add_photos")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("onboarding.add_photos_desc")}</p>
          
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                onClick={() => addPhoto(i)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border bg-card hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center group"
              >
                {photos[i] ? (
                  <Image src={photos[i]} alt={`Photo ${i + 1}`} fill className="object-cover" />
                ) : (
                  <Plus className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-auto w-full pb-8">
            <button 
              onClick={() => setStep(4)}
              disabled={photos.length < 2}
              className={cn("w-full rounded-full py-3.5 font-semibold transition-all cursor-pointer", photos.length >= 2 ? "bg-rate-green text-background hover:opacity-90" : "bg-secondary text-muted-foreground opacity-40")}
            >
              {t("onboarding.continue")}
            </button>
          </div>
        </div>
      </div>

      {/* Step 4: Pick 4 */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-start pt-24 p-6 transition-all duration-700", step === 4 ? "opacity-100 translate-x-0" : step > 4 ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center text-center h-full">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.pick_favorites")}</h2>
          <div className="text-muted-foreground mb-6 text-sm flex flex-col gap-1">
            {userFilmsStore.length > 0 ? (
              <>
                <span>We pulled {displayFilms.length} of your {totalLoggedFilms > 0 ? totalLoggedFilms : displayFilms.length} films.</span>
                <span className="text-[11px] opacity-80">Don't see your favorite? You can add it manually using TMDB from your Profile later.</span>
              </>
            ) : t("onboarding.favorites_desc")}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 w-full mb-8 max-h-[50vh] overflow-y-auto pb-4 pr-1">
            {displayFilms.map((film, idx) => (
              <FilmCard 
                key={idx}
                film={film}
                isSelected={selectedFilms.includes(film.title)}
                onClick={() => toggleFilm(film.title)}
              />
            ))}
          </div>
          
          <div className="mt-auto w-full pb-8 pt-4 bg-gradient-to-t from-background via-background">
            <p className="text-sm text-muted-foreground mb-4">{selectedFilms.length}/4 {t("onboarding.selected")}</p>
            <button 
              onClick={handleFavoritesContinue}
              disabled={selectedFilms.length < 4}
              className={cn("w-full rounded-full py-3.5 font-semibold transition-all cursor-pointer", selectedFilms.length === 4 ? "bg-rate-green text-background hover:opacity-90" : "bg-secondary text-muted-foreground opacity-40")}
            >
              {t("onboarding.continue")}
            </button>
          </div>
        </div>
      </div>

      {/* Step 5: Genres */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-start pt-24 p-6 transition-all duration-700", step === 5 ? "opacity-100 translate-x-0" : step > 5 ? "opacity-0 -translate-x-full pointer-events-none" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center text-center h-full">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.pick_genres")}</h2>
          <p className="text-muted-foreground mb-8 text-sm">{t("onboarding.pick_genres_desc")}</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {allGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                    isSelected 
                      ? "bg-rate-green/20 text-rate-green border border-rate-green/40" 
                      : "bg-card text-muted-foreground border border-border hover:text-foreground"
                  )}
                >
                  {genre}
                </button>
              )
            })}
          </div>
          
          <div className="mt-auto w-full pb-8">
            <button 
              onClick={() => setStep(6)}
              disabled={selectedGenres.length < 3}
              className={cn("w-full rounded-full py-3.5 font-semibold transition-all cursor-pointer", selectedGenres.length >= 3 ? "bg-rate-green text-background hover:opacity-90" : "bg-secondary text-muted-foreground opacity-40")}
            >
              {t("onboarding.continue")}
            </button>
          </div>
        </div>
      </div>

      {/* Step 6: All Set */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-700", step === 6 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none")}>
        <div className="w-full max-w-sm flex flex-col items-center">
          <Sparkles className="size-16 text-rate-orange mb-6 animate-pulse" />
          
          <h2 
            className="text-4xl font-bold mb-2 pb-1"
            style={{
              background: "linear-gradient(135deg, var(--rate-green), var(--rate-orange))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("onboarding.all_set")}
          </h2>
          <p className="text-muted-foreground mb-10">{t("onboarding.all_set_subtitle")}</p>
          
          {/* Preview of what they chose */}
          <div className="flex gap-2 mb-6">
            {selectedFilms.map((title, i) => {
              const film = displayFilms.find(f => f.title === title)
              if (!film) return null
              return (
                <div key={i} className="relative w-16 aspect-[2/3] rounded-md overflow-hidden border border-border">
                  {film.poster ? (
                    <Image src={film.poster} alt={title} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-[8px] p-1 text-muted-foreground break-words text-center leading-tight">{film.title}</div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="flex flex-wrap justify-center gap-1.5 mb-12">
            {selectedGenres.slice(0, 4).map(g => (
              <span key={g} className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-full">{g}</span>
            ))}
            {selectedGenres.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{selectedGenres.length - 4}</span>}
          </div>
          
          <button 
            onClick={handleFinish}
            className="w-full rounded-full bg-rate-green py-4 text-lg font-bold text-background hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t("onboarding.start_swiping")}
          </button>
        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab={legalTab}
      />
    </main>
  )
}
