import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'COLA_AQUI_O_PROJECT_URL_DO_PASSO_4'
const SUPABASE_KEY = 'COLA_AQUI_A_ANON_KEY_DO_PASSO_4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
