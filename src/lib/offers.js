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
