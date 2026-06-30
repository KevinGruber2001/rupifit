import { useState, useCallback } from 'react'

interface Comment {
  id: string
  participantId: string
  name: string
  body: string
  createdAt: string
}

interface EngagementState {
  likes: Record<string, string[]> // entryId -> participantIds who liked
  comments: Record<string, Comment[]> // entryId -> comments
}

export function useLocalEngagement() {
  const [state, setState] = useState<EngagementState>({ likes: {}, comments: {} })

  const toggleLike = useCallback((entryId: string, participantId: string) => {
    setState((prev) => {
      const current = prev.likes[entryId] ?? []
      const alreadyLiked = current.includes(participantId)
      const next = alreadyLiked
        ? current.filter((id) => id !== participantId)
        : [...current, participantId]
      return { ...prev, likes: { ...prev.likes, [entryId]: next } }
    })
  }, [])

  const addComment = useCallback((entryId: string, participantId: string, name: string, body: string) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      participantId,
      name,
      body,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      comments: {
        ...prev.comments,
        [entryId]: [...(prev.comments[entryId] ?? []), comment],
      },
    }))
  }, [])

  return { likes: state.likes, comments: state.comments, toggleLike, addComment }
}