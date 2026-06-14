import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../lib/chat'
import { isSupabaseReady } from '../lib/supabase'

const QUICK = [
  '이력서 한 줄 첨삭 받고 싶어요',
  '자기소개서 지원동기를 못 쓰겠어요',
  '프론트엔드 신입 취업 전략이 궁금해요',
]

const GREETING = {
  role: 'assistant',
  content:
    '안녕하세요! 드림아이티비즈 AI 취업 코치예요. 🧵\n취업 상담, 이력서 첨삭, 자기소개서 코칭을 도와드릴게요. 무엇을 도와드릴까요?',
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading, open])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')

    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    try {
      // 인사말은 API에 보내지 않음(role:user/assistant 실제 대화만 전달)
      const history = next.filter((m) => m !== GREETING)
      const reply = await sendChat(history)
      setMessages([...next, { role: 'assistant', content: reply || '응답이 비어 있어요. 다시 시도해 주세요.' }])
    } catch (e) {
      setMessages([
        ...next,
        { role: 'assistant', content: `⚠️ 오류가 발생했어요.\n${e.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="취업 코칭 챗봇 열기"
        style={{
          position: 'fixed', right: 26, bottom: 26, zIndex: 100,
          width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open ? '#0F2540' : '#E8623D', color: '#fff', fontSize: 26,
          boxShadow: '0 14px 34px rgba(232,98,61,0.42)',
          transition: 'transform .15s, background .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* 채팅 패널 */}
      {open && (
        <div
          style={{
            position: 'fixed', right: 26, bottom: 104, zIndex: 100,
            width: 'min(400px, calc(100vw - 36px))', height: 'min(600px, calc(100vh - 150px))',
            background: '#fff', borderRadius: 22, overflow: 'hidden',
            boxShadow: '0 26px 70px rgba(15,37,64,0.28)', border: '1px solid #EAEDF0',
            display: 'flex', flexDirection: 'column', animation: 'chatPop .25s ease both',
          }}
        >
          {/* 헤더 */}
          <div style={{ background: '#0F2540', color: '#fff', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8623D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧵</div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>AI 취업 코치</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>이력서 · 자소서 · 취업 상담</div>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', background: '#FBFAF8', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && <Typing />}

            {messages.length <= 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{
                      textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#5C6B7A',
                      background: '#fff', border: '1px solid #EAEDF0', borderRadius: 12, padding: '11px 14px',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div style={{ borderTop: '1px solid #EAEDF0', padding: 12, background: '#fff' }}>
            {!isSupabaseReady && (
              <div style={{ fontSize: 12, color: '#C2451F', background: '#FDEBE4', padding: '8px 10px', borderRadius: 8, marginBottom: 8 }}>
                Supabase 환경변수가 없어 챗봇이 비활성 상태입니다(.env 설정 필요).
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="메시지를 입력하세요…"
                style={{
                  flex: 1, resize: 'none', maxHeight: 100, border: '1px solid #DCE1E6', borderRadius: 12,
                  padding: '11px 13px', fontSize: 14, fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
                }}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: 'none',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  background: loading || !input.trim() ? '#DCE1E6' : '#E8623D', color: '#fff', fontSize: 18,
                }}
              >
                ↑
              </button>
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
      <div
        style={{
          maxWidth: '82%', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          fontSize: 14.5, lineHeight: 1.6, padding: '11px 14px', borderRadius: 16,
          background: isUser ? '#E8623D' : '#fff',
          color: isUser ? '#fff' : '#0F2540',
          border: isUser ? 'none' : '1px solid #EAEDF0',
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }}
      >
        {content}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: '#fff', border: '1px solid #EAEDF0', borderRadius: 16, borderBottomLeftRadius: 4, width: 'fit-content' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8A96A3', animation: `blink 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}
