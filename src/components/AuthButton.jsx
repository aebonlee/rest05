import { useEffect, useState } from 'react'
import { isSupabaseReady } from '../lib/supabase'
import { getUser, onAuthChange, signOut, signInWithGoogle, signInWithKakao } from '../lib/auth'

export default function AuthButton({ onMyPage }) {
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    getUser().then(setUser)
    const off = onAuthChange(setUser)
    return off
  }, [])

  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '회원'
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  if (user) {
    return (
      <div style={{ position: 'relative' }}>
        <button onClick={() => setMenu((m) => !m)} style={userBtn}>
          {avatar
            ? <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            : <span style={avatarFallback}>{name[0]}</span>}
          <span style={{ fontWeight: 700, fontSize: 14 }}>{name}님</span>
        </button>
        {menu && (
          <div style={menuBox} onMouseLeave={() => setMenu(false)}>
            <div style={{ fontSize: 12, color: '#8A96A3', padding: '4px 12px 8px' }}>{user.email}</div>
            {onMyPage && <button style={menuItem} onClick={() => { setMenu(false); onMyPage() }}>마이페이지</button>}
            <button style={menuItem} onClick={async () => { await signOut(); setMenu(false) }}>로그아웃</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button onClick={() => setModal(true)} style={loginPill}>로그인 / 가입</button>
      {modal && (
        <div style={overlay} onClick={() => setModal(false)}>
          <div style={card} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(false)} style={closeX} aria-label="닫기">✕</button>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🧵</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>드림아이티비즈 인재풀</h3>
            <p style={{ fontSize: 14.5, color: '#5C6B7A', marginTop: 8, lineHeight: 1.6 }}>
              간편 가입하고 나를 인재로 등록하세요.<br />기업이 먼저 찾아옵니다.
            </p>

            {!isSupabaseReady && (
              <p style={{ fontSize: 12, color: '#C2451F', background: '#FDEBE4', padding: '8px 10px', borderRadius: 8, marginTop: 14 }}>
                Supabase 환경변수가 없어 로그인이 비활성 상태입니다.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
              <button onClick={() => signInWithGoogle()} style={googleBtn} disabled={!isSupabaseReady}>
                <GoogleIcon /> Google로 계속하기
              </button>
              <button onClick={() => signInWithKakao()} style={kakaoBtn} disabled={!isSupabaseReady}>
                <span style={{ fontSize: 17, fontWeight: 900 }}>K</span> 카카오로 계속하기
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: '#8A96A3', marginTop: 18, lineHeight: 1.5 }}>
              계속하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.6 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
      <path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

const loginPill = {
  cursor: 'pointer', fontSize: 15, fontWeight: 700, padding: '10px 18px', borderRadius: 999,
  border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540',
}
const userBtn = {
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 6px',
  borderRadius: 999, border: '1px solid #DCE1E6', background: '#fff', color: '#0F2540',
}
const avatarFallback = {
  width: 28, height: 28, borderRadius: '50%', background: '#E8623D', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13,
}
const menuBox = {
  position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', border: '1px solid #EAEDF0',
  borderRadius: 14, boxShadow: '0 14px 34px rgba(15,37,64,0.14)', padding: 8, minWidth: 180, zIndex: 60,
}
const menuItem = {
  width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0F2540',
  background: 'transparent', border: 'none', padding: '10px 12px', borderRadius: 8,
}
const overlay = {
  position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,37,64,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)',
}
const card = {
  position: 'relative', width: 'min(380px, 100%)', background: '#fff', borderRadius: 22,
  padding: '36px 32px', boxShadow: '0 30px 80px rgba(15,37,64,0.3)', animation: 'chatPop .22s ease both',
}
const closeX = {
  position: 'absolute', right: 16, top: 16, cursor: 'pointer', border: 'none', background: 'transparent',
  fontSize: 16, color: '#8A96A3',
}
const googleBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
  fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: '1px solid #DCE1E6',
  background: '#fff', color: '#0F2540',
}
const kakaoBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
  fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, border: 'none',
  background: '#FEE500', color: '#191600',
}
