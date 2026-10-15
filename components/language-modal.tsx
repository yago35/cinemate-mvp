"use client"

import { useState, useEffect } from "react"
import { X, Search, Check, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag: string
  region: string
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸", region: "Worldwide / Global" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", region: "Spain & Latin America" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", region: "France & Francophonie" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", region: "Germany, Austria, Switzerland" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", region: "Brazil & Portugal" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", region: "Italy" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", region: "Turkey & Cyprus" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", region: "Japan" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", region: "South Korea" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", region: "China & Singapore" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", region: "Middle East & North Africa" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", region: "Eastern Europe & Central Asia" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", region: "India" },
]

interface LanguageModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const currentLang = useAppStore(state => state.language) || "en"
  const setLanguage = useAppStore(state => state.setLanguage)

  const [query, setQuery] = useState("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen && !visible) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const handleSelect = (code: string) => {
    setLanguage(code)
    localStorage.setItem("cinemate-lang", code)
    handleClose()
  }

  const filtered = POPULAR_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(query.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(query.toLowerCase()) ||
    lang.code.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Dialog Card */}
      <div 
        className={cn(
          "relative z-[121] flex h-full max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-300",
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-rate-green/15 text-rate-green">
              <Globe className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-foreground">Select Language</h2>
              <p className="text-xs text-muted-foreground">Choose your preferred display language</p>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border/60 bg-secondary/20">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
            />
          </div>
        </div>

        {/* Languages List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No languages found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.code === currentLang
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl p-3.5 text-left transition-all cursor-pointer",
                    isSelected 
                      ? "bg-rate-green/15 border border-rate-green/30" 
                      : "hover:bg-secondary/60 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" role="img" aria-label={item.name}>
                      {item.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          isSelected ? "text-rate-green" : "text-foreground"
                        )}>
                          {item.nativeName}
                        </span>
                        {item.nativeName !== item.name && (
                          <span className="text-xs text-muted-foreground">({item.name})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.region}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex size-6 items-center justify-center rounded-full bg-rate-green text-background">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card/90 px-6 py-3.5 text-center">
          <p className="text-[11px] text-muted-foreground">
            More translations are continuously added to Cinemate.
          </p>
        </div>
      </div>
    </div>
  )
}
