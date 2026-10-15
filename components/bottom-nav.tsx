"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clapperboard, Heart, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation, type TranslationKey } from "@/lib/i18n"

const tabs: { href: string; icon: any; key: TranslationKey }[] = [
  { href: "/", icon: Clapperboard, key: "nav.discover" },
  { href: "/matches", icon: Heart, key: "nav.matches" },
  { href: "/messages", icon: MessageCircle, key: "nav.messages" },
  { href: "/profile", icon: User, key: "nav.profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  // Hide bottom nav on specific chat pages
  if (pathname.startsWith("/messages/") && pathname !== "/messages") {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map(({ href, icon: Icon, key }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-rate-green"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "fill-current")} />
              <span>{t(key)}</span>
              {/* Unread indicator for messages */}
              {href === "/messages" && !active && (
                <span className="absolute -top-0.5 right-1/2 ml-3 size-1.5 translate-x-3 rounded-full bg-rate-orange" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
