import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Camera } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../context/SessionContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'

function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
  })
}

export default function Profile() {
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useProfile(session?.user.id)

  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session) return
    setUploadingAvatar(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/avatar.${ext}`

      await supabase.storage.from('avatars').remove([path])
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('participants')
        .update({ avatar_url: `${urlData.publicUrl}?t=${Date.now()}` })
        .eq('id', session.user.id)
      if (updateError) throw updateError

      queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] })
    } catch (e) {
      console.error(e)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveName = async () => {
    if (!session || !name.trim()) return
    setSavingName(true)
    const { error } = await supabase
      .from('participants')
      .update({ name: name.trim() })
      .eq('id', session.user.id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] })
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      setEditingName(false)
    }
    setSavingName(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background px-4 pb-28">
      <header className="py-5">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4 py-6">
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="relative w-24 h-24"
          disabled={uploadingAvatar}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-subtle flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {profile?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
            <Camera size={14} className="text-surface" />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-surface/70 flex items-center justify-center">
              <span className="text-xs text-muted">...</span>
            </div>
          )}
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {/* Name */}
        {editingName ? (
          <div className="flex gap-2 w-full max-w-xs">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-btn px-3 py-2 text-base text-foreground outline-none focus:border-primary text-center"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName}
              className="bg-primary text-surface px-4 rounded-btn text-sm font-medium disabled:opacity-50"
            >
              {savingName ? '...' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setName(profile?.name ?? ''); setEditingName(true) }}
            className="text-lg font-semibold text-foreground underline decoration-dotted underline-offset-4"
          >
            {profile?.name}
          </button>
        )}
        <p className="text-sm text-muted -mt-2">tap name to edit</p>
      </div>

      {/* Sign out */}
      <div className="mt-8">
        <button
          onClick={handleSignOut}
          className="w-full border border-error/30 text-error rounded-card py-4 text-sm font-medium"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
