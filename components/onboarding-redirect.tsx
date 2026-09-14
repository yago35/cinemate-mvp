"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function OnboardingRedirect() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // MVP Bypass: We rely on a local storage flag since Supabase isn't fully connected for testing
    const isAuth = localStorage.getItem("cinemate-auth") === "true"
    if (!isAuth) {
      router.push("/login")
    } else if (!localStorage.getItem("reelmate-onboarded")) {
      router.push("/onboarding")
    }
  }, [router])

  // Prevent layout shift by returning nothing while client mounts
  if (!isMounted) return null

  return null
}
