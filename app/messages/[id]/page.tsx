"use client"

import { use, useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Send, Clapperboard, Sparkles, X, MoreVertical, ShieldAlert, UserX } from "lucide-react"
import { PublicProfile } from "@/components/public-profile"
import { PROFILES } from "@/lib/profiles"
import { useAppStore } from "@/lib/store"
import { USER_PROFILE } from "@/lib/user"
import { cn } from "@/lib/utils"

// Stable pseudo-random match score per profile id (same as swipe-deck).
function matchScoreFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000
  return 78 + (h % 21) // 78–98
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const profile = PROFILES.find((p) => p.id === id)
  
  const router = useRouter()
  const conversations = useAppStore((state) => state.conversations)
  const sendMessage = useAppStore((state) => state.sendMessage)
  const unmatchUser = useAppStore((state) => state.unmatchUser)
  const userFilms = useAppStore((state) => state.userFilms)
  
  const conversation = conversations.find((c) => c.profileId === id)
  const msgs = conversation?.messages ?? []
  
  const [inputText, setInputText] = useState("")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sharedFilms = profile?.favorites.filter(f => 
    userFilms.some(uf => uf.title === f.title) || USER_PROFILE.favorites.some(uf => uf.title === f.title)
  ) || []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs])

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Profile not found</p>
      </main>
    )
  }

  const handleSend = () => {
    if (!inputText.trim()) return
    sendMessage(id, inputText.trim())
    setInputText("")
  }

  const handleUnmatch = () => {
    if (confirm(`Are you sure you want to unmatch with ${profile.name}?`)) {
      unmatchUser(id)
      router.push("/messages")
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          {/* Back button */}
          <Link
            href="/messages"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Back to messages"
          >
            <ArrowLeft className="size-5" />
          </Link>

          {/* Profile photo */}
          <button 
            onClick={() => setShowProfileModal(true)}
            className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border hover:opacity-80 transition-opacity"
          >
            <Image
              src={profile.photo || "/placeholder.svg"}
              alt={`${profile.name}'s profile photo`}
              fill
              sizes="40px"
              className="object-cover"
            />
          </button>

          {/* Name + online status */}
          <button 
            onClick={() => setShowProfileModal(true)}
            className="min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="text-xs text-rate-green">Online</p>
          </button>

          {/* Taste match badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-rate-green/20 px-2.5 py-1 text-[10px] font-semibold text-rate-green">
            <Sparkles className="size-2.5" />
            {matchScoreFor(id)}%
          </span>

          {/* Options Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <MoreVertical className="size-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleUnmatch}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <UserX className="size-4" />
                    Unmatch
                  </button>
                  <button 
                    onClick={() => { setShowMenu(false); alert("User reported.") }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <ShieldAlert className="size-4" />
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 overflow-y-auto p-4 pb-32">
        {sharedFilms.length > 0 && (
          <div className="rounded-2xl border border-rate-green/30 bg-rate-green/10 p-4 text-rate-green mb-4">
            <p className="text-sm font-medium">Movie Icebreaker 🧊</p>
            <p className="mt-1 text-xs opacity-80">
              You both rated <span className="font-bold">{sharedFilms[0].title}</span> highly. Ask {profile.name} about their favorite scene!
            </p>
          </div>
        )}

        {msgs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            {sharedFilms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Say hi to {profile.name}! You matched on film taste.
              </p>
            )}
          </div>
        ) : (
          msgs.map((msg) => {
            const isMine = msg.senderId === "me"
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-max max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2",
                  isMine
                    ? "self-end rounded-br-sm bg-rate-green text-primary-foreground"
                    : "self-start rounded-bl-sm bg-secondary text-secondary-foreground"
                )}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className={cn("text-[9px] opacity-60", isMine ? "text-right" : "text-left")}>
                  {msg.timestamp}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background p-4 pb-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Clapperboard className="size-5" />
          </button>
          <input
            type="text"
            placeholder="Message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-rate-green"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rate-green text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-4 -ml-0.5" />
          </button>
        </div>
      </div>

      {/* Profile Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
          <div className="relative w-full max-w-md h-[90vh] bg-background sm:rounded-3xl sm:h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300 border border-border">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full p-2 backdrop-blur-md hover:bg-black/70 transition-colors"
            >
              <X className="size-5" />
            </button>
            <PublicProfile profile={profile} matchScore={matchScoreFor(id)} />
          </div>
        </div>
      )}
    </main>
  )
}
