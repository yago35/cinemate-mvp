"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, Sparkles, X, User } from "lucide-react"
import type { Profile } from "@/lib/profiles"
import { cn } from "@/lib/utils"

export function MatchModal({
  profile,
  tasteMatch,
  onClose,
  onMessage,
}: {
  profile: Profile
  tasteMatch: number
  onClose: () => void
  onMessage: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation on next frame
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-2xl">
      <style>{`
        @keyframes matchEntrance {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) rotate(45deg);
          }
        }
        @keyframes sparkleRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      {/* Decorative floating sparkles */}
      {[
        { left: "10%", bottom: "20%", delay: "0s", size: "size-3" },
        { left: "85%", bottom: "30%", delay: "0.3s", size: "size-2" },
        { left: "20%", bottom: "60%", delay: "0.6s", size: "size-2.5" },
        { left: "75%", bottom: "50%", delay: "0.9s", size: "size-3" },
        { left: "50%", bottom: "15%", delay: "1.2s", size: "size-2" },
        { left: "30%", bottom: "75%", delay: "0.4s", size: "size-2" },
        { left: "65%", bottom: "70%", delay: "0.7s", size: "size-3" },
      ].map((spark, i) => (
        <Sparkles
          key={i}
          className={cn(spark.size, "absolute text-rate-orange/30")}
          style={{
            left: spark.left,
            bottom: spark.bottom,
            animation: `floatUp 3s ease-out ${spark.delay} infinite`,
          }}
        />
      ))}

      {/* Close button */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-5" />
      </button>

      {/* Center content */}
      <div
        className="flex flex-col items-center gap-6 px-6"
        style={{
          animation: visible ? "matchEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
          opacity: 0,
        }}
      >
        {/* Sparkles icon */}
        <Sparkles
          className="size-8 text-rate-orange"
          style={{ animation: "sparkleRotate 3s ease-in-out infinite" }}
        />

        {/* Profile photos side by side */}
        <div className="relative flex items-center gap-4">
          {/* Their photo */}
          <div className="relative size-28 overflow-hidden rounded-full border-2 border-rate-green">
            <Image
              src={profile.photo || "/placeholder.svg"}
              alt={`${profile.name}'s profile photo`}
              fill
              sizes="112px"
              className="object-cover object-top"
            />
          </div>

          {/* Overlapping heart */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <Heart className="size-10 animate-bounce fill-rate-green text-rate-green" />
          </div>

          {/* Your avatar */}
          <div className="size-28 rounded-full bg-gradient-to-br from-rate-green via-rate-orange to-rate-blue p-[3px]">
            <div className="flex size-full items-center justify-center rounded-full bg-card">
              <User className="size-12 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, var(--rate-green), var(--rate-orange))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          It&apos;s a match!
        </h2>

        {/* Taste match badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rate-green/20 px-4 py-1.5 text-sm font-semibold text-rate-green">
          <Sparkles className="size-3.5" />
          {tasteMatch}% taste match
        </span>

        {/* Description */}
        <p className="max-w-xs text-center text-sm text-muted-foreground">
          You and {profile.name} both liked each other&apos;s screening
        </p>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onMessage}
            className="rounded-full bg-rate-green px-8 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Send a message
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Keep watching
          </button>
        </div>
      </div>
    </div>
  )
}
