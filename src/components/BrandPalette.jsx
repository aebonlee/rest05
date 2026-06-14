// 실타래(spool) SVG 일러스트 + 브랜드 컬러 팔레트
// PNG 대신 코드로 그린 실타래라 어디서든 선명하게 확대된다.

export function SpoolSVG({ size = 150 }) {
  return (
    <svg width={size * 0.8} height={size} viewBox="0 0 120 150" aria-label="실타래" role="img">
      <defs>
        <linearGradient id="spoolThread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF8A6B" />
          <stop offset="0.5" stopColor="#E8623D" />
          <stop offset="1" stopColor="#D9532E" />
        </linearGradient>
        <linearGradient id="spoolCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E5E9" />
        </linearGradient>
        <clipPath id="spoolBody"><rect x="30" y="26" width="60" height="98" rx="3" /></clipPath>
      </defs>

      {/* 그림자 */}
      <ellipse cx="60" cy="143" rx="44" ry="6" fill="#0F2540" opacity="0.10" />

      {/* 실 몸통 */}
      <rect x="30" y="26" width="60" height="98" rx="3" fill="url(#spoolThread)" />
      {/* 감긴 실 결 */}
      <g clipPath="url(#spoolBody)" stroke="#C2451F" strokeWidth="1" opacity="0.28">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="30" y1={29 + i * 4} x2="90" y2={29 + i * 4 + 1.5} />
        ))}
      </g>
      {/* 하이라이트 */}
      <rect x="36" y="26" width="9" height="98" fill="#fff" opacity="0.18" />

      {/* 위/아래 플랜지(마구리) */}
      <rect x="14" y="8" width="92" height="24" rx="11" fill="url(#spoolCap)" stroke="#D7DBE0" strokeWidth="1" />
      <rect x="14" y="118" width="92" height="24" rx="11" fill="url(#spoolCap)" stroke="#D7DBE0" strokeWidth="1" />
      <ellipse cx="60" cy="20" rx="44" ry="8" fill="#fff" opacity="0.5" />
    </svg>
  )
}

const SWATCHES = [
  { name: '딥 네이비', hex: '#0F2540', use: '본문·다크 섹션', dark: true },
  { name: '시그니처 오렌지', hex: '#E8623D', use: 'CTA·강조', dark: true },
  { name: '코랄 라이트', hex: '#FF8A6B', use: '포인트·그라데이션', dark: true },
  { name: '코랄 배경', hex: '#FDEBE4', use: '뱃지·CTA 배경', dark: false },
  { name: '크림', hex: '#FBFAF8', use: '페이지 배경', dark: false },
]

export function BrandPalette() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="grid-5">
      {SWATCHES.map((s) => (
        <div key={s.hex} style={{ border: '1px solid #EAEDF0', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
          <div style={{ height: 76, background: s.hex, borderBottom: s.hex === '#FBFAF8' ? '1px solid #EAEDF0' : 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.dark ? 'rgba(255,255,255,0.85)' : '#8A96A3' }}>{s.hex}</span>
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F2540' }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: '#8A96A3', marginTop: 2 }}>{s.use}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
