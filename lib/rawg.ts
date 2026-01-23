import axios from 'axios'

const RAWG_API_KEY = process.env.RAWG_API_KEY
const RAWG_BASE_URL = 'https://api.rawg.io/api'

export interface RAWGGame {
  id: number
  slug: string
  name: string
  description_raw: string
  genres: Array<{ name: string }>
  background_image: string
  rating: number
  screenshots?: Array<{ image: string }>
}

export async function searchGames(query: string): Promise<RAWGGame[]> {
  if (!RAWG_API_KEY) {
    console.warn('RAWG_API_KEY not set, returning empty results')
    return []
  }

  try {
    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        search: query,
        page_size: 10,
      },
    })
    return response.data.results || []
  } catch (error) {
    console.error('Error fetching games from RAWG:', error)
    return []
  }
}

export async function getGameDetails(slug: string): Promise<RAWGGame | null> {
  if (!RAWG_API_KEY) {
    console.warn('RAWG_API_KEY not set')
    return null
  }

  try {
    const response = await axios.get(`${RAWG_BASE_URL}/games/${slug}`, {
      params: {
        key: RAWG_API_KEY,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching game details from RAWG:', error)
    return null
  }
}

export async function getGameScreenshots(gameId: number): Promise<string[]> {
  if (!RAWG_API_KEY) {
    return []
  }

  try {
    const response = await axios.get(`${RAWG_BASE_URL}/games/${gameId}/screenshots`, {
      params: {
        key: RAWG_API_KEY,
      },
    })
    return response.data.results?.map((s: any) => s.image) || []
  } catch (error) {
    console.error('Error fetching screenshots from RAWG:', error)
    return []
  }
}
