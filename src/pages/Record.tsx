import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, ImagePlus, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../context/SessionContext'
import type { EntryStatus } from '../lib/types'

const STATUS_OPTIONS: { status: EntryStatus; label: string; emoji: string }[] = [
  { status: 'done', label: 'Workout', emoji: '💪' },
  { status: 'cheat', label: 'Cheat Day', emoji: '🍕' },
  { status: 'sick', label: 'Sick Leave', emoji: '🤒' },
]

const WORKOUT_CATEGORIES = [
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'gym', label: 'Gym', emoji: '🏋️' },
  { value: 'padel', label: 'Padel', emoji: '🎾' },
  { value: 'other', label: 'Other', emoji: '✏️' },
]

export default function Record() {
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [status, setStatus] = useState<EntryStatus | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [customCategory, setCustomCategory] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusSelect = (s: EntryStatus) => {
    setStatus(s)
    setStep(2)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!session || !status) return
    setLoading(true)
    setError(null)

    try {
      let photo_url: string | null = null

      if (photo) {
        const ext = photo.name.split('.').pop()
        const path = `${session.user.id}/${new Date().toISOString().slice(0, 10)}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('daily-photos')
          .upload(path, photo)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('daily-photos')
          .getPublicUrl(path)
        photo_url = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('daily_entries')
        .insert({
          participant_id: session.user.id,
          date: new Date().toISOString().slice(0, 10),
          status,
          category: status === 'done' ? (category === 'other' ? customCategory.trim() || 'other' : category) : null,
          photo_url,
          notes: notes || null,
        })
      if (insertError) throw insertError

      await queryClient.invalidateQueries({ queryKey: ['entries'] })
      await queryClient.invalidateQueries({ queryKey: ['all-entries'] })
      navigate('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Step 1 — pick status
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 gap-4 bg-background">
        <h2 className="text-2xl font-bold text-foreground mb-2">What's today?</h2>
        {STATUS_OPTIONS.map(({ status, label, emoji }) => (
          <button
            key={status}
            onClick={() => handleStatusSelect(status)}
            className="w-full bg-surface border border-border rounded-card p-5 flex items-center gap-4 active:bg-background transition-colors"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="text-lg font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  // Step 2 — photo + notes
  const photoRequired = status === 'done'
  const showPhoto = status !== 'sick'
  const categoryRequired = status === 'done'
  const isDisabled = loading
    || (photoRequired && !photo)
    || (categoryRequired && !category)
    || (category === 'other' && !customCategory.trim())

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-28 gap-6 bg-background">
      <button
        onClick={() => setStep(1)}
        className="flex items-center gap-2 text-muted w-fit"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      <h2 className="text-2xl font-bold text-foreground">
        {status === 'done' ? 'Workout' : status === 'cheat' ? 'Cheat Day' : 'Sick Leave'}
      </h2>

      {showPhoto && (
        <div className="flex flex-col gap-2">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                className="w-full rounded-card object-cover aspect-square"
              />
              <button
                onClick={() => { setPhoto(null); setPreview(null) }}
                className="absolute top-3 right-3 bg-foreground/50 text-surface text-xs px-3 py-1 rounded-full"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 bg-surface border border-border rounded-card py-8 flex flex-col items-center gap-2 text-muted active:bg-background"
              >
                <Camera size={24} />
                <span className="text-sm">Camera</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 bg-surface border border-border rounded-card py-8 flex flex-col items-center gap-2 text-muted active:bg-background"
              >
                <ImagePlus size={24} />
                <span className="text-sm">Gallery</span>
              </button>
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {photoRequired && !photo && (
            <p className="text-xs text-muted">A photo is required for workouts</p>
          )}
        </div>
      )}

      {/* Category picker — workout only */}
      {status === 'done' && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {WORKOUT_CATEGORIES.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`border rounded-btn py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors
                  ${category === value
                    ? 'bg-primary-subtle border-primary text-primary'
                    : 'bg-surface border-border text-muted'
                  }`}
              >
                <span className="text-xl">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
          {category === 'other' && (
            <input
              autoFocus
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Swimming, Yoga..."
              className="w-full bg-surface border border-border rounded-btn px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
            />
          )}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={status === 'sick' ? 'How are you feeling? (optional)' : 'Add a note... (optional)'}
        rows={3}
        className="w-full bg-surface border border-border rounded-card px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary resize-none transition-colors"
      />

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full bg-foreground text-surface rounded-btn py-4 font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
