import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DailyEntry, DailyEntryInput } from '../lib/types'

export function useUpsertEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: DailyEntryInput): Promise<DailyEntry> => {
      const { data, error } = await supabase
        .from('daily_entries')
        .upsert(entry, { onConflict: 'participant_id,date' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidate the entries query for this participant/month so the UI refetches
      const month = data.date.slice(0, 7)
      queryClient.invalidateQueries({ queryKey: ['entries', data.participant_id, month] })
    },
  })
}
