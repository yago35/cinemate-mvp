import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://letterboxd.com/${username}/following/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    if (!res.ok) {
      throw new Error("Failed to fetch network")
    }
    const html = await res.text()
    const $ = cheerio.load(html)
    
    const following: any[] = []
    $('table.person-table tbody tr').each((i, el) => {
      const avatar = $(el).find('img').attr('src')
      const name = $(el).find('.name a').text().trim()
      const profileUrl = $(el).find('.name a').attr('href') || ''
      const identifier = profileUrl.replace(/\//g, '')
      // Watched films
      const films = $(el).find('.icon-watched').closest('a').find('.count').text().trim() || 
                    $(el).find('td.td-films .count').text().trim()
      // Likes
      const likes = $(el).find('.icon-like').closest('a').find('.count').text().trim() ||
                    $(el).find('td.td-likes .count').text().trim()
      
      following.push({ name, username: identifier, avatar, films: films || "0", likes: likes || "0" })
    })

    return NextResponse.json({ following })
  } catch (err) {
    return NextResponse.json({ error: "Failed fetch" }, { status: 500 })
  }
}
