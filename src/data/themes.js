// 실타래 + 스크롤 실선(thread) 공통 색상 테마.
// from(밝게) → mid(메인) → to(딥). 실타래와 실선이 항상 같은 색을 쓴다.
export const THEMES = [
  { key: 'navy', name: '네이비', from: '#3E5C82', mid: '#1E3A5F', to: '#0F2540', glow: 'rgba(15,37,64,0.30)' },
  { key: 'orange', name: '오렌지', from: '#FF8A6B', mid: '#E8623D', to: '#C2451F', glow: 'rgba(232,98,61,0.30)' },
  { key: 'mint', name: '민트', from: '#6FE0B6', mid: '#1F9D6B', to: '#157A52', glow: 'rgba(31,157,107,0.30)' },
  { key: 'pink', name: '코랄핑크', from: '#FFB199', mid: '#FF6B8A', to: '#E04A6B', glow: 'rgba(255,107,138,0.30)' },
  { key: 'gold', name: '골드', from: '#FFD479', mid: '#E8A13D', to: '#B97A1E', glow: 'rgba(232,161,61,0.30)' },
  { key: 'purple', name: '퍼플', from: '#B49BE6', mid: '#7C5CD6', to: '#5A3FB0', glow: 'rgba(124,92,214,0.30)' },
]

export const DEFAULT_THEME = THEMES[0] // 네이비
