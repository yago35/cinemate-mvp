import { FILMS, type Film } from "./profiles"

export const USER_PROFILE = {
  name: "Sam",
  age: 27,
  location: "New York, NY",
  bio: "Cinematheque regular. I believe every great date starts with a great film. Currently curating my all-time top 100.",
  filmsLogged: 847,
  followers: "1.8k",
  following: "342",
  listsCreated: 12,
  topGenres: ["Drama", "Sci-fi", "Romance", "Neo-noir"],
  favorites: [
    { ...FILMS.neonTide, rating: 5 },
    { ...FILMS.orbit, rating: 4.5 },
    { ...FILMS.goldenHour, rating: 5 },
    { ...FILMS.midnight, rating: 4 },
  ] as (Film & { rating: number })[],
  prompts: [
    { question: "A movie I pretend to understand is...", answer: "Tenet. I just nod when people talk about time inversion." },
    { question: "I will instantly swipe right if you...", answer: "Have a Letterboxd account with more than 500 films logged." }
  ]
}
