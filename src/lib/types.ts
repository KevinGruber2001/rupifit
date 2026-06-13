export type EntryStatus = 'done' | 'cheat' | 'sick' | 'missed'

export interface Participant {
  id: string
  name: string
  created_at: string
}

export interface DailyEntry {
  id: string
  participant_id: string
  date: string // 'YYYY-MM-DD'
  category: string | null
  status: EntryStatus
  photo_url: string | null
  notes: string | null
  created_at: string
}

// Fields needed to create/update an entry
export type DailyEntryInput = Pick<
  DailyEntry,
  'participant_id' | 'date' | 'status'
> &
  Partial<Pick<DailyEntry, 'category' | 'photo_url' | 'notes'>>
