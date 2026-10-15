"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Plus, Check, ChevronDown } from "lucide-react"
import { USER_PROFILE } from "@/lib/user"
import { useAppStore, type UserPrompt } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"

const AVAILABLE_PROMPTS = [
  "A movie I pretend to understand is...",
  "I will instantly swipe right if you...",
  "The most overrated film of all time is...",
  "My controversial cinema opinion...",
  "A movie scene that lives in my head rent-free is...",
  "The film I've rewatched the most is...",
  "The first movie to make me cry was...",
  "If I could live in any cinematic universe, it would be...",
  "My favorite performance by an actor is...",
  "The best soundtrack of all time belongs to...",
  "A character I deeply relate to is...",
  "The best ending to a film ever is...",
]

function PromptSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-transparent text-sm font-semibold text-muted-foreground outline-none focus:text-foreground flex items-center justify-between py-1"
      >
        <span className="truncate pr-2">{value || "Select a prompt..."}</span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-[40vh] overflow-y-auto rounded-xl border border-border bg-[#18181b] shadow-2xl z-50 p-1 flex flex-col gap-1">
          {options.map(o => (
            <div
              key={o}
              onClick={() => { onChange(o); setIsOpen(false) }}
              className={`px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === o ? "bg-rate-green/20 text-rate-green" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EditProfilePage() {
  const router = useRouter()
  const { t } = useTranslation()
  
  const storePhotos = useAppStore(state => state.userPhotos)
  const storeBio = useAppStore(state => state.userBio)
  const storeName = useAppStore(state => state.profileName)
  const storeAge = useAppStore(state => state.profileAge)
  const storeLocation = useAppStore(state => state.profileLocation)
  const storeGender = useAppStore(state => state.gender)
  const storeInterestedIn = useAppStore(state => state.interestedIn)
  const storePrompts = useAppStore(state => state.userPrompts)

  const setUserPhotos = useAppStore(state => state.setUserPhotos)
  const setUserBio = useAppStore(state => state.setUserBio)
  const setBasicInfo = useAppStore(state => state.setBasicInfo)
  const setUserPrompts = useAppStore(state => state.setUserPrompts)

  const [bio, setBio] = useState(storeBio)
  const [name, setName] = useState(storeName)
  const [age, setAge] = useState(storeAge)
  const [location, setLocation] = useState(storeLocation)
  const [gender, setGender] = useState(storeGender)
  const [interestedIn, setInterestedIn] = useState(storeInterestedIn)
  
  const [prompts, setPrompts] = useState<UserPrompt[]>(storePrompts || [])
  const displayedPrompts = [...prompts, ...Array(3 - prompts.length).fill({ question: "", answer: "" })].slice(0, 3)

  const updatePrompt = (index: number, field: "question" | "answer", value: string) => {
    const newPrompts = [...displayedPrompts]
    newPrompts[index] = { ...newPrompts[index], [field]: value }
    setPrompts(newPrompts.filter(p => p.question || p.answer))
  }

  const [photos, setPhotos] = useState<string[]>(() => {
    const arr = Array(6).fill("")
    storePhotos.forEach((p, i) => { if (i < 6) arr[i] = p })
    // Pre-fill the first photo just for demo purposes if empty
    if (arr[0] === "") arr[0] = "https://picsum.photos/seed/me/400/600"
    return arr
  })

  const addPhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos[index] = `https://picsum.photos/seed/${index + Date.now()}/400/600`
    setPhotos(newPhotos)
  }

  const handleSave = () => {
    setUserPhotos(photos.filter(p => p !== ""))
    setUserBio(bio)
    setBasicInfo(name, age, location, gender, interestedIn)
    setUserPrompts(prompts.filter(p => p.question && p.answer.trim() !== ""))
    router.push("/profile")
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link
            href="/profile"
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-semibold text-foreground">{t("profile.edit_profile")}</h1>
          <button
            onClick={handleSave}
            className="flex size-10 items-center justify-center rounded-full text-rate-green hover:bg-secondary cursor-pointer"
          >
            <Check className="size-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-8">
        
        {/* Photos Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Camera className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">{t("profile.photos")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div 
                key={i}
                onClick={() => addPhoto(i)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border bg-card hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center group"
              >
                {photo ? (
                  <Image src={photo} alt={`My Photo ${i + 1}`} fill className="object-cover" />
                ) : (
                  <Plus className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("profile.photos_desc")}</p>
        </section>

        {/* Bio Section */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t("profile.about_me")}</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rate-green min-h-[120px]"
            placeholder={t("profile.bio_placeholder")}
          />
        </section>

        {/* Prompts Section */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t("profile.prompts_title")}</h2>
          <div className="flex flex-col gap-4">
            {displayedPrompts.map((prompt, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <PromptSelect
                  value={prompt.question}
                  onChange={(v) => updatePrompt(i, "question", v)}
                  options={AVAILABLE_PROMPTS}
                />
                <textarea
                  value={prompt.answer}
                  onChange={(e) => updatePrompt(i, "answer", e.target.value)}
                  className="w-full rounded-lg bg-secondary/50 p-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-rate-green min-h-[80px]"
                  placeholder={t("profile.prompt_placeholder")}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t("onboarding.basic_info")}</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground w-20">{t("profile.name")}</span>
              <span className="text-sm font-medium text-foreground text-right w-full">{name}</span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground w-20">{t("profile.age")}</span>
              <span className="text-sm font-medium text-foreground text-right w-full">{age}</span>
            </div>
            <div className="flex justify-between items-center rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground w-20">{t("profile.location")}</span>
              <span className="text-sm font-medium text-foreground text-right w-full">{location}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground text-center">{t("profile.info_locked")}</p>
            
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">{t("profile.gender")}</span>
              <div className="flex bg-background rounded-lg p-1">
                {["man", "woman", "other"].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-colors cursor-pointer ${gender === g ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t(`profile.${g}` as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">{t("profile.interested_in")}</span>
              <div className="flex bg-background rounded-lg p-1">
                {["men", "women", "everyone"].map(i => (
                  <button
                    key={i}
                    onClick={() => setInterestedIn(i)}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-colors cursor-pointer ${interestedIn === i ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t(`profile.${i}` as any)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
