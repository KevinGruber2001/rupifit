import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Participant } from '../lib/types'

export function useParticipants() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: async (): Promise<Participant[]> => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })
}
