import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수가 없어도 사이트는 동작하도록(챗봇만 비활성) 안전하게 생성.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseReady = Boolean(supabase)
