import { supabase } from './supabase'

const FUNCTION_NAME = import.meta.env.VITE_CHAT_FUNCTION || 'chat'

/**
 * 취업 코칭 챗봇 호출.
 * Supabase Edge Function('chat')을 통해 OpenAI를 프록시 호출한다.
 * (OpenAI 키는 서버 시크릿에만 존재 → 브라우저에 노출 안 됨)
 *
 * @param {{role:'user'|'assistant', content:string}[]} messages
 * @returns {Promise<string>} 어시스턴트 답변
 */
export async function sendChat(messages, { mode = 'coach', talents } = {}) {
  if (!supabase) {
    throw new Error('Supabase 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.')
  }

  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { mode, messages, ...(talents ? { talents } : {}) },
  })

  if (error) {
    // Edge Function이 4xx/5xx를 반환하면 본문을 같이 보여준다.
    let detail = ''
    try { detail = await error.context?.text?.() } catch (_) {}
    throw new Error(detail || error.message || '챗봇 호출에 실패했습니다.')
  }

  if (data?.error) throw new Error(data.error)
  return data?.reply ?? ''
}
