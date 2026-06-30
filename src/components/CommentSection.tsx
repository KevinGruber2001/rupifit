import { useState } from 'react'

interface CommentItem {
  id: string
  name: string
  body: string
}

export default function CommentSection({
  comments,
  onAdd,
}: {
  comments: CommentItem[]
  onAdd: (body: string) => void
}) {
  const [body, setBody] = useState('')

  function submit() {
    const trimmed = body.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setBody('')
  }

  return (
    <div className="px-1 pt-2">
      {comments.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {comments.map((c) => (
            <p key={c.id} className="text-sm leading-snug">
              <span className="font-semibold">{c.name}</span> {c.body}
            </p>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Add a comment…"
          className="flex-1 text-sm bg-border/30 rounded-btn px-3 py-2 outline-none"
        />
        <button
          onClick={submit}
          disabled={!body.trim()}
          className="text-sm font-semibold text-primary disabled:opacity-40"
        >
          Post
        </button>
      </div>
    </div>
  )
}