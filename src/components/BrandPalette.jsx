// 실타래(spool) SVG 일러스트 + 브랜드 컬러 팔레트.
// 코드로 직접 그린 실타래라 PNG 없이도 선명하고, 색상 변형이 자유롭다.

let _uid = 0

export function SpoolSVG({ size = 160, from = '#FF8A6B', to = '#D9532E', tail = true, id }) {
  const gid = id || `sp${++_uid}`
  return (
    <svg width={size * 0.86} height={size} viewBox="0 0 140 170" role="img" aria-label="실타래">
      <defs>
        <linearGradient id={`${gid}-thread`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${gid}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DEE2E7" />
        </linearGradient>
        <clipPath id={`${gid}-body`}><rect x="36" y="36" width="68" height="98" rx="4" /></clipPath>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="70" cy="160" rx="50" ry="7" fill="#0F2540" opacity="0.10" />

      {/* 풀린 실 한 가닥(연결의 상징) */}
      {tail && (
        <path d="M104 96 C126 104 120 130 100 132 C84 134 92 116 104 120"
          fill="none" stroke={to} strokeWidth="3.4" strokeLinecap="round" opacity="0.95" />
      )}

      {/* 실 몸통 */}
      <rect x="36" y="36" width="68" height="98" rx="4" fill={`url(#${gid}-thread)`} />
      {/* 감긴 실 결 */}
      <g clipPath={`url(#${gid}-body)`} stroke={to} strokeWidth="1" opacity="0.30">
        {Array.from({ length: 23 }).map((_, i) => (
          <line key={i} x1="36" y1={40 + i * 4.2} x2="104" y2={40 + i * 4.2 + 1.6} />
        ))}
      </g>
      {/* 좌측 하이라이트 */}
      <rect x="43" y="36" width="10" height="98" fill="#fff" opacity="0.20" />

      {/* 위/아래 마구리(플랜지) */}
      <rect x="16" y="14" width="108" height="26" rx="12" fill={`url(#${gid}-cap)`} stroke="#D4D8DE" strokeWidth="1" />
      <ellipse cx="70" cy="22" rx="50" ry="7" fill="#fff" opacity="0.55" />
      <rect x="16" y="130" width="108" height="26" rx="12" fill={`url(#${gid}-cap)`} stroke="#D4D8DE" strokeWidth="1" />
      <ellipse cx="70" cy="150" rx="46" ry="5.5" fill="#0F2540" opacity="0.05" />
    </svg>
  )
}

// 실타래 색상 변형
export const SPOOL_VARIANTS = [
  { name: '시그니처 오렌지', from: '#FF8A6B', to: '#D9532E' },
  { name: '딥 네이비', from: '#3E5C82', to: '#0F2540' },
  { name: '민트 그린', from: '#6FE0B6', to: '#1F9D6B' },
  { name: '코랄 핑크', from: '#FFB199', to: '#FF6B8A' },
  { name: '선셋 골드', from: '#FFD479', to: '#E8A13D' },
]

export function SpoolRow({ size = 96 }) {
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {SPOOL_VARIANTS.map((v) => (
        <div key={v.name} style={{ textAlign: 'center' }}>
          <SpoolSVG size={size} from={v.from} to={v.to} id={`row-${v.name}`} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5C6B7A', marginTop: 6 }}>{v.name}</div>
        </div>
      ))}
    </div>
  )
}

// 확장 컬러 팔레트 — 메인 + 보조(상태/배경)
const PALETTE = [
  { group: '메인', colors: [
    { name: '딥 네이비', hex: '#0F2540', use: '본문·다크', dark: true },
    { name: '시그니처 오렌지', hex: '#E8623D', use: 'CTA·강조', dark: true },
    { name: '코랄 라이트', hex: '#FF8A6B', use: '포인트', dark: true },
    { name: '오렌지 딥', hex: '#C2451F', use: '강조 텍스트', dark: true },
  ] },
  { group: '보조 · 상태', colors: [
    { name: '인증 그린', hex: '#1F9D6B', use: '인증완료', dark: true },
    { name: '인포 블루', hex: '#2C6BD6', use: '공개·정보', dark: true },
    { name: '슬레이트', hex: '#5C6B7A', use: '보조 텍스트', dark: true },
    { name: '카카오 옐로', hex: '#FEE500', use: '카카오 로그인', dark: false },
  ] },
  { group: '배경 · 라인', colors: [
    { name: '코랄 배경', hex: '#FDEBE4', use: '뱃지 배경', dark: false },
    { name: '크림', hex: '#FBFAF8', use: '페이지 배경', dark: false },
    { name: '칩 그레이', hex: '#F2F4F6', use: '태그 배경', dark: false },
    { name: '라인', hex: '#EAEDF0', use: '경계선', dark: false },
  ] },
]

export function BrandPalette() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {PALETTE.map((g) => (
        <div key={g.group}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F2540', marginBottom: 10 }}>{g.group}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="grid-4">
            {g.colors.map((s) => (
              <div key={s.hex} style={{ border: '1px solid #EAEDF0', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <div style={{ height: 64, background: s.hex, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8, borderBottom: s.dark ? 'none' : '1px solid #EAEDF0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.dark ? 'rgba(255,255,255,0.88)' : '#8A96A3' }}>{s.hex}</span>
                </div>
                <div style={{ padding: '9px 11px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F2540' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#8A96A3', marginTop: 1 }}>{s.use}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
