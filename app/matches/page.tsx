"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Sparkles } from "lucide-react"
import { PROFILES } from "@/lib/profiles"
import { useAppStore } from "@/lib/store"

// Stable pseudo-random match score per profile id (same as swipe-deck).
function matchScoreFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000
  return 78 + (h % 21) // 78–98
}

export default function MatchesPage() {
  const matches = useAppStore((state) => state.matches)

  return (
    <main className="relative flex min-h-dvh flex-col items-center bg-background">
      {/* Ambient cinematic glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5 pb-24">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            Your Matches
            <Heart className="size-5 text-rate-green" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Cinephiles who share your taste
          </p>
        </div>

        {/* Matches grid */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {matches.map((profileId) => {
              const profile = PROFILES.find(p => p.id === profileId)
              if (!profile) return null

              return (
                <Link
                  key={profileId}
                  href={`/messages/${profileId}`}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:scale-[1.02]"
                >
                  <Image
                    src={profile.photo || "/placeholder.svg"}
                    alt={`${profile.name}'s profile photo`}
                    fill
                    sizes="(max-width: 480px) 50vw, 200px"
                    className="object-cover object-top"
                  />

                  {/* Gradient scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />

                  {/* Bottom content */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-lg font-bold text-foreground">
                      {profile.name}
                      <span className="ml-1.5 text-base font-light text-muted-foreground">
                        {profile.age}
                      </span>
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-rate-green/20 px-2 py-0.5 text-[10px] font-semibold text-rate-green">
                      <Sparkles className="size-2.5" />
                      {matchScoreFor(profileId)}% match
                    </span>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Matched recently
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <Heart className="size-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">No matches yet</h2>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                Start swiping to find your matches
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
