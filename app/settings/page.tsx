"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Moon, Bell, Shield, LogOut, Upload, FileText, CheckCircle2, Globe, ChevronRight } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { LegalModal, type LegalTab } from "@/components/legal-modal"
import { LanguageModal, POPULAR_LANGUAGES } from "@/components/language-modal"

export default function SettingsPage() {
  const router = useRouter()
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalTab, setLegalTab] = useState<LegalTab>("privacy")
  const [langModalOpen, setLangModalOpen] = useState(false)
  
  const currentLangCode = useAppStore(state => state.language) || "en"
  const currentLang = POPULAR_LANGUAGES.find(l => l.code === currentLangCode) || POPULAR_LANGUAGES[0]
  const storeDistance = useAppStore(state => state.maxDistance)
  const storeMinAge = useAppStore(state => state.minAge)
  const storeMaxAge = useAppStore(state => state.maxAge)
  const setDiscoverySettings = useAppStore(state => state.setDiscoverySettings)
  const setUserData = useAppStore(state => state.setUserData)
  const userFilms = useAppStore(state => state.userFilms)

  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [maxDistance, setMaxDistance] = useState(storeDistance)
  const [minAge, setMinAge] = useState(storeMinAge)
  const [maxAge, setMaxAge] = useState(storeMaxAge)

  const storeMinFilms = useAppStore(state => state.minFilms)
  const storeGenres = useAppStore(state => state.preferredGenres)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadSuccess(false)
    
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/)
      if (lines.length < 2) throw new Error("Invalid file")

      // Parse headers
      const headerLine = lines[0].split(',')
      const nameIdx = headerLine.indexOf("Name")
      const yearIdx = headerLine.indexOf("Year")
      const ratingIdx = headerLine.indexOf("Rating")
      const uriIdx = headerLine.indexOf("Letterboxd URI")
      
      if (nameIdx === -1) throw new Error("Could not find 'Name' column in CSV")

      // Simple CSV row parser (handles commas inside quotes)
      const parseRow = (line: string) => {
        const row = []
        let inQuotes = false, current = ""
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') inQuotes = !inQuotes
          else if (line[i] === ',' && !inQuotes) {
            row.push(current.replace(/^"|"$/g, ''))
            current = ""
          } else current += line[i]
        }
        row.push(current.replace(/^"|"$/g, ''))
        return row
      }

      const parsedFilms = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const row = parseRow(lines[i])
        const title = row[nameIdx]
        if (!title) continue
        
        parsedFilms.push({
          title,
          year: yearIdx > -1 ? row[yearIdx] : undefined,
          rating: ratingIdx > -1 && row[ratingIdx] ? parseFloat(row[ratingIdx]) : 0,
          link: uriIdx > -1 ? row[uriIdx] : "",
          poster: "" // Fallback, will merge below
        })
      }

      // Letterboxd CSVs are chronological (oldest first). Reverse to get newest first!
      parsedFilms.reverse()

      // Merge with existing films to retain posters if we scraped them earlier
      const existingMap = new Map(userFilms.map(f => [f.title, f]))
      const finalFilms = parsedFilms.map(f => {
        const existing = existingMap.get(f.title)
        return existing ? { ...f, poster: existing.poster, rating: f.rating || existing.rating } : f
      })

      // Update global store
      const username = useAppStore.getState().letterboxdUsername || ""
      const avatarUrl = useAppStore.getState().avatarUrl
      const totalLikes = useAppStore.getState().totalLikes
      setUserData(username, avatarUrl, finalFilms, finalFilms.length, totalLikes)

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

      // Background hydration: Fetch missing posters for the first 50 films via TMDB
      const fetchMissingPosters = async () => {
        const top50 = finalFilms.slice(0, 50).filter(f => !f.poster)
        for (const film of top50) {
          try {
            const res = await fetch(`/api/tmdb?query=${encodeURIComponent(film.title)}`)
            if (res.ok) {
              const data = await res.json()
              if (data.results && data.results.length > 0) {
                // Try to match by year if available, otherwise pick the first result
                let bestMatch = data.results[0]
                if (film.year) {
                  const yearMatch = data.results.find((r: any) => r.year == film.year)
                  if (yearMatch) bestMatch = yearMatch
                }
                
                if (bestMatch.poster) {
                  // Wait! updateFilmPoster is not destructured from store, let's call getState() directly
                  useAppStore.getState().updateFilmPoster(film.title, bestMatch.poster)
                }
              }
            }
          } catch (e) {
            console.error("TMDB Hydration Error for", film.title, e)
          }
          // 300ms delay to respect TMDB rate limits
          await new Promise(r => setTimeout(r, 300))
        }
      }
      
      // Fire and forget
      fetchMissingPosters()

    } catch (err) {
      alert("Failed to parse CSV. Please upload a valid Letterboxd exported CSV (e.g., watched.csv).")
    } finally {
      setIsUploading(false)
    }
  }

  // Save settings when leaving the page (or debounced)
  const handleSave = () => {
    setDiscoverySettings(maxDistance, minAge, maxAge, storeMinFilms, storeGenres)
    router.push("/profile")
  }

  const handleLogout = () => {
    // Clear local storage and Zustand state
    localStorage.removeItem("reelmate-onboarded")
    useAppStore.persist.clearStorage()
    
    // Redirect to onboarding (since we clear local storage, the guard on / will also catch it, but let's go directly)
    router.push("/onboarding")
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <button
            onClick={handleSave}
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-6">
        
        {/* Discovery Settings */}
        <section>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Discovery Settings
          </h2>
          <div className="flex flex-col rounded-2xl border border-border bg-card">
            
            <div className="flex flex-col border-b border-border p-4 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Maximum Distance</span>
                <span className="text-sm font-medium text-foreground">{maxDistance} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="160" 
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-rate-green"
              />
            </div>

            <div className="flex flex-col p-4 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Age Range</span>
                <span className="text-sm font-medium text-foreground">{minAge} - {maxAge === 100 ? "100+" : maxAge}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">Min</span>
                  <input 
                    type="range" 
                    min="18" 
                    max={maxAge} 
                    value={minAge}
                    onChange={(e) => setMinAge(parseInt(e.target.value))}
                    className="w-full accent-rate-green"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">Max</span>
                  <input 
                    type="range" 
                    min={Math.max(18, minAge)} 
                    max="100" 
                    value={maxAge}
                    onChange={(e) => setMaxAge(parseInt(e.target.value))}
                    className="w-full accent-rate-green"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Advanced Data Import */}
        <section>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data Import
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
                  <FileText className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Import watched.csv</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Upload your exported <span className="font-semibold text-foreground">watched.csv</span> file for a complete history sync without limits. Recommended for power users.
                  </p>
                </div>
              </div>
              
              <div className="mt-2 relative">
                <input 
                  type="file" 
                  id="csv-upload" 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="csv-upload"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-colors",
                    isUploading ? "border-muted bg-secondary text-muted-foreground cursor-not-allowed" : 
                    uploadSuccess ? "border-rate-green/50 bg-rate-green/10 text-rate-green" : 
                    "border-border hover:bg-secondary text-foreground"
                  )}
                >
                  {isUploading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      Uploading data...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Sync Complete!
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Select Data File
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* App Preferences */}
        <section>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            App Preferences
          </h2>
          <div className="flex flex-col rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Moon className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </div>
              {/* Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "h-6 w-11 rounded-full p-1 transition-colors",
                  darkMode ? "bg-rate-green" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "size-4 rounded-full bg-background transition-transform",
                  darkMode ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Push Notifications</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  "h-6 w-11 rounded-full p-1 transition-colors",
                  notifications ? "bg-rate-green" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "size-4 rounded-full bg-background transition-transform",
                  notifications ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {/* Language Selector */}
            <button 
              onClick={() => setLangModalOpen(true)}
              className="flex items-center justify-between p-4 hover:bg-secondary/60 transition-colors text-left cursor-pointer w-full"
            >
              <div className="flex items-center gap-3">
                <Globe className="size-5 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-foreground block">Language</span>
                  <span className="text-xs text-muted-foreground">Select interface language</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-rate-green bg-rate-green/10 border border-rate-green/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.nativeName}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </section>

        {/* Account & Security */}
        <section>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <div className="flex flex-col rounded-2xl border border-border bg-card">
            <button 
              onClick={() => {
                setLegalTab("privacy")
                setLegalOpen(true)
              }}
              className="flex items-center justify-between border-b border-border p-4 hover:bg-secondary transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Privacy, Terms & Disclaimer</span>
              </div>
            </button>
            <button className="flex items-center justify-between p-4 hover:bg-secondary transition-colors text-left">
              <span className="text-sm font-medium text-foreground">Connected Accounts</span>
              <span className="text-xs text-muted-foreground">Letterboxd</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign Out / Reset Demo
          </button>
          <p className="mt-4 px-4 text-center text-xs text-muted-foreground">
            Cinemate v1.0.0
          </p>
        </section>

      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Language Selector Modal */}
      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />
    </main>
  )
}
