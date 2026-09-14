import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
	  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`)
    
    if (!res.ok) {
      throw new Error(`TMDB responded with ${res.status}`)
    }

    const data = await res.json()
    
    const results = (data.results || []).slice(0, 10).map((movie: any) => ({
      title: movie.title,
      year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : undefined,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "",
      rating: movie.vote_average ? parseFloat((movie.vote_average / 2).toFixed(1)) : 0,
      tmdbId: movie.id
    }))

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error("TMDB API Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
