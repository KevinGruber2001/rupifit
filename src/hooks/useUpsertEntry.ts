import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DailyEntry, DailyEntryInput } from '../lib/types'

export function useInsertEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: DailyEntryInput): Promise<DailyEntry> => {
      const { data, error } = await supabase
        .from('daily_entries')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const month = data.date.slice(0, 7)
      queryClient.invalidateQueries({ queryKey: ['entries', data.participant_id, month] })
    },
  })
}
