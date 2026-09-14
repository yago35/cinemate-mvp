"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, X, Star, Heart, Sparkles } from "lucide-react"
import { PROFILES } from "@/lib/profiles"
import type { Profile } from "@/lib/profiles"
import { SwipeCard } from "@/components/swipe-card"
import { MatchModal } from "@/components/match-modal"
import { useAppStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const SWIPE_THRESHOLD = 110

// Stable pseudo-random match score per profile id.
function matchScoreFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000
  return 78 + (h % 21) // 78–98
}

export function SwipeDeck() {
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [exit, setExit] = useState<"left" | "right" | "superlike" | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const addMatch = useAppStore((state) => state.addMatch)
  const superLikeUser = useAppStore((state) => state.superLikeUser)
  
  // Discovery settings
  const userInterestedIn = useAppStore(state => state.interestedIn)
  const maxDistance = useAppStore(state => state.maxDistance)
  const minAge = useAppStore(state => state.minAge)
  const maxAge = useAppStore(state => state.maxAge)
  const minFilms = useAppStore(state => state.minFilms)
  const preferredGenres = useAppStore(state => state.preferredGenres)

  const start = useRef<{ x: number; y: number } | null>(null)
  const animating = useRef(false)

  // Filter profiles based on settings
  const filteredProfiles = PROFILES.filter(p => {
    if (userInterestedIn === "men" && p.gender !== "man") return false;
    if (userInterestedIn === "women" && p.gender !== "woman") return false;
    if (p.distance > maxDistance) return false;
    if (p.age < minAge || p.age > maxAge) return false;
    if (p.filmsLogged < minFilms) return false;
    if (preferredGenres && preferredGenres.length > 0) {
      if (!p.topGenres.some(g => preferredGenres.includes(g))) return false;
    }
    return true;
  })

  const current = filteredProfiles[index]
  const overlay =
    drag.y < -60 ? "like" : drag.x > 40 ? "like" : drag.x < -40 ? "nope" : (exit === "right" || exit === "superlike") ? "like" : exit === "left" ? "nope" : null

  const finishSwipe = useCallback(
    async (dir: "left" | "right" | "superlike") => {
      if (animating.current || !current) return
      animating.current = true
      setExit(dir)
      setDragging(false)
      
      if (dir === "right" || dir === "superlike") {
        addMatch(current.id)
        if (dir === "superlike") {
          superLikeUser(current.id)
        }
        
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await supabase.from("matches").insert({
              user1_id: session.user.id,
              // We're matching with a mock profile, but the DB requires a UUID for user2_id. 
              // Since it's a mock profile with an ID like "priya", this might fail if the DB strictly checks foreign keys against auth.users
              // We'll catch the error silently so the UI doesn't break, but the intent is here for when both users are real.
              user2_id: current.id 
            })
          }
        } catch (e) {
          console.error("Match save error", e)
        }
        
        if (Math.random() > 0.5) {
          setTimeout(() => setMatchedProfile(current), 300)
        }
      }
      
      window.setTimeout(() => {
        setHistory((h) => [...h, index])
        setIndex((i) => i + 1)
        setExit(null)
        setDrag({ x: 0, y: 0 })
        animating.current = false
      }, 280)
    },
    [current, index, addMatch],
  )

  const rewind = useCallback(() => {
    if (animating.current || history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setIndex(prev)
  }, [history])

  const onPointerDown = (e: React.PointerEvent) => {
    if (animating.current) return
    start.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })
  }

  const onPointerUp = () => {
    if (!start.current) return
    start.current = null
    if (drag.x > SWIPE_THRESHOLD) finishSwipe("right")
    else if (drag.x < -SWIPE_THRESHOLD) finishSwipe("left")
    else if (drag.y < -SWIPE_THRESHOLD) finishSwipe("superlike")
    else {
      setDragging(false)
      setDrag({ x: 0, y: 0 })
    }
  }

  const rotation = drag.x / 18
  const exitX = (exit === "right" || exit === "superlike") ? 700 : exit === "left" ? -700 : 0
  const exitY = -60
  const translateX = exit ? exitX : drag.x
  const translateY = exit ? exitY : drag.y * 0.4
  const rotate = exit ? ((exit === "right" || exit === "superlike") ? 22 : exit === "left" ? -22 : 0) : rotation

  const remaining = PROFILES.length - index

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Card stack */}
      <div className="relative aspect-[3/5] w-full max-w-[26rem]">
        {remaining <= 0 ? (
          <EmptyState
            onReset={() => {
              setIndex(0)
              setHistory([])
            }}
          />
        ) : (
          PROFILES.slice(index, index + 3)
            .map((profile, stackPos) => {
              const isTop = stackPos === 0
              const z = 30 - stackPos
              const scale = 1 - stackPos * 0.05
              const ty = stackPos * 14

              return (
                <div
                  key={profile.id}
                  className={cn(
                    "absolute inset-0 touch-none",
                    isTop && !dragging && "transition-transform duration-300 ease-out",
                    !isTop && "transition-all duration-300 ease-out",
                  )}
                  style={
                    isTop
                      ? {
                          zIndex: z,
                          transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
                          opacity: exit ? 0 : 1,
                          transition: exit
                            ? "transform 280ms ease-in, opacity 280ms ease-in"
                            : dragging
                              ? "none"
                              : undefined,
                        }
                      : {
                          zIndex: z,
                          transform: `translateY(${ty}px) scale(${scale})`,
                        }
                  }
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? onPointerUp : undefined}
                  onPointerCancel={isTop ? onPointerUp : undefined}
                >
                  <SwipeCard
                    profile={profile}
                    matchScore={matchScoreFor(profile.id)}
                    overlay={isTop ? overlay : null}
                    onSuperLike={isTop ? () => finishSwipe("superlike") : undefined}
                  />
                  {isTop && (exit === "superlike" || drag.y < -100) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      {/* Bubble animation instead of up swipe */}
                      <div className="relative flex items-center justify-center animate-in zoom-in duration-300">
                        <div className="absolute size-48 rounded-full bg-rate-blue/30 blur-2xl animate-pulse" />
                        <div className="absolute size-32 rounded-full bg-rate-blue/40 blur-xl animate-ping" />
                        <div className="relative rounded-full bg-gradient-to-tr from-rate-blue to-blue-400 p-6 shadow-[0_0_40px_rgba(0,192,255,0.6)] border-[3px] border-white text-white rotate-[-10deg]">
                          <Star className="size-16" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
            .reverse()
        )}
      </div>

      {/* Action buttons */}
      {remaining > 0 && (
        <div className="flex items-center gap-4">
          <ActionButton
            label="Rewind"
            onClick={rewind}
            disabled={history.length === 0}
            className="size-12 border-rate-orange/40 text-rate-orange hover:bg-rate-orange/10"
          >
            <RotateCcw className="size-5" />
          </ActionButton>
          <ActionButton
            label="Pass"
            onClick={() => finishSwipe("left")}
            className="size-16 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <X className="size-7" />
          </ActionButton>
          <ActionButton
            label="Director's Cut (Super Like)"
            onClick={() => finishSwipe("superlike")}
            className="size-12 border-rate-blue/40 text-rate-blue hover:bg-rate-blue/10 relative group"
          >
            <Star className="size-5" />
            <span className="absolute -top-10 scale-0 rounded bg-card px-2 py-1 text-xs text-foreground shadow border border-border transition-all group-hover:scale-100 whitespace-nowrap">
              Director's Cut
            </span>
          </ActionButton>
          <ActionButton
            label="Like"
            onClick={() => finishSwipe("right")}
            className="size-16 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Heart className="size-7" />
          </ActionButton>
        </div>
      )}

      {remaining > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-rate-green" />
          {remaining} {remaining === 1 ? "cinephile" : "cinephiles"} near you tonight
        </p>
      )}

      {matchedProfile && (
        <MatchModal
          profile={matchedProfile}
          tasteMatch={matchScoreFor(matchedProfile.id)}
          onClose={() => setMatchedProfile(null)}
          onMessage={() => {
            setMatchedProfile(null)
            router.push(`/messages/${matchedProfile.id}`)
          }}
        />
      )}
    </div>
  )
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center rounded-full border bg-card transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-[90px] top-[72px] flex flex-col items-center justify-center p-4">
      <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Sparkles className="size-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2 text-foreground">That's everyone!</h2>
      <p className="text-muted-foreground text-center max-w-[250px] mb-8">
        You've seen all the cinephiles matching your preferences. Try expanding your Discovery Settings to see more people.
      </p>
      <button 
        onClick={onReset}
        className="px-6 py-3 bg-secondary text-foreground font-semibold rounded-full hover:bg-secondary/80 transition-colors"
      >
        Start Over
      </button>
    </div>
  )
}
