import { supabase } from './supabase'

const FUNCTION_NAME = import.meta.env.VITE_CHAT_FUNCTION || 'chat'

async function invoke(body) {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body })
  if (error) {
    let detail = ''
    try { detail = await error.context?.text?.() } catch (_) {}
    throw new Error(detail || error.message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

/** 직무별 공정·다양한 역량평가 질문 생성 */
export async function getQuestions(field, count = 5) {
  const data = await invoke({ mode: 'questions', field, count })
  return data.questions || []
}

/** 답변을 공정 기준으로 채점 → { score, feedback, strengths, improvements } */
export async function gradeAnswers(field, qa) {
  return invoke({ mode: 'grade', field, qa })
}
