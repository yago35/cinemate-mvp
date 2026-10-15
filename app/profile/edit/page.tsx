"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Plus, Check, ChevronDown, X, Sparkles } from "lucide-react"
import { USER_PROFILE } from "@/lib/user"
import { useAppStore, type UserPrompt } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"

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
  const avatarUrl = useAppStore(state => state.avatarUrl)

  const setUserPhotos = useAppStore(state => state.setUserPhotos)
  const setUserBio = useAppStore(state => state.setUserBio)
  const setBasicInfo = useAppStore(state => state.setBasicInfo)
  const setUserPrompts = useAppStore(state => state.setUserPrompts)

  const [bio, setBio] = useState(storeBio || USER_PROFILE.bio)
  const [name, setName] = useState(storeName || USER_PROFILE.name)
  const [age, setAge] = useState(storeAge || USER_PROFILE.age.toString())
  const [location, setLocation] = useState(storeLocation || USER_PROFILE.location)
  const [gender, setGender] = useState(storeGender || "man")
  const [interestedIn, setInterestedIn] = useState(storeInterestedIn || "women")
  
  const [prompts, setPrompts] = useState<UserPrompt[]>(storePrompts || USER_PROFILE.prompts)
  const [photos, setPhotos] = useState<string[]>(() => {
    const arr = Array(6).fill("")
    if (storePhotos && storePhotos.length > 0) {
      storePhotos.forEach((p, i) => { if (i < 6) arr[i] = p })
    } else if (avatarUrl) {
      arr[0] = avatarUrl
    }
    return arr
  })

  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadIndex, setUploadIndex] = useState<number>(0)

  // Re-sync after zustand rehydrates from localStorage
  useEffect(() => {
    if (!isInitialized) {
      if (storeName) setName(storeName)
      if (storeAge) setAge(storeAge)
      if (storeLocation) setLocation(storeLocation)
      if (storeBio) setBio(storeBio)
      if (storeGender) setGender(storeGender)
      if (storeInterestedIn) setInterestedIn(storeInterestedIn)
      if (storePrompts && storePrompts.length > 0) setPrompts(storePrompts)
      if (storePhotos && storePhotos.length > 0) {
        const arr = Array(6).fill("")
        storePhotos.forEach((p, i) => { if (i < 6) arr[i] = p })
        setPhotos(arr)
      }
      setIsInitialized(true)
    }
  }, [storeName, storeAge, storeLocation, storeBio, storeGender, storeInterestedIn, storePrompts, storePhotos, isInitialized])

  const displayedPrompts = [...prompts, ...Array(3 - prompts.length).fill({ question: "", answer: "" })].slice(0, 3)

  const updatePrompt = (index: number, field: "question" | "answer", value: string) => {
    const newPrompts = [...displayedPrompts]
    newPrompts[index] = { ...newPrompts[index], [field]: value }
    setPrompts(newPrompts.filter(p => p.question || p.answer))
  }

  const triggerUpload = (index: number) => {
    setUploadIndex(index)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhotos = [...photos]
          newPhotos[uploadIndex] = event.target.result as string
          setPhotos(newPhotos)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newPhotos = [...photos]
    newPhotos[index] = ""
    // Compact remaining photos
    const filtered = newPhotos.filter(Boolean)
    const compacted = Array(6).fill("")
    filtered.forEach((p, i) => { compacted[i] = p })
    setPhotos(compacted)
  }

  const addSamplePhoto = () => {
    const firstEmpty = photos.findIndex(p => !p)
    if (firstEmpty !== -1) {
      const newPhotos = [...photos]
      newPhotos[firstEmpty] = `https://picsum.photos/seed/${firstEmpty + Date.now()}/400/600`
      setPhotos(newPhotos)
    }
  }

  const handleSave = async () => {
    const validPhotos = photos.filter(p => p !== "")
    setUserPhotos(validPhotos)
    setUserBio(bio)
    setBasicInfo(name, age, location, gender, interestedIn)
    setUserPrompts(prompts.filter(p => p.question && p.answer.trim() !== ""))

    if (validPhotos.length > 0) {
      useAppStore.setState(state => ({
        avatarUrl: state.avatarUrl || validPhotos[0]
      }))
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from("profiles").upsert({
          id: session.user.id,
          name: name,
          age: parseInt(age) || 25,
          location: location,
          gender: gender,
          interested_in: interestedIn,
          bio: bio,
        })
      }
    } catch (e) {
      // Supabase is optional/offline fallback
    }

    router.push("/profile")
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background pb-24">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

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
            title={t("profile.save")}
            className="flex size-10 items-center justify-center rounded-full text-rate-green hover:bg-secondary cursor-pointer"
          >
            <Check className="size-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-8">
        
        {/* Photos Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">{t("profile.photos")}</h2>
            </div>
            <button
              type="button"
              onClick={addSamplePhoto}
              className="flex items-center gap-1 text-xs text-rate-green hover:underline cursor-pointer"
            >
              <Sparkles className="size-3" />
              <span>+ Sample</span>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div 
                key={i}
                onClick={() => triggerUpload(i)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border bg-card hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center group"
              >
                {photo ? (
                  <>
                    <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => removePhoto(i, e)}
                      aria-label="Remove photo"
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center transition-colors z-10"
                    >
                      <X className="size-3.5" />
                    </button>
                    {/* Change overlay on hover/tap */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="size-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                    <Plus className="size-6" />
                    <span className="text-[10px] font-medium">{t("profile.add_photo")}</span>
                  </div>
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

        {/* Basic Info Section (Editable) */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t("onboarding.basic_info")}</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={USER_PROFILE.name}
                className="bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.age")}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={USER_PROFILE.age.toString()}
                className="bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.location")}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={USER_PROFILE.location}
                className="bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.gender")}</span>
              <div className="flex bg-background rounded-lg p-1 gap-1">
                {["man", "woman", "other"].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 text-xs py-2 rounded-md font-medium capitalize transition-colors cursor-pointer ${gender === g ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t(`profile.${g}` as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.interested_in")}</span>
              <div className="flex bg-background rounded-lg p-1 gap-1">
                {["men", "women", "everyone"].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInterestedIn(i)}
                    className={`flex-1 text-xs py-2 rounded-md font-medium capitalize transition-colors cursor-pointer ${interestedIn === i ? "bg-rate-green text-background" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t(`profile.${i}` as any)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Bottom Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rate-green py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90 cursor-pointer shadow-lg shadow-rate-green/20"
        >
          <Check className="size-4" />
          <span>{t("profile.save")}</span>
        </button>

      </div>
    </main>
  )
}
