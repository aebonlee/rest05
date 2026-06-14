import { supabase } from './supabase'

// 로그인 후 돌아올 주소(현재 페이지)
const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
}

export async function signInWithKakao() {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  return supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo } })
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user ?? null
}

/** 인증 상태 변화 구독. 해제 함수를 반환. */
export function onAuthChange(cb) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null)
  })
  return () => data?.subscription?.unsubscribe?.()
}
