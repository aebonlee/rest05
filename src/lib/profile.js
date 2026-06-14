import { supabase } from './supabase'
import { computeScores } from '../data/assessment'

const TABLE = 'rest05_profiles'

/** 내 프로필 조회(없으면 null) */
export async function getMyProfile(userId) {
  if (!supabase || !userId) return null
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

/**
 * 내 프로필 등록/수정(upsert).
 * 점검항목 자가 점검 결과를 동일한 객관 배점으로 점수화해 함께 저장한다.
 * verified=false / review_status='검토대기' 로 두어 증빙 검토 후 확정한다.
 */
export async function upsertMyProfile(user, form) {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  if (!user) throw new Error('로그인이 필요합니다.')

  const checklist = Array.from(form.checklist || [])
  const scores = computeScores(form.field, new Set(checklist))

  const payload = {
    id: user.id,
    email: user.email,
    name: form.name?.trim() || null,
    field: form.field || null,
    headline: form.headline?.trim() || null,
    blurb: form.blurb?.trim() || null,
    skills: (form.skills || []).map((s) => s.trim()).filter(Boolean),
    status: form.status || '구직중',
    is_public: !!form.is_public,
    is_neet: !!form.is_neet,
    phone: form.phone?.trim() || null,
    edu_text: form.edu_text?.trim() || null,
    cert_text: form.cert_text?.trim() || null,
    career_text: form.career_text?.trim() || null,
    website_url: form.website_url?.trim() || null,
    portfolio_url: form.portfolio_url?.trim() || null,
    documents: form.documents || [],
    checklist,
    // 객관 배점 기반 자가 점검 점수(검토 전 임시). 검토 후 관리자가 확정.
    score_education: scores.education,
    score_cert: scores.cert,
    score_career: scores.career,
    score_portfolio: scores.portfolio,
    // 역량평가 축: AI 역량평가 점수가 있으면 우선(더 객관적), 없으면 체크리스트 점수
    score_assessment: form.ai_score != null ? form.ai_score : scores.assessment,
    ai_score: form.ai_score != null ? form.ai_score : null,
    ai_feedback: form.ai_feedback || null,
    verified: false,
    review_status: '검토대기',
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from(TABLE).upsert(payload).select().single()
  if (error) throw new Error(error.message)
  return data
}

/** 증빙서류 업로드 → Storage 경로 반환 (rest05-docs/<uid>/<ts>-<name>) */
export async function uploadEvidence(user, file) {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  if (!user) throw new Error('로그인이 필요합니다.')
  const safe = file.name.replace(/[^\w.\-가-힣]/g, '_')
  const path = `${user.id}/${Date.now()}-${safe}`
  const { error } = await supabase.storage.from('rest05-docs').upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)
  return path
}

/** 증빙서류 삭제 */
export async function removeEvidence(path) {
  if (!supabase) return
  await supabase.storage.from('rest05-docs').remove([path])
}
