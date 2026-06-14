import { supabase } from './supabase'

const TABLE = 'rest05_offers'

/** 기업 → 인재 채용 제의 등록 */
export async function sendOffer({ talentId, company, contact, message }) {
  if (!supabase) throw new Error('Supabase가 설정되지 않았습니다.')
  if (!company?.trim() || !contact?.trim()) throw new Error('회사명과 연락처는 필수입니다.')
  const { error } = await supabase.from(TABLE).insert({
    talent_id: talentId,
    company: company.trim(),
    contact: contact.trim(),
    message: message?.trim() || null,
  })
  if (error) throw new Error(error.message)
  return true
}

/** 내가 받은 채용 제의 목록 (RLS: 본인 talent_id만 조회 가능) */
export async function fetchMyOffers(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('id,company,contact,message,created_at')
    .eq('talent_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.warn('[rest05] 제의 조회 실패:', error.message); return [] }
  return data || []
}
