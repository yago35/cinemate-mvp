"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, ShieldAlert, Check } from "lucide-react"
import { LogoIcon } from "@/components/logo"
import { LegalModal, type LegalTab } from "@/components/legal-modal"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalTab, setLegalTab] = useState<LegalTab>("terms")

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab)
    setLegalOpen(true)
  }

  const handleAuth = async (signingUp: boolean) => {
    if (signingUp && !acceptedTerms) {
      setError("Please check the box to agree to the Terms of Service and Privacy Policy before continuing.")
      return
    }

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
        <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-secondary/30 border border-border">
          <LogoIcon className="size-14" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {isSignUp 
            ? "Sign up to find your cinematic soulmate." 
            : "Log in to continue finding your film partner."}
        </p>

        {/* Auth Mode Switcher */}
        <div className="mb-6 grid w-full grid-cols-2 rounded-full bg-secondary/40 p-1 border border-border">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(""); }}
            className={cn(
              "rounded-full py-2 text-xs font-semibold transition-all cursor-pointer",
              !isSignUp ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(""); }}
            className={cn(
              "rounded-full py-2 text-xs font-semibold transition-all cursor-pointer",
              isSignUp ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-5 w-full rounded-2xl border border-destructive/30 bg-destructive/15 p-3.5 text-xs text-destructive leading-relaxed">
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
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground ml-1 mb-1 block uppercase tracking-wider font-semibold">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rate-green text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Checkbox agreement for Sign Up mode */}
          {isSignUp && (
            <div 
              onClick={() => {
                setAcceptedTerms(!acceptedTerms)
                if (error) setError("")
              }}
              className={cn(
                "mt-1 flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all select-none",
                acceptedTerms 
                  ? "border-rate-green/60 bg-rate-green/10" 
                  : "border-border/80 bg-secondary/30 hover:border-border"
              )}
            >
              <div className={cn(
                "size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                acceptedTerms 
                  ? "bg-rate-green border-rate-green text-background shadow-sm" 
                  : "border-muted-foreground/40 bg-card hover:border-rate-green"
              )}>
                {acceptedTerms && <Check className="size-3.5 stroke-[3]" />}
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground">
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openLegal("terms"); }}
                  className="font-medium text-foreground underline underline-offset-2 hover:text-rate-green cursor-pointer"
                >
                  Terms of Service
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openLegal("privacy"); }}
                  className="font-medium text-foreground underline underline-offset-2 hover:text-rate-green cursor-pointer"
                >
                  Privacy Policy &amp; Disclaimer
                </button>
                .
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-3">
            {isSignUp ? (
              <button 
                type="button"
                onClick={() => handleAuth(true)}
                disabled={loading || !email || !password || !acceptedTerms}
                className="w-full rounded-full bg-rate-green py-3.5 font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center cursor-pointer shadow-lg shadow-rate-green/15"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : "Create Account"}
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => handleAuth(false)}
                disabled={loading || !email || !password}
                className="w-full rounded-full bg-foreground py-3.5 font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : "Log In"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1 cursor-pointer"
            >
              {isSignUp 
                ? "Already have an account? Log In" 
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Legal & Disclaimer Badge */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground w-full">
          <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card/50 p-3 text-left text-[11px] leading-relaxed text-muted-foreground shadow-sm w-full">
            <ShieldAlert className="size-4 shrink-0 text-rate-orange mt-0.5" />
            <p>
              <strong className="text-foreground/90 font-semibold">Disclaimer:</strong> Cinemate is an independent project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Letterboxd Limited or TMDB (The Movie Database).
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
