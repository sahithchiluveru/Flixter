import type { SupabaseClient } from '@supabase/supabase-js'
import type { Comment } from './types'

// The data-access module is the highest test seam: it owns every query against
// Supabase. Functions take the client as an argument so tests can point them at
// a local Supabase instance while the extension passes its shared client.

interface CommentRow {
  id: string
  video_id: string
  body: string
  is_spoiler: boolean
  created_at: string
  author: { username: string } | { username: string }[] | null
}

function rowToComment(row: CommentRow): Comment {
  const author = Array.isArray(row.author) ? row.author[0] : row.author
  return {
    id: row.id,
    videoId: row.video_id,
    body: row.body,
    isSpoiler: row.is_spoiler,
    createdAt: row.created_at,
    authorUsername: author?.username ?? 'unknown',
  }
}

/**
 * Returns non-deleted comments for a video, newest first. RLS guarantees only
 * non-deleted rows are visible, but we also filter explicitly so the intent is
 * clear and the query stays correct if policies change.
 */
export async function getComments(
  client: SupabaseClient,
  videoId: string,
): Promise<Comment[]> {
  const { data, error } = await client
    .from('comments')
    .select('id, video_id, body, is_spoiler, created_at, author:profiles(username)')
    .eq('video_id', videoId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as CommentRow[] | null)?.map(rowToComment) ?? []
}
