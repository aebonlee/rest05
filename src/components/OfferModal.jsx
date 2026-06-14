import { useState, useEffect } from 'react'
import { isSupabaseReady } from '../lib/supabase'
import { sendOffer } from '../lib/offers'

export default function OfferModal({ talent, onClose }) {
  const [form, setForm] = useState({ company: '', contact: '', message: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (talent) { setForm({ company: '', contact: '', message: '' }); setDone(false); setError('') }
  }, [talent])

  if (!talent) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError('')
    setSending(true)
    try {
      await sendOffer({ talentId: talent.id || null, company: form.company, contact: form.contact, message: form.message })
      setDone(true)
    } catch (e) { setError(e.message) } finally { setSending(false) }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={closeX} aria-label="닫기">✕</button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🤝</div>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>채용 제의가 전달되었어요!</h3>
            <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 10, lineHeight: 1.6 }}>
              <b>{talent.name}</b> 인재에게 제의가 전송되었습니다.<br />드림아이티비즈가 매칭을 도와드립니다.
            </p>
            <button onClick={onClose} style={{ ...primaryBtn, marginTop: 22 }}>확인</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8623D', letterSpacing: '0.04em' }}>JOB OFFER</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6 }}>{talent.name} 인재에게 채용 제의</h3>
            <p style={{ fontSize: 14, color: '#5C6B7A', marginTop: 8 }}>{talent.field} · 인증 점수 기반 매칭. 담당자 정보를 남기면 연결해 드립니다.</p>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={inp} value={form.company} onChange={set('company')} placeholder="회사명 *" />
              <input style={inp} value={form.contact} onChange={set('contact')} placeholder="담당자 이메일 또는 연락처 *" />
              <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.message} onChange={set('message')} placeholder="제안 직무·조건·메시지" />
            </div>

            {!isSupabaseReady && <p style={warn}>Supabase 환경변수가 없어 전송이 비활성 상태입니다.</p>}
            {error && <p style={warn}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button onClick={onClose} style={ghostBtn}>취소</button>
              <button onClick={submit} disabled={sending || !isSupabaseReady} style={{ ...primaryBtn, opacity: sending ? 0.6 : 1 }}>{sending ? '전송 중…' : '제의 보내기'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,37,64,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' }
const card = { position: 'relative', width: 'min(440px, 100%)', background: '#fff', borderRadius: 22, padding: '32px 30px', boxShadow: '0 30px 80px rgba(15,37,64,0.3)', animation: 'chatPop .22s ease both' }
const closeX = { position: 'absolute', right: 16, top: 16, cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 16, color: '#8A96A3' }
const inp = { width: '100%', border: '1px solid #DCE1E6', borderRadius: 10, padding: '12px 13px', fontSize: 14.5, fontFamily: 'inherit', outline: 'none', color: '#0F2540' }
const primaryBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '12px 24px', borderRadius: 12, border: 'none', background: '#E8623D', color: '#fff', fontFamily: 'inherit' }
const ghostBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '12px 20px', borderRadius: 12, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540', fontFamily: 'inherit' }
const warn = { fontSize: 13, color: '#C2451F', background: '#FDEBE4', padding: '10px 12px', borderRadius: 8, marginTop: 14 }
