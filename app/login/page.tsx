"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, ShieldAlert } from "lucide-react"
import { LogoIcon } from "@/components/logo"
import { LegalModal, type LegalTab } from "@/components/legal-modal"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalTab, setLegalTab] = useState<LegalTab>("terms")

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab)
    setLegalOpen(true)
  }

  const handleAuth = async (isSignUp: boolean) => {
    try {
      setLoading(true)
      setError("")
      
      // MVP Simulation: Bypass real Supabase Auth
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Set MVP auth flag
      localStorage.setItem("cinemate-auth", "true")

      // Check if they already have an account setup in local storage
      const letterboxdUsername = localStorage.getItem("app-storage")?.includes("letterboxdUsername")
      
      if (letterboxdUsername && localStorage.getItem("app-storage")?.includes("totalLoggedFilms")) {
        router.push("/")
      } else {
        router.push("/onboarding")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-8 flex size-20 items-center justify-center rounded-3xl bg-secondary/30 border border-border">
          <LogoIcon className="size-14" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Welcome to Cinemate</h1>
        <p className="mb-8 text-center text-muted-foreground">Log in or sign up to find your cinematic soulmate.</p>

        {error && (
          <div className="mb-6 w-full rounded-xl bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex w-full flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button 
              onClick={() => handleAuth(false)}
              disabled={loading || !email || !password}
              className="w-full rounded-full bg-foreground px-4 py-3.5 font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "Log In"}
            </button>
            <button 
              onClick={() => handleAuth(true)}
              disabled={loading || !email || !password}
              className="w-full rounded-full bg-secondary px-4 py-3.5 font-semibold text-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Legal & Disclaimer Section */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
          <p className="leading-relaxed">
            Kayıt olarak veya giriş yaparak{" "}
            <button
              type="button"
              onClick={() => openLegal("terms")}
              className="font-medium text-foreground underline underline-offset-4 decoration-border hover:text-rate-green hover:decoration-rate-green transition-colors cursor-pointer"
            >
              Kullanım Şartları
            </button>
            {" "}ve{" "}
            <button
              type="button"
              onClick={() => openLegal("privacy")}
              className="font-medium text-foreground underline underline-offset-4 decoration-border hover:text-rate-green hover:decoration-rate-green transition-colors cursor-pointer"
            >
              Gizlilik Politikası / Sorumluluk Reddi
            </button>
            &apos;ni kabul etmiş olursunuz.
          </p>

          <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-border/80 bg-secondary/30 p-3 text-left text-[11px] leading-relaxed text-muted-foreground shadow-sm">
            <ShieldAlert className="size-4 shrink-0 text-rate-orange mt-0.5" />
            <p>
              <strong className="text-foreground/90 font-semibold">Sorumluluk Reddi:</strong> Cinemate bağımsız bir projedir. Letterboxd Limited veya TMDB (The Movie Database) ile herhangi bir resmi bağı veya sponsorluğu bulunmamaktadır.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Information Modal */}
      <LegalModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab={legalTab}
      />
    </main>
  )
}
