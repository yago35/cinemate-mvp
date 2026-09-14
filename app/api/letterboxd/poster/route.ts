import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const link = searchParams.get("link")

  if (!link) {
    return NextResponse.json({ error: "Link is required" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://letterboxd.com${link}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch page" }, { status: res.status })
    }

    const text = await res.text()
    const match = text.match(/<meta property="og:image" content="([^"]+)"/)
    
    if (match && match[1]) {
      const url = match[1]
      // Reject placeholder or generic logos so the UI falls back to text
      if (!url.includes("empty-poster") && 
          !url.includes("site-logo") && 
          !url.includes("mac-icon") && 
          !url.includes("letterboxd-logo") &&
          !url.includes("default-avatar")) {
        return NextResponse.json({ poster: url })
      }
    }

    return NextResponse.json({ poster: "" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to scrape poster" }, { status: 500 })
  }
}
