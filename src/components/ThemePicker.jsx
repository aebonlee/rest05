import { useState } from 'react'
import { THEMES } from '../data/themes'

// 🎨 팔레트 버튼 — 실타래/실선 색상 테마를 고른다.
export default function ThemePicker({ theme, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="색상 테마 선택"
        title="색상 테마"
        style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #DCE1E6', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        🎨
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 59 }} />
          <div style={popover} onMouseLeave={() => setOpen(false)}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8A96A3', padding: '2px 4px 10px' }}>실타래 · 실선 색상</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {THEMES.map((t) => {
                const active = t.key === theme.key
                return (
                  <button key={t.key} onClick={() => { onChange(t); setOpen(false) }}
                    style={{ cursor: 'pointer', border: `2px solid ${active ? t.mid : 'transparent'}`, background: '#fff', borderRadius: 12, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#0F2540' : '#5C6B7A' }}>{t.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const popover = {
  position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 60,
  background: '#fff', border: '1px solid #EAEDF0', borderRadius: 16,
  boxShadow: '0 16px 40px rgba(15,37,64,0.16)', padding: 12, width: 232,
}
