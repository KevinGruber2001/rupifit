export default function LikeButton({
  liked,
  count,
  onToggle,
}: {
  liked: boolean
  count: number
  onToggle: () => void
}) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 text-sm font-semibold">
      <span className={`text-lg transition-transform ${liked ? 'scale-110' : ''}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span className={liked ? 'text-foreground' : 'text-muted'}>{count}</span>
    </button>
  )
}