import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://letterboxd.com/${username}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    if (!res.ok) {
      throw new Error("Failed to fetch profile")
    }

    const html = await res.text()
    const $ = cheerio.load(html)
    
    let totalLoggedFilms = 0
    let totalLikes = 0

    const statText = $('.profile-stats .stat .value').first().text() || $('h4.profile-statistic a[href$="/films/"] span.value').text()
    if (statText) {
      totalLoggedFilms = parseInt(statText.replace(/,/g, ''), 10)
    }

    // Attempt to fetch likes
    try {
      const likesRes = await fetch(`https://letterboxd.com/${username}/likes/films/`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      })
      if (likesRes.ok) {
        const likesHtml = await likesRes.text()
        const $likes = cheerio.load(likesHtml)
        
        // Find pagination to estimate likes: each full page has 72 films
        const lastPageLink = $likes('.paginate-pages li.paginate-page:last-child a').text()
        const lastPageNum = parseInt(lastPageLink, 10)
        
        if (!isNaN(lastPageNum) && lastPageNum > 1) {
           // We have multiple pages. Minimum likes is (lastPageNum - 1) * 72 + 1
           // Let's just estimate it as (lastPageNum - 1) * 72 + (count on first page)
           const firstPageCount = $likes('.poster-list .poster-container').length || 72
           totalLikes = (lastPageNum - 1) * 72 + Math.floor(firstPageCount / 2) // Rough estimate
        } else {
           // Only one page
           totalLikes = $likes('.poster-list .poster-container').length
        }
      }
    } catch(e) {}

    return NextResponse.json({ totalLoggedFilms, totalLikes })
  } catch (err) {
    return NextResponse.json({ error: "Failed fetch" }, { status: 500 })
  }
}
