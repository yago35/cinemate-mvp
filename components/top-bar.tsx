"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, MessageCircle, SlidersHorizontal } from "lucide-react"
import { LogoIcon } from "@/components/logo"
import { FilterModal } from "@/components/filter-modal"
import { useTranslation } from "@/lib/i18n"

export function TopBar() {
  const [filterOpen, setFilterOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <header className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="size-6" />
          <span className="text-lg font-bold text-foreground">Cinemate</span>
        </div>

        <nav className="flex items-center gap-1.5">
          <IconButton label={t("nav.filters")} onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-5" />
          </IconButton>
          <IconButton label={t("nav.messages")} href="/messages">
            <MessageCircle className="size-5" />
          </IconButton>
          <IconButton label={t("matches.title")} href="/matches">
            <Flame className="size-5 text-rate-orange" />
          </IconButton>
        </nav>
      </header>

      <FilterModal isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  )
}

function IconButton({
  children,
  label,
  onClick,
  href,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
}) {
  const classes = "flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  
  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  )
}
