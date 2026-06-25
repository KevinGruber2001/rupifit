import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DailyEntry } from '../lib/types'

export function useAllEntries(month: string) {
  return useQuery({
    queryKey: ['all-entries', month],
    queryFn: async (): Promise<DailyEntry[]> => {
      const [year, monthNum] = month.split('-').map(Number)
      const lastDay = new Date(year, monthNum, 0).getDate()

      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .gte('date', `${month}-01`)
        .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
        .order('date')

      if (error) throw error
      return data
    },
  })
}
