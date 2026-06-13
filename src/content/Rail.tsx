import type { Comment } from '../lib/types'

interface RailProps {
  comments: Comment[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onClose: () => void
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/**
 * Presentational comment rail. State (open/closed, current video, fetching) is
 * owned by RailApp; this component only renders what it's given. For the
 * foundation slice it is read-only — posting, likes, spoilers and reporting
 * arrive in later slices.
 */
export function Rail({ comments, loading, error, onRefresh, onClose }: RailProps) {
  return (
    <aside className="fixed right-0 top-0 z-[2147483647] flex h-screen w-80 flex-col border-l border-neutral-700 bg-neutral-900 font-sans text-sm text-neutral-100 shadow-2xl">
      <header className="flex items-center justify-between border-b border-neutral-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide text-red-500">Flixter</span>
          <span className="text-neutral-400">comments</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="rounded px-2 py-1 text-neutral-300 hover:bg-neutral-800"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-neutral-300 hover:bg-neutral-800"
            title="Close"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading && <p className="px-1 py-4 text-neutral-400">Loading comments…</p>}

        {error && !loading && (
          <p className="px-1 py-4 text-red-400">Couldn’t load comments: {error}</p>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="px-1 py-8 text-center text-neutral-400">
            <p className="font-medium text-neutral-300">No comments yet</p>
            <p className="mt-1 text-xs">Be the first to say something about this title.</p>
          </div>
        )}

        {!loading &&
          !error &&
          comments.map((c) => (
            <article key={c.id} className="border-b border-neutral-800 px-1 py-2 last:border-b-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-neutral-200">{c.authorUsername}</span>
                <span className="shrink-0 text-xs text-neutral-500">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-neutral-100">{c.body}</p>
            </article>
          ))}
      </div>
    </aside>
  )
}
