import { supabase } from './supabase'

// rest05_profiles 행 → 인재 카드 형태로 변환
function rowToTalent(r) {
  return {
    id: r.id,
    field: r.field || '기타',
    name: r.name || '익명',
    headline: r.headline || '',
    status: r.status || '구직중',
    blurb: r.blurb || '',
    skills: r.skills || [],
    scores: {
      education: r.score_education ?? 0,
      cert: r.score_cert ?? 0,
      career: r.score_career ?? 0,
      portfolio: r.score_portfolio ?? 0,
      assessment: r.score_assessment ?? 0,
    },
    website: r.website_url || null,
    portfolio: r.portfolio_url || null,
    isNeet: !!r.is_neet,
  }
}

/**
 * 공개 + 인증 완료된 인재를 점수 높은 순으로 로드.
 * 테이블이 아직 없거나 Supabase 미설정이면 null 반환(→ 호출측에서 샘플로 폴백).
 */
export async function fetchPublicTalents() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('rest05_profiles')
    .select('id,name,field,headline,blurb,skills,status,website_url,portfolio_url,is_neet,review_status,is_public,score_education,score_cert,score_career,score_portfolio,score_assessment,score_total')
    .eq('is_public', true)
    .eq('review_status', '인증완료')
    .order('score_total', { ascending: false })
    .limit(200)

  if (error) {
    // 테이블 미생성 등은 조용히 폴백
    console.warn('[rest05] 인재 로드 실패, 샘플로 대체:', error.message)
    return null
  }
  return (data || []).map(rowToTalent)
}
