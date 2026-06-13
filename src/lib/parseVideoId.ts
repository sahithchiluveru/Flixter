/**
 * Extracts the Netflix numeric video ID from a watch-page URL.
 *
 * Netflix watch pages look like `https://www.netflix.com/watch/80100172?...`.
 * The numeric ID is global across regions, so it is the key we scope a comment
 * feed to. Returns null for anything that is not a watch page (browse, title,
 * search, or a non-URL string), so callers can cheaply tell "not a watchable
 * page" from "a video to load comments for".
 */
export function parseVideoId(url: string): string | null {
  let pathname: string
  try {
    pathname = new URL(url).pathname
  } catch {
    return null
  }
  const match = pathname.match(/^\/watch\/(\d+)(?:\/|$)/)
  return match ? match[1] : null
}
