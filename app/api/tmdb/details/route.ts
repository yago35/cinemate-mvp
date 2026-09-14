import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is not configured" }, { status: 500 })
  }

  try {
    // 1. Search for the movie
    const cleanTitle = title.replace(/\s*\(\d{4}\)$/, '')
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&page=1`)
    if (!searchRes.ok) throw new Error("Search failed")
    const searchData = await searchRes.json()
    const movie = searchData.results && searchData.results[0]
    
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // 2. Fetch details
    const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits`)
    if (!detailRes.ok) throw new Error("Details failed")
    const data = await detailRes.json()

    const director = data.credits?.crew?.find((c: any) => c.job === "Director")
    
    // Format runtime
    const hours = Math.floor(data.runtime / 60)
    const mins = data.runtime % 60
    const duration = data.runtime ? `${hours}h ${mins}m` : "Unknown"

    return NextResponse.json({
      director: director?.name || "Unknown",
      duration,
      genres: data.genres?.map((g: any) => g.name) || [],
      synopsis: data.overview || "No synopsis available."
    })
  } catch (err: any) {
    console.error("TMDB Details Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
