import { useCallback, useEffect, useState } from 'react'
import { Rail } from './Rail'
import { parseVideoId } from '../lib/parseVideoId'
import { getComments } from '../lib/comments'
import { supabase } from '../lib/supabase'
import type { Comment } from '../lib/types'

/**
 * Owns rail state for the content script:
 *  - open/closed, toggled by the toolbar icon (relayed as a `flixter:toggle` event)
 *  - the current video ID, re-read as Netflix navigates between titles (it's an SPA)
 *  - whether the player is in true fullscreen, in which case the rail is hidden
 *  - fetching comments for the current video when the rail is open
 */
export function RailApp() {
  const [open, setOpen] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(() => parseVideoId(location.href))
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement)

  useEffect(() => {
    const toggle = () => setOpen((o) => !o)
    window.addEventListener('flixter:toggle', toggle)
    return () => window.removeEventListener('flixter:toggle', toggle)
  }, [])

  // Netflix is a single-page app: the URL changes without a reload as the user
  // moves between titles. Poll the location so the feed follows.
  useEffect(() => {
    const id = window.setInterval(() => {
      const next = parseVideoId(location.href)
      setVideoId((cur) => (cur === next ? cur : next))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const load = useCallback(async () => {
    if (!videoId) return
    setLoading(true)
    setError(null)
    try {
      setComments(await getComments(supabase, videoId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [videoId])

  useEffect(() => {
    if (open && videoId) void load()
  }, [open, videoId, load])

  if (isFullscreen || !open || !videoId) return null

  return (
    <Rail
      comments={comments}
      loading={loading}
      error={error}
      onRefresh={() => void load()}
      onClose={() => setOpen(false)}
    />
  )
}
