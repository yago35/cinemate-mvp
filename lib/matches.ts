import { PROFILES, type Profile } from "./profiles"

export type Match = {
  profileId: string
  matchedAt: string
  tasteMatch: number
}

export const MATCHES: Match[] = [
  { profileId: "maya", matchedAt: "2 hours ago", tasteMatch: 89 },
  { profileId: "theo", matchedAt: "Yesterday", tasteMatch: 85 },
  { profileId: "lena", matchedAt: "3 days ago", tasteMatch: 92 },
]

export function getMatchProfile(profileId: string): Profile | undefined {
  return PROFILES.find((p) => p.id === profileId)
}
