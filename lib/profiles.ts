export type Film = {
  title: string
  year: number
  poster: string
  rating: number // out of 5, supports .5
}

export type Profile = {
  id: string
  name: string
  age: number
  location: string
  distance: number // in km
  gender: "man" | "woman" | "other"
  photo: string
  photos?: string[]
  bio: string
  filmsLogged: number
  followers: string
  topGenres: string[]
  favorites: Film[]
  nowWatching: string
  prompts?: { question: string; answer: string }[]
}

export const FILMS = {
  neonTide: {
    title: "Neon Tide",
    year: 2019,
    poster: "/posters/neon-tide.png",
  },
  goldenHour: {
    title: "Golden Hour",
    year: 1976,
    poster: "/posters/golden-hour.png",
  },
  quietSea: {
    title: "The Quiet Sea",
    year: 2014,
    poster: "/posters/the-quiet-sea.png",
  },
  midnight: {
    title: "Midnight Express Line",
    year: 1968,
    poster: "/posters/midnight-express.png",
  },
  orbit: {
    title: "Orbit",
    year: 2021,
    poster: "/posters/orbit.png",
  },
  lastSummer: {
    title: "Last Summer, Maybe",
    year: 2003,
    poster: "/posters/last-summer.png",
  },
  velvetDreams: {
    title: "Velvet Dreams",
    year: 2022,
    poster: "/posters/velvet-dreams.png",
  },
  circuit: {
    title: "Circuit",
    year: 2020,
    poster: "/posters/circuit.png",
  },
} as const

export const PROFILES: Profile[] = [
  {
    id: "maya",
    name: "Maya",
    age: 28,
    location: "Brooklyn, NY",
    distance: 5,
    gender: "woman",
    photo: "/profiles/maya.png",
    photos: [
      "/profiles/maya.png",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    ],
    bio: "Will judge you (lovingly) by your top four. Repertory cinema regular, letterboxd four-star average, sucker for a slow burn ending.",
    filmsLogged: 1284,
    followers: "3.2k",
    topGenres: ["Drama", "Neo-noir", "Romance"],
    nowWatching: "Neon Tide",
    favorites: [
      { ...FILMS.neonTide, rating: 5 },
      { ...FILMS.quietSea, rating: 4.5 },
      { ...FILMS.goldenHour, rating: 4 },
      { ...FILMS.lastSummer, rating: 5 },
    ],
    prompts: [
      { question: "A movie I pretend to understand is...", answer: "Mulholland Drive. I just nod when people talk about the blue box." },
      { question: "I will instantly swipe right if you...", answer: "Have a Criterion Channel subscription." }
    ]
  },
  {
    id: "julian",
    name: "Julian",
    age: 31,
    location: "Los Angeles, CA",
    distance: 12,
    gender: "man",
    photo: "/profiles/julian.png",
    photos: [
      "/profiles/julian.png",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    ],
    bio: "I make playlists for movies that don't exist yet. 70mm or nothing. Let's argue about the third act over natural wine.",
    filmsLogged: 2041,
    followers: "8.7k",
    topGenres: ["Sci-fi", "Thriller", "Arthouse"],
    nowWatching: "Orbit",
    favorites: [
      { ...FILMS.circuit, rating: 5 },
      { ...FILMS.orbit, rating: 4.5 },
      { ...FILMS.neonTide, rating: 4 },
      { ...FILMS.midnight, rating: 4 },
    ],
    prompts: [
      { question: "My controversial cinema opinion...", answer: "Interstellar is just okay. There, I said it." },
      { question: "We'll get along if...", answer: "You prefer practical effects over CGI." }
    ]
  },
  {
    id: "priya",
    name: "Priya",
    age: 22,
    location: "New York, USA",
    distance: 8000,
    gender: "woman",
    photo: "/profiles/priya.png",
    photos: [
      "/profiles/priya.png",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
    ],
    bio: "Horror movie enthusiast. If we match, we're watching Hereditary.",
    filmsLogged: 893,
    followers: "1.1k",
    topGenres: ["Coming-of-age", "Romance", "Comedy"],
    nowWatching: "Last Summer, Maybe",
    favorites: [
      { ...FILMS.lastSummer, rating: 5 },
      { ...FILMS.goldenHour, rating: 5 },
      { ...FILMS.quietSea, rating: 4 },
      { ...FILMS.neonTide, rating: 3.5 },
    ],
    prompts: []
  },
  {
    id: "theo",
    name: "Theo",
    age: 27,
    location: "London, UK",
    distance: 2500,
    gender: "man",
    photo: "/profiles/theo.png",
    bio: "I watch movies mostly for the cinematography. Also, Nolan is overrated.",
    filmsLogged: 1672,
    followers: "4.5k",
    topGenres: ["Noir", "Documentary", "Drama"],
    nowWatching: "Midnight Express Line",
    favorites: [
      { ...FILMS.midnight, rating: 5 },
      { ...FILMS.quietSea, rating: 4.5 },
      { ...FILMS.orbit, rating: 4 },
      { ...FILMS.goldenHour, rating: 4.5 },
    ],
    prompts: []
  },
  {
    id: "lena",
    name: "Lena",
    age: 24,
    location: "Istanbul, TR",
    distance: 12,
    gender: "woman",
    photo: "/profiles/lena.png",
    bio: "Always looking for someone to argue about the ending of Inception with. Coffee addict.",
    filmsLogged: 1102,
    followers: "2.4k",
    topGenres: ["Drama", "Arthouse", "Romance"],
    nowWatching: "Velvet Dreams",
    favorites: [
      { ...FILMS.lastSummer, rating: 5 },
      { ...FILMS.velvetDreams, rating: 5 },
      { ...FILMS.goldenHour, rating: 4.5 },
      { ...FILMS.quietSea, rating: 4 },
    ],
    prompts: [
      { question: "My ideal first date...", answer: "A double feature at the Alamo Drafthouse, followed by debating the ending for two hours." }
    ]
  },
  {
    id: "sofia",
    name: "Sofia",
    age: 26,
    location: "Paris, FR",
    distance: 1400,
    gender: "woman",
    photo: "/profiles/sofia.png",
    bio: "Nouvelle vague purist. I keep a paper journal of every film I watch. Rooftop cinema > multiplex, no exceptions.",
    filmsLogged: 1567,
    followers: "5.1k",
    topGenres: ["New Wave", "Drama", "Comedy"],
    nowWatching: "Circuit",
    favorites: [
      { ...FILMS.circuit, rating: 4.5 },
      { ...FILMS.midnight, rating: 5 },
      { ...FILMS.lastSummer, rating: 4 },
      { ...FILMS.orbit, rating: 4.5 },
    ],
  },
]
