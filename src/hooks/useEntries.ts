import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DailyEntry } from '../lib/types'

// month format: 'YYYY-MM'
export function useEntries(participantId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['entries', participantId, month],
    enabled: !!participantId && !!month,
    queryFn: async (): Promise<DailyEntry[]> => {
      const start = `${month}-01`
      // simple end-of-month bound; works fine for date range filtering
      const end = `${month}-31`

      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('participant_id', participantId)
        .gte('date', start)
        .lte('date', end)
        .order('date')

      if (error) throw error
      return data
    },
  })
}
