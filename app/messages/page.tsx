"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { PROFILES } from "@/lib/profiles"
import { useAppStore } from "@/lib/store"

export default function MessagesPage() {
  const conversations = useAppStore((state) => state.conversations)

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
            Messages
            <MessageCircle className="size-5 text-rate-green" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Your film conversations
          </p>
        </div>

        {/* Conversations list */}
        {conversations.length > 0 ? (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => {
              const profile = PROFILES.find((p) => p.id === conv.profileId)
              if (!profile) return null

              const lastMessage = conv.messages[conv.messages.length - 1]
              const isUnread = lastMessage && lastMessage.senderId !== "me"

              return (
                <Link
                  key={conv.profileId}
                  href={`/messages/${conv.profileId}`}
                  className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-card"
                >
                  {/* Profile photo */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image
                      src={profile.photo || "/placeholder.svg"}
                      alt={`${profile.name}'s profile photo`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {profile.name}
                      </span>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {lastMessage.timestamp}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {lastMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <span className="size-2.5 shrink-0 rounded-full bg-rate-green" />
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="size-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">No messages yet</h2>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                Match with cinephiles to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
