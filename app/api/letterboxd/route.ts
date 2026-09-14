import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  try {
    // 1. Fetch main profile page to check if user exists and get total pages
    const profileRes = await fetch(`https://letterboxd.com/${username}/films/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 }
    })

    if (!profileRes.ok) {
      if (profileRes.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      throw new Error(`Failed to fetch Letterboxd. Status: ${profileRes.status}`)
    }

    const html = await profileRes.text()
    
    // Extract cookies to bypass Cloudflare 403 on subsequent pages
    const rawCookies = profileRes.headers.get("set-cookie") || ""
    // Parse cookies into a usable string (simple approach: just pass them all)
    const cookieHeader = rawCookies.split(',').map(c => c.split(';')[0]).join('; ')

    const $ = cheerio.load(html)

    // Extract Avatar
    let avatarUrl = $(".profile-avatar img").attr("src") || ""
    if (!avatarUrl) {
      // Fallback to searching for an image matching the username (case-insensitive)
      $("img").each((_, el) => {
        const alt = $(el).attr("alt") || ""
        if (alt.toLowerCase() === username.toLowerCase() && !avatarUrl) {
          avatarUrl = $(el).attr("src") || ""
        }
      })
    }
    // Remove crop from avatar to get higher res if possible
    if (avatarUrl && avatarUrl.includes("-0-48-0-48-crop.jpg")) {
       avatarUrl = avatarUrl.replace("-0-48-0-48-crop.jpg", "-0-150-0-150-crop.jpg")
    }

    // Find total logged films count
    let totalLoggedFilms = 0
    const profileStatsValue = $(".profile-stats .value").first().text().replace(/,/g, "")
    if (profileStatsValue) {
      totalLoggedFilms = parseInt(profileStatsValue, 10) || 0
    }

    // Find pagination to determine total pages (limit to max 5 pages for prototype speed)
    let totalPages = 1
    const paginationLinks = $(".paginate-pages li.paginate-page a")
    if (paginationLinks.length > 0) {
      const lastPageStr = paginationLinks.last().text()
      totalPages = parseInt(lastPageStr, 10) || 1
    }

    const MAX_PAGES = Math.min(totalPages, 5)
    const films: Array<{title: string, poster: string, rating: number, link?: string}> = []

    // Fetch RSS feed in parallel to get high-quality posters for recent logs
    const rssPromise = fetch(`https://letterboxd.com/${username}/rss/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    }).then(res => res.text()).catch(() => "")

    // Wait for RSS first so we can map it and use it as the source of recent films
    const rssText = await rssPromise
    const rssPosters: Record<string, string> = {}
    if (rssText) {
      const $rss = cheerio.load(rssText, { xmlMode: true })
      $rss("item").each((_, el) => {
        const title = $rss(el).find("letterboxd\\:filmTitle").text()
        const year = $rss(el).find("letterboxd\\:filmYear").text()
        
        const memberRating = $rss(el).find("letterboxd\\:memberRating").text()
        const rating = memberRating ? parseFloat(memberRating) : 0
        
        const linkStr = $rss(el).find("link").text() || ""
        let link = ""
        try {
          if (linkStr) link = new URL(linkStr).pathname
        } catch(e) {}
        
        const desc = $rss(el).find("description").text()
        const imgMatch = desc.match(/src="([^"]+)"/)
        let poster = ""

        if (imgMatch && imgMatch[1]) {
          poster = imgMatch[1]
          const fullTitle = year ? `${title} (${year})` : title
          rssPosters[fullTitle] = poster
          rssPosters[title] = poster
        }

        // Add the RSS film to our main films array! (Since RSS is always newest logs)
        if (title && !films.some(f => f.title === title)) {
          films.push({ title, poster, rating, link })
        }
      })
    }

    // Helper function to extract films from a loaded cheerio instance (populates older films)
    const extractFilms = ($page: cheerio.CheerioAPI) => {
      $page(".react-component[data-component-class='LazyPoster']").each((_, el) => {
        const title = $page(el).attr("data-item-name") || $page(el).attr("data-item-full-display-name") || ""
        const slug = $page(el).attr("data-item-slug") || ""
        const link = slug ? `/film/${slug}/` : ""
        let poster = ""
        
        // Use RSS poster if available
        if (title && rssPosters[title]) {
          poster = rssPosters[title]
        }

        // Rating is usually in the parent or next sibling
        const ratingClass = $page(el).parent().find(".rating").attr("class") || ""
        let rating = 0
        if (ratingClass) {
          const match = ratingClass.match(/rated-(\d+)/)
          if (match) rating = parseInt(match[1], 10) / 2
        }

        if (title && !films.some(f => f.title === title)) {
          films.push({ title, poster, rating, link })
        }
      })
    }

    // Parse the first page we already fetched
    extractFilms($)

    // Fetch remaining pages sequentially to avoid 403 Rate Limiting / Cloudflare Blocks
    const fetchErrors = []
    if (MAX_PAGES > 1) {
      for (let i = 2; i <= MAX_PAGES; i++) {
        try {
          // Wait 500ms before next fetch to avoid triggering Cloudflare anti-bot burst rules
          await new Promise(resolve => setTimeout(resolve, 500))

          const res = await fetch(`https://letterboxd.com/${username}/films/page/${i}/`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Referer": `https://letterboxd.com/${username}/films/page/${i - 1}/`,
              "Cookie": cookieHeader
            }
          })
          
          if (!res.ok) {
            console.error(`Page ${i} returned ${res.status}`)
            fetchErrors.push(`Page ${i} HTTP ${res.status}`)
            break // If we hit a 403 or 404, stop fetching more pages
          }
          
          const pageHtml = await res.text()
          if (!pageHtml) continue
          
          const $page = cheerio.load(pageHtml)
          extractFilms($page)
        } catch (err: any) {
          console.error(`Error fetching page ${i}:`, err)
          fetchErrors.push(`Page ${i} Error ${err.message}`)
          break
        }
      }
    }

    // Filter out duplicate films
    const uniqueFilms = Array.from(new Map(films.map(f => [f.title, f])).values())

    // Fallback: Fetch missing posters from TMDB
    const tmdbApiKey = process.env.TMDB_API_KEY
    if (tmdbApiKey) {
      const missingPosters = uniqueFilms.filter(f => !f.poster)
      // Limit to 40 simultaneous requests to avoid TMDB rate limit (40 req/sec)
      const batches = []
      for (let i = 0; i < missingPosters.length; i += 20) {
        batches.push(missingPosters.slice(i, i + 20))
      }

      for (const batch of batches) {
        await Promise.all(batch.map(async (film) => {
          try {
            const cleanTitle = film.title.replace(/\s*\(\d{4}\)$/, '')
            const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(cleanTitle)}&page=1`)
            if (tmdbRes.ok) {
              const data = await tmdbRes.json()
              const bestMatch = data.results && data.results[0]
              if (bestMatch && bestMatch.poster_path) {
                film.poster = `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`
              }
            }
          } catch (e) {
            // ignore TMDB fetch errors for individual films
          }
        }))
      }
    }

    // Estimate likes based on totalLoggedFilms if we didn't scrape it, or we can fetch it here?
    // Since we don't scrape likes here to save time, we return 0 and let the profile fetcher or onboarding handle it, 
    // but actually let's just return what we have so far
    return NextResponse.json({
      username,
      avatarUrl,
      totalFilms: uniqueFilms.length,
      totalLoggedFilms,
      totalLikes: 0, // This will be fetched seamlessly by the profile/background fetcher
      totalPagesEvaluated: totalPages,
      fetchErrors,
      films: uniqueFilms
    })

  } catch (error) {
    console.error("Letterboxd scrape error:", error)
    return NextResponse.json({ error: "Failed to scrape Letterboxd" }, { status: 500 })
  }
}
