import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MATCHES } from "./matches"
import { CONVERSATIONS, Conversation, Message } from "./messages"
import { USER_PROFILE } from "./user"

export interface UserFilm {
  title: string
  poster: string
  year?: string
  rating?: number
}

export interface UserPrompt {
  question: string
  answer: string
}

interface AppState {
  letterboxdUsername: string | null
  avatarUrl: string | null
  userFilms: UserFilm[]
  totalLoggedFilms: number
  totalLikes: number
  selectedFavorites: string[]
  matches: string[] // Array of profile IDs
  conversations: Conversation[]
  userPhotos: string[]
  userPrompts: UserPrompt[]
  userBio: string
  profileName: string
  profileAge: string
  profileLocation: string
  gender: string
  interestedIn: string
  maxDistance: number
  minAge: number
  maxAge: number
  minFilms: number
  preferredGenres: string[]
  superLikes: string[]
  language: string
  setLanguage: (lang: string) => void
  setUserData: (username: string, avatarUrl: string | null, films: UserFilm[], totalLoggedFilms?: number, totalLikes?: number) => void
  setUserPhotos: (photos: string[]) => void
  setUserPrompts: (prompts: UserPrompt[]) => void
  setUserBio: (bio: string) => void
  setBasicInfo: (name: string, age: string, location: string, gender?: string, interestedIn?: string) => void
  setDiscoverySettings: (maxDistance: number, minAge: number, maxAge: number, minFilms: number, preferredGenres: string[]) => void
  setSelectedFavorites: (favorites: string[]) => void
  updateFilmPoster: (title: string, poster: string) => void
  addMatch: (profileId: string) => void
  unmatchUser: (profileId: string) => void
  superLikeUser: (profileId: string) => void
  sendMessage: (profileId: string, text: string) => void
}

// Initial state derived from static data, but users can add to it dynamically
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      letterboxdUsername: null,
      avatarUrl: null,
      userFilms: [],
      totalLoggedFilms: 0,
      totalLikes: 0,
      selectedFavorites: [],
      matches: MATCHES.map(m => m.profileId),
      conversations: CONVERSATIONS,
      userPhotos: [],
      userPrompts: USER_PROFILE.prompts,
      userBio: USER_PROFILE.bio,
      profileName: USER_PROFILE.name,
      profileAge: USER_PROFILE.age.toString(),
      profileLocation: USER_PROFILE.location,
      gender: "man",
      interestedIn: "women",
      maxDistance: 50,
      minAge: 18,
      maxAge: 35,
      minFilms: 0,
      preferredGenres: ["Drama", "Comedy", "Thriller", "Sci-fi", "Romance", "Horror", "Documentary", "Animation", "Neo-noir", "Arthouse"],
      superLikes: [],
      language: "en",

      setLanguage: (lang: string) => set({ language: lang }),
      
      setUserData: (username: string, avatarUrl: string | null, films: UserFilm[], totalLoggedFilms = 0, totalLikes = 0) => set({
        letterboxdUsername: username,
        avatarUrl,
        userFilms: films,
        totalLoggedFilms,
        totalLikes,
      }),

      setUserPhotos: (photos: string[]) => set({
        userPhotos: photos
      }),

      setUserPrompts: (prompts: UserPrompt[]) => set({
        userPrompts: prompts
      }),

      setUserBio: (bio: string) => set({
        userBio: bio
      }),

      setBasicInfo: (name: string, age: string, location: string, gender?: string, interestedIn?: string) => set((state) => ({
        profileName: name,
        profileAge: age,
        profileLocation: location,
        ...(gender ? { gender } : {}),
        ...(interestedIn ? { interestedIn } : {})
      })),

      setDiscoverySettings: (maxDistance: number, minAge: number, maxAge: number, minFilms: number, preferredGenres: string[]) => set({
        maxDistance,
        minAge,
        maxAge,
        minFilms,
        preferredGenres
      }),

      setSelectedFavorites: (favorites: string[]) => set({
        selectedFavorites: favorites
      }),

      updateFilmPoster: (title: string, poster: string) => set((state) => ({
        userFilms: state.userFilms.map(f => f.title === title ? { ...f, poster } : f)
      })),

      addMatch: (profileId: string) => set((state) => {
        if (!state.matches.includes(profileId)) {
          return { matches: [profileId, ...state.matches] }
        }
        return state
      }),

      unmatchUser: (profileId: string) => set((state) => ({
        matches: state.matches.filter(id => id !== profileId),
        conversations: state.conversations.filter(c => c.profileId !== profileId)
      })),

      superLikeUser: (profileId: string) => set((state) => {
        if (!state.superLikes.includes(profileId)) {
          return { superLikes: [...state.superLikes, profileId] }
        }
        return state
      }),

      sendMessage: (profileId: string, text: string) => set((state) => {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: "me",
          text,
          timestamp: "Just now"
        }

        const convoExists = state.conversations.some(c => c.profileId === profileId)
        
        if (convoExists) {
          // Update existing conversation
          return {
            conversations: state.conversations.map(c => 
              c.profileId === profileId 
                ? { 
                    ...c, 
                    messages: [...c.messages, newMsg]
                  }
                : c
            )
          }
        } else {
          // Create new conversation
          const newConvo: Conversation = {
            profileId,
            messages: [newMsg]
          }
          return {
            conversations: [newConvo, ...state.conversations]
          }
        }
      })
    }),
    {
      name: "reelmate-storage"
    }
  )
)
