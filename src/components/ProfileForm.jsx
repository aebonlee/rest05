import { useEffect, useMemo, useState } from 'react'
import { isSupabaseReady } from '../lib/supabase'
import { getUser, signInWithGoogle, signInWithKakao } from '../lib/auth'
import { getMyProfile, upsertMyProfile, uploadEvidence, removeEvidence } from '../lib/profile'
import { getQuestions, gradeAnswers } from '../lib/assess'
import { FILTERS, DIMENSIONS, totalScore } from '../data/talents'
import { itemsByDimension, computeScores } from '../data/assessment'

const FIELD_OPTIONS = FILTERS.filter((f) => f !== '전체')
const STATUS_OPTIONS = ['구직중', '채용제의 수신중', '비공개']

const EMPTY = {
  name: '', field: '', headline: '', blurb: '', skills: [], status: '구직중',
  is_public: false, is_neet: false, phone: '', edu_text: '', cert_text: '', career_text: '',
  website_url: '', portfolio_url: '', documents: [], checklist: [], ai_score: null, ai_feedback: '',
}

export default function ProfileForm({ open, onClose }) {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(''); setSaved(null)
    getUser().then(async (u) => {
      setUser(u)
      if (!u) return
      setLoading(true)
      try {
        const p = await getMyProfile(u.id)
        if (p) {
          setForm({
            name: p.name || '', field: p.field || '', headline: p.headline || '', blurb: p.blurb || '',
            skills: p.skills || [], status: p.status || '구직중', is_public: !!p.is_public, is_neet: !!p.is_neet,
            phone: p.phone || '', edu_text: p.edu_text || '', cert_text: p.cert_text || '', career_text: p.career_text || '',
            website_url: p.website_url || '', portfolio_url: p.portfolio_url || '', documents: p.documents || [],
            checklist: p.checklist || [], ai_score: p.ai_score ?? null, ai_feedback: p.ai_feedback || '',
          })
          setSaved(p)
        } else {
          setForm({ ...EMPTY, name: u.user_metadata?.name || u.user_metadata?.full_name || '' })
        }
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    })
  }, [open])

  // 실시간 점수
  const live = useMemo(() => {
    const s = computeScores(form.field, new Set(form.checklist))
    if (form.ai_score != null) s.assessment = form.ai_score
    return { dims: s, total: totalScore(s) }
  }, [form.field, form.checklist, form.ai_score])

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleCheck = (label) => setForm((f) => ({
    ...f, checklist: f.checklist.includes(label) ? f.checklist.filter((x) => x !== label) : [...f.checklist, label],
  }))
  const addSkill = () => {
    const v = skillInput.trim()
    if (v && !form.skills.includes(v)) setForm((f) => ({ ...f, skills: [...f.skills, v] }))
    setSkillInput('')
  }
  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploading(true); setError('')
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { setError(`${file.name}: 10MB를 초과합니다.`); continue }
        const path = await uploadEvidence(user, file)
        setForm((f) => ({ ...f, documents: [...f.documents, path] }))
      }
    } catch (e) { setError(e.message) } finally { setUploading(false) }
  }
  const dropDoc = async (path) => {
    setForm((f) => ({ ...f, documents: f.documents.filter((p) => p !== path) }))
    try { await removeEvidence(path) } catch (_) {}
  }

  const submit = async () => {
    setError('')
    if (!form.name.trim()) return setError('이름을 입력해 주세요.')
    if (!form.field) return setError('직무 분야를 선택해 주세요.')
    setSaving(true)
    try { setSaved(await upsertMyProfile(user, form)) }
    catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const showSaved = saved && !saving && saved.name === form.name && !!form.name

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={closeX} aria-label="닫기">✕</button>

        <div style={{ padding: '26px 30px 18px', borderBottom: '1px solid #EAEDF0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E8623D', letterSpacing: '0.04em' }}>TALENT REGISTRATION</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6 }}>인재 프로필 등록</h3>
          <p style={{ fontSize: 14, color: '#5C6B7A', marginTop: 8, lineHeight: 1.6 }}>
            모든 지원자에게 <b style={{ color: '#0F2540' }}>동일한 객관 기준</b>이 공정하게 적용됩니다. 점검항목·증빙·AI 역량평가로 산출된 점수는
            드림아이티비즈 검토 후 인증 확정됩니다.
          </p>
        </div>

        <div style={{ overflowY: 'auto', padding: '22px 30px 8px' }}>
          {!user ? (
            <LoginPrompt />
          ) : loading ? (
            <p style={{ padding: '24px 0', color: '#8A96A3' }}>불러오는 중…</p>
          ) : showSaved ? (
            <SavedCard saved={saved} onEdit={() => setSaved(null)} onClose={onClose} />
          ) : (
            <>
              <Row>
                <Field label="이름 *"><input style={inp} value={form.name} onChange={set('name')} placeholder="홍길동" /></Field>
                <Field label="직무 분야 *">
                  <select style={inp} value={form.field} onChange={set('field')}>
                    <option value="">선택</option>
                    {FIELD_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </Row>

              <Field label="한 줄 소개"><input style={inp} value={form.headline} onChange={set('headline')} placeholder="React로 사용자 경험을 설계하는 프론트엔드 개발자" /></Field>
              <Field label="자기소개"><textarea style={ta} value={form.blurb} onChange={set('blurb')} placeholder="강점, 관심 분야, 대표 성과를 자유롭게 적어주세요." /></Field>

              <Field label="기술 스택">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={inp} value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="입력 후 Enter (예: React)" />
                  <button onClick={addSkill} style={addBtn}>추가</button>
                </div>
                {form.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {form.skills.map((s) => <span key={s} style={tag} onClick={() => removeSkill(s)}>{s} <span style={{ color: '#C2451F' }}>✕</span></span>)}
                  </div>
                )}
              </Field>

              {/* 개인 웹 / 포트폴리오 */}
              <Row>
                <Field label="개인 자기소개 웹"><input style={inp} value={form.website_url} onChange={set('website_url')} placeholder="https://나의-홈페이지.com" /></Field>
                <Field label="포트폴리오 링크"><input style={inp} value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://github.com/… / 노션" /></Field>
              </Row>

              {/* 증빙 텍스트 */}
              <SectionBox title="실력 증빙" desc={`아래 내용과 서류로 ${DIMENSIONS.map((d) => d.label).join(' · ')} 5개 축을 객관적으로 검증합니다.`}>
                <Field label="학력"><input style={inp} value={form.edu_text} onChange={set('edu_text')} placeholder="○○대학교 컴퓨터공학과 졸업 등" /></Field>
                <Field label="자격 · 수료"><input style={inp} value={form.cert_text} onChange={set('cert_text')} placeholder="정보처리기사, ○○ 부트캠프 수료 등" /></Field>
                <Field label="경력 · 프로젝트"><textarea style={ta} value={form.career_text} onChange={set('career_text')} placeholder="인턴/프로젝트 경험·역할·성과" /></Field>

                {/* 증빙서류 업로드 */}
                <Field label="증빙서류 업로드 (학위·자격·경력증명 등, 비공개)">
                  <label style={uploadBox}>
                    <input type="file" multiple onChange={onFiles} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.hwp,.zip" />
                    {uploading ? '업로드 중…' : '＋ 파일 선택 (최대 10MB/개)'}
                  </label>
                  {form.documents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {form.documents.map((p) => (
                        <div key={p} style={docRow}>
                          <span style={{ fontSize: 13, color: '#3C4A5A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {p.split('/').pop()}</span>
                          <button onClick={() => dropDoc(p)} style={{ border: 'none', background: 'transparent', color: '#C2451F', cursor: 'pointer', fontSize: 13 }}>삭제</button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </SectionBox>

              {/* 직무 역량 점검 (객관 배점) */}
              {form.field ? (
                <SectionBox title={`직무 역량 점검 · ${form.field}`} desc="갖춘 항목을 체크하면 동일 배점이 적용돼 점수로 환산됩니다. (검토 후 확정)">
                  {itemsByDimension(form.field).map((dim) => (
                    <div key={dim.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#0F2540', marginBottom: 6 }}>
                        <span>{dim.label}</span><span style={{ color: '#E8623D' }}>{live.dims[dim.key]}점</span>
                      </div>
                      {dim.items.map((it) => (
                        <label key={it.label} style={checkRow}>
                          <input type="checkbox" checked={form.checklist.includes(it.label)} onChange={() => toggleCheck(it.label)} style={{ marginTop: 2 }} />
                          <span style={{ flex: 1, fontSize: 13.5, color: '#3C4A5A', lineHeight: 1.45 }}>{it.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#8A96A3' }}>+{it.points}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </SectionBox>
              ) : (
                <p style={hintBox}>직무 분야를 먼저 선택하면 역량 점검 항목이 나타납니다.</p>
              )}

              {/* AI 역량평가 */}
              {form.field && <AiAssessment field={form.field} aiScore={form.ai_score}
                onResult={(score, feedback) => setForm((f) => ({ ...f, ai_score: score, ai_feedback: feedback }))} />}

              <Row>
                <Field label="구직 상태">
                  <select style={inp} value={form.status} onChange={set('status')}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                </Field>
                <Field label="연락처(비공개)"><input style={inp} value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" /></Field>
              </Row>

              <label style={checkLine}>
                <input type="checkbox" checked={form.is_neet} onChange={(e) => setForm((f) => ({ ...f, is_neet: e.target.checked }))} style={{ marginTop: 3 }} />
                <span style={checkText}><b>쉬었음 청년</b> 재취업 지원 대상입니다. (맞춤 지원·우선 코칭 제공)</span>
              </label>
              <label style={checkLine}>
                <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} style={{ marginTop: 3 }} />
                <span style={checkText}>인증 완료 시 인재풀에 <b>공개</b>하는 데 동의합니다. (기업 열람·채용 제의 가능)</span>
              </label>

              {/* 실시간 종합 점수 */}
              <div style={liveBar}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#FF8A6B' }}>예상 종합 인증 점수</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>5개 축 평균 · 검토 후 확정</div>
                </div>
                <div style={{ fontSize: 34, fontWeight: 800 }}>{live.total}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}> / 100</span></div>
              </div>

              {error && <p style={warn}>{error}</p>}
            </>
          )}
        </div>

        {user && !loading && !showSaved && (
          <div style={{ padding: '14px 30px 22px', borderTop: '1px solid #EAEDF0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose} style={ghostBtn}>취소</button>
            <button onClick={submit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>{saving ? '저장 중…' : '제출하기'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function AiAssessment({ field, aiScore, onResult }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const start = async () => {
    setErr(''); setLoading(true); setResult(null)
    try { setQuestions(await getQuestions(field, 5)); setAnswers({}) }
    catch (e) { setErr(e.message) } finally { setLoading(false) }
  }
  const grade = async () => {
    setErr(''); setGrading(true)
    try {
      const qa = questions.map((q, i) => ({ q, a: answers[i] || '' }))
      const r = await gradeAnswers(field, qa)
      setResult(r); onResult(r.score, r.feedback)
    } catch (e) { setErr(e.message) } finally { setGrading(false) }
  }

  return (
    <SectionBox title="AI 역량평가 (선택)" desc="AI가 직무별 다양한 질문으로 공정하게 채점해 '역량평가' 점수를 객관화합니다.">
      {aiScore != null && !result && <p style={{ fontSize: 13, color: '#1F9D6B', fontWeight: 700, marginBottom: 8 }}>✓ 이전 AI 평가 점수: {aiScore}점 (다시 평가하려면 시작)</p>}
      {questions.length === 0 ? (
        <button onClick={start} disabled={loading} style={aiBtn}>{loading ? '질문 생성 중…' : '🤖 AI 역량평가 시작'}</button>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2540', marginBottom: 6 }}>Q{i + 1}. {q}</div>
              <textarea style={ta} value={answers[i] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))} placeholder="답변을 입력하세요" />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={grade} disabled={grading} style={aiBtn}>{grading ? '채점 중…' : '채점 받기'}</button>
            <button onClick={start} disabled={loading} style={ghostBtn}>질문 다시 받기</button>
          </div>
        </>
      )}
      {result && (
        <div style={{ marginTop: 14, padding: 14, background: '#0F2540', color: '#fff', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FF8A6B' }}>AI 역량평가 점수</span>
            <span style={{ fontSize: 26, fontWeight: 800 }}>{result.score}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>/100</span></span>
          </div>
          {result.feedback && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 1.6 }}>{result.feedback}</p>}
        </div>
      )}
      {err && <p style={warn}>{err}</p>}
    </SectionBox>
  )
}

function LoginPrompt() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
      <p style={{ fontSize: 15, color: '#3C4A5A', lineHeight: 1.6 }}>프로필 등록은 로그인 후 이용할 수 있어요.<br />구글 또는 카카오로 간편 가입하세요.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '20px auto 0' }}>
        <button onClick={() => signInWithGoogle()} style={googleBtn} disabled={!isSupabaseReady}>Google로 계속하기</button>
        <button onClick={() => signInWithKakao()} style={kakaoBtn} disabled={!isSupabaseReady}>카카오로 계속하기</button>
      </div>
      {!isSupabaseReady && <p style={warn}>Supabase 환경변수가 없어 비활성 상태입니다.</p>}
    </div>
  )
}

function SavedCard({ saved, onEdit, onClose }) {
  const reviewed = saved.review_status === '인증완료'
  return (
    <div style={{ textAlign: 'center', padding: '14px 0 28px' }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{reviewed ? '✅' : '📨'}</div>
      <h4 style={{ fontSize: 20, fontWeight: 800 }}>{reviewed ? '인증이 완료되었어요!' : '프로필이 제출되었어요!'}</h4>
      <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 10, lineHeight: 1.6 }}>
        {reviewed ? `종합 인증 점수 ${saved.score_total ?? 0}점으로 인재풀에 등록되었습니다.`
          : '드림아이티비즈가 증빙을 검토해 인증 점수를 부여합니다. 인증 완료 후 인재풀에 공개돼요.'}
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '8px 16px', borderRadius: 999, background: reviewed ? '#E7F6EF' : '#FDEBE4', color: reviewed ? '#1F9D6B' : '#C2451F', fontWeight: 700, fontSize: 14 }}>● {saved.review_status || '검토대기'}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <button onClick={onEdit} style={ghostBtn}>프로필 수정</button>
        <button onClick={onClose} style={primaryBtn}>닫기</button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14, flex: 1 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3C4A5A', marginBottom: 6 }}>{label}</label>{children}</div>
}
function Row({ children }) { return <div style={{ display: 'flex', gap: 14 }} className="form-row">{children}</div> }
function SectionBox({ title, desc, children }) {
  return (
    <div style={{ marginTop: 18, padding: '16px 18px', background: '#FBFAF8', borderRadius: 14, border: '1px solid #F0EEEA' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F2540' }}>{title}</div>
      {desc && <p style={{ fontSize: 12.5, color: '#8A96A3', marginTop: 4, marginBottom: 14, lineHeight: 1.5 }}>{desc}</p>}
      {children}
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,37,64,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' }
const panel = { position: 'relative', width: 'min(580px, 100%)', maxHeight: 'calc(100vh - 48px)', background: '#fff', borderRadius: 22, boxShadow: '0 30px 80px rgba(15,37,64,0.3)', display: 'flex', flexDirection: 'column', animation: 'chatPop .22s ease both' }
const closeX = { position: 'absolute', right: 16, top: 16, cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 16, color: '#8A96A3', zIndex: 1 }
const inp = { width: '100%', border: '1px solid #DCE1E6', borderRadius: 10, padding: '11px 13px', fontSize: 14.5, fontFamily: 'inherit', outline: 'none', color: '#0F2540', background: '#fff' }
const ta = { ...inp, minHeight: 72, resize: 'vertical' }
const tag = { fontSize: 13, fontWeight: 600, color: '#5C6B7A', background: '#F2F4F6', padding: '5px 11px', borderRadius: 8, cursor: 'pointer' }
const addBtn = { flexShrink: 0, cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '0 16px', borderRadius: 10, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540' }
const primaryBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '12px 24px', borderRadius: 12, border: 'none', background: '#E8623D', color: '#fff' }
const ghostBtn = { cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '11px 18px', borderRadius: 12, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540' }
const aiBtn = { cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '11px 18px', borderRadius: 12, border: 'none', background: '#0F2540', color: '#fff' }
const googleBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540' }
const kakaoBtn = { cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none', background: '#FEE500', color: '#191600' }
const warn = { fontSize: 13, color: '#C2451F', background: '#FDEBE4', padding: '10px 12px', borderRadius: 8, marginTop: 14 }
const uploadBox = { display: 'block', textAlign: 'center', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#5C6B7A', border: '1.5px dashed #DCE1E6', borderRadius: 12, padding: '14px', background: '#fff' }
const docRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 12px', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 8 }
const checkRow = { display: 'flex', alignItems: 'flex-start', gap: 9, padding: '7px 0', cursor: 'pointer' }
const checkLine = { display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, cursor: 'pointer' }
const checkText = { fontSize: 13.5, color: '#3C4A5A', lineHeight: 1.5 }
const hintBox = { fontSize: 13.5, color: '#8A96A3', background: '#FBFAF8', border: '1px solid #F0EEEA', borderRadius: 12, padding: '14px 16px', marginTop: 18 }
const liveBar = { marginTop: 20, padding: '16px 20px', background: '#0F2540', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
