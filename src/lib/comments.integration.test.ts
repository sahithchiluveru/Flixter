import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getComments } from './comments'

// These tests run against a local Supabase instance (`npm run db:start`, which
// needs Docker). They are skipped unless the local connection env vars are set,
// so `npm run test:unit` and CI without Docker stay green.
//
//   export SUPABASE_URL=http://127.0.0.1:54321
//   export SUPABASE_ANON_KEY=<anon key from `supabase start`>
//   export SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase start`>

const url = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const configured = Boolean(url && anonKey && serviceKey)

// Use a unique video id per run so the test is isolated from seed data.
const videoId = `test-${Date.now()}`
const authorId = '33333333-3333-3333-3333-333333333333'

describe.skipIf(!configured)('getComments (integration)', () => {
  let admin: SupabaseClient
  let anon: SupabaseClient

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, { auth: { persistSession: false } })
    anon = createClient(url!, anonKey!, { auth: { persistSession: false } })

    await admin.from('profiles').upsert({ id: authorId, username: 'integration-tester' })

    // Two visible comments (different timestamps) and one deleted comment.
    const { error } = await admin.from('comments').insert([
      { video_id: videoId, author_id: authorId, body: 'first', created_at: '2024-01-01T00:00:00Z' },
      { video_id: videoId, author_id: authorId, body: 'second', created_at: '2024-01-02T00:00:00Z' },
      { video_id: videoId, author_id: authorId, body: 'deleted', is_deleted: true },
    ])
    if (error) throw error
  })

  afterAll(async () => {
    await admin.from('comments').delete().eq('video_id', videoId)
    await admin.from('profiles').delete().eq('id', authorId)
  })

  it('returns non-deleted comments newest-first, readable by anon', async () => {
    const comments = await getComments(anon, videoId)
    expect(comments.map((c) => c.body)).toEqual(['second', 'first'])
  })

  it('excludes soft-deleted comments', async () => {
    const comments = await getComments(anon, videoId)
    expect(comments.some((c) => c.body === 'deleted')).toBe(false)
  })

  it('includes the author username from profiles', async () => {
    const comments = await getComments(anon, videoId)
    expect(comments[0]?.authorUsername).toBe('integration-tester')
  })

  it('returns an empty list for a video with no comments', async () => {
    expect(await getComments(anon, `empty-${Date.now()}`)).toEqual([])
  })
})
