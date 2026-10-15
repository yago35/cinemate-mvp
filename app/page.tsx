"use client"

import { TopBar } from "@/components/top-bar"
import { SwipeDeck } from "@/components/swipe-deck"
import { OnboardingRedirect } from "@/components/onboarding-redirect"
import { useTranslation } from "@/lib/i18n"

export default function Page() {
  const { t } = useTranslation()

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-background">
      <OnboardingRedirect />
      {/* Ambient cinematic glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="relative flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5">
        <TopBar />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              {t("home.tonight_screening")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("home.match_on_taste")}
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center pb-4">
          <SwipeDeck />
        </div>
      </div>
    </main>
  )
}
