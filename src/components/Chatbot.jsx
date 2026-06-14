import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../lib/chat'
import { isSupabaseReady } from '../lib/supabase'

const MODES = {
  coach: {
    icon: '🧵', title: 'AI 취업 코치', sub: '이력서 · 자소서 · 취업 상담', accent: '#E8623D',
    greeting: '안녕하세요! 드림아이티비즈 AI 취업 코치예요. 🧵\n취업 상담, 이력서 첨삭, 자기소개서 코칭을 도와드릴게요. 무엇을 도와드릴까요?',
    quick: ['이력서 한 줄 첨삭 받고 싶어요', '자기소개서 지원동기를 못 쓰겠어요', '프론트엔드 신입 취업 전략이 궁금해요'],
  },
  recruit: {
    icon: '🏢', title: 'AI 채용 어시스턴트', sub: '직무 파악 · 인재 추천', accent: '#0F2540',
    greeting: '안녕하세요, 기업 담당자님! 🏢\n찾으시는 직무와 조건을 알려주시면 인재풀에서 가장 적합한 인재를 추천해 드릴게요.',
    quick: ['React 가능한 프론트엔드 신입을 찾아요', '데이터 분석 인재를 추천해 주세요', '백엔드 경력직, 어떤 인재가 있나요?'],
  },
}

export default function Chatbot({ talents = [] }) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState(true)
  const [mode, setMode] = useState('coach')
  const [chats, setChats] = useState({ coach: [], recruit: [] })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const cfg = MODES[mode]
  const messages = chats[mode]

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chats, mode, loading, open])
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open, mode])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content }]
    setChats((c) => ({ ...c, [mode]: next }))
    setLoading(true)
    try {
      const opts = mode === 'recruit' ? { mode: 'recruit', talents } : { mode: 'coach' }
      const reply = await sendChat(next, opts)
      setChats((c) => ({ ...c, [mode]: [...next, { role: 'assistant', content: reply || '응답이 비어 있어요. 다시 시도해 주세요.' }] }))
    } catch (e) {
      setChats((c) => ({ ...c, [mode]: [...next, { role: 'assistant', content: `⚠️ 오류가 발생했어요.\n${e.message}` }] }))
    } finally { setLoading(false) }
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <>
      {/* 2종 안내 풍선도움말 */}
      {!open && hint && (
        <div style={{ position: 'fixed', right: 26, bottom: 100, zIndex: 100, width: 244, background: '#0F2540', color: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 14px 34px rgba(15,37,64,0.32)', animation: 'chatPop .3s ease both' }}>
          <button onClick={() => setHint(false)} aria-label="닫기" style={{ position: 'absolute', top: 8, right: 10, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}>✕</button>
          <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>AI 챗봇이 2개예요!</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.82)' }}>🧵 취준생 코치 · 🏢 기업 인재추천<br />아래 버튼을 눌러 탭에서 전환하세요.</div>
          <div style={{ position: 'absolute', right: 24, bottom: -7, width: 14, height: 14, background: '#0F2540', transform: 'rotate(45deg)' }} />
        </div>
      )}

      <button onClick={() => { setOpen((o) => !o); setHint(false) }} aria-label="챗봇 열기"
        style={{ position: 'fixed', right: 26, bottom: 26, zIndex: 100, width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer', background: open ? '#0F2540' : '#E8623D', color: '#fff', fontSize: 26, boxShadow: '0 14px 34px rgba(232,98,61,0.42)', transition: 'transform .15s, background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div style={{ position: 'fixed', right: 26, bottom: 104, zIndex: 100, width: 'min(400px, calc(100vw - 36px))', height: 'min(620px, calc(100vh - 150px))', background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 26px 70px rgba(15,37,64,0.28)', border: '1px solid #EAEDF0', display: 'flex', flexDirection: 'column', animation: 'chatPop .25s ease both' }}>
          {/* 모드 탭 */}
          <div style={{ display: 'flex', background: '#0F2540', padding: '8px 8px 0' }}>
            {Object.entries(MODES).map(([key, m]) => (
              <button key={key} onClick={() => setMode(key)}
                style={{ flex: 1, cursor: 'pointer', border: 'none', borderRadius: '10px 10px 0 0', padding: '11px 8px', fontSize: 13.5, fontWeight: 700, background: mode === key ? '#fff' : 'transparent', color: mode === key ? '#0F2540' : 'rgba(255,255,255,0.6)' }}>
                {m.icon} {key === 'coach' ? '취준생 코치' : '기업 인재추천'}
              </button>
            ))}
          </div>
          {/* 헤더 */}
          <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #EAEDF0' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cfg.icon}</div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0F2540' }}>{cfg.title}</div>
              <div style={{ fontSize: 12, color: '#8A96A3' }}>{cfg.sub}</div>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', background: '#FBFAF8', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bubble role="assistant" content={cfg.greeting} />
            {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
            {loading && <Typing />}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                {cfg.quick.map((q) => (
                  <button key={q} onClick={() => send(q)} style={{ textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#5C6B7A', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 12, padding: '11px 14px' }}>{q}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #EAEDF0', padding: 12, background: '#fff' }}>
            {!isSupabaseReady && <div style={{ fontSize: 12, color: '#C2451F', background: '#FDEBE4', padding: '8px 10px', borderRadius: 8, marginBottom: 8 }}>Supabase 환경변수가 없어 챗봇이 비활성 상태입니다.</div>}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} rows={1} placeholder={mode === 'recruit' ? '필요한 직무·조건을 알려주세요…' : '메시지를 입력하세요…'}
                style={{ flex: 1, resize: 'none', maxHeight: 100, border: '1px solid #DCE1E6', borderRadius: 12, padding: '11px 13px', fontSize: 14, fontFamily: 'inherit', outline: 'none', lineHeight: 1.5 }} />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', background: loading || !input.trim() ? '#DCE1E6' : cfg.accent, color: '#fff', fontSize: 18 }}>↑</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Bubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '82%', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14.5, lineHeight: 1.6, padding: '11px 14px', borderRadius: 16, background: isUser ? '#E8623D' : '#fff', color: isUser ? '#fff' : '#0F2540', border: isUser ? 'none' : '1px solid #EAEDF0', borderBottomRightRadius: isUser ? 4 : 16, borderBottomLeftRadius: isUser ? 16 : 4 }}>{content}</div>
    </div>
  )
}
function Typing() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 16, borderBottomLeftRadius: 4, width: 'fit-content' }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8A96A3', animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
    </div>
  )
}
