import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DailyEntry } from '../lib/types'

export function useTodayEntries() {
  const today = new Date().toISOString().slice(0, 10)
  return useQuery({
    queryKey: ['today-entries', today],
    queryFn: async (): Promise<DailyEntry[]> => {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('date', today)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}
