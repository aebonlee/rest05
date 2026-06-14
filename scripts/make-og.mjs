// OG 이미지 생성 (1200x630) — sharp로 SVG를 PNG로 래스터화.
// 실행:  node scripts/make-og.mjs   (sharp 임시 설치 필요)
//   npm i -D sharp && node scripts/make-og.mjs && npm un sharp
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')

const W = 1200, H = 630
const FONT = 'Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'

// 실타래 이미지를 base64로 임베드(SVG composite보다 폰트/위치 제어 쉬움)
const spool = readFileSync(resolve(root, 'public/assets/spool.png')).toString('base64')

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBFAF8"/>
      <stop offset="1" stop-color="#FDEBE4"/>
    </linearGradient>
    <linearGradient id="thread" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF8A6B"/>
      <stop offset="1" stop-color="#E8623D"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1080" cy="-60" r="320" fill="#E8623D" opacity="0.10"/>

  <!-- 연결 실선 모티브 -->
  <path d="M120,470 C320,470 360,300 560,300 C760,300 800,150 1000,150"
        fill="none" stroke="url(#thread)" stroke-width="5" stroke-linecap="round" opacity="0.55"/>

  <!-- 브랜드 -->
  <text x="96" y="150" font-family='${FONT}' font-size="30" font-weight="800" fill="#0F2540">드림아이티비즈
    <tspan font-size="22" font-weight="600" fill="#E8623D"> 인재풀</tspan>
  </text>

  <!-- 인증 배지 -->
  <rect x="96" y="190" width="280" height="46" rx="23" fill="#FFFFFF" stroke="#F7D7CB"/>
  <circle cx="122" cy="213" r="6" fill="#E8623D"/>
  <text x="140" y="221" font-family='${FONT}' font-size="20" font-weight="700" fill="#C2451F">검증된 인증 인재 · 역채용</text>

  <!-- 메인 카피 -->
  <text x="94" y="330" font-family='${FONT}' font-size="74" font-weight="800" fill="#0F2540" letter-spacing="-2">검증된 실력을,</text>
  <text x="94" y="418" font-family='${FONT}' font-size="74" font-weight="800" letter-spacing="-2"><tspan fill="#E8623D">기업이 먼저</tspan><tspan fill="#0F2540"> 알아봅니다</tspan></text>

  <!-- 서브 카피 -->
  <text x="96" y="486" font-family='${FONT}' font-size="27" font-weight="500" fill="#5C6B7A">학력·자격·경력·포트폴리오·역량평가를 검증해 인증 점수로 증명합니다.</text>

  <!-- URL -->
  <text x="96" y="560" font-family='${FONT}' font-size="22" font-weight="700" fill="#8A96A3">rest05.dreamitbiz.com</text>

  <!-- 실타래 -->
  <image href="data:image/png;base64,${spool}" x="900" y="300" width="250" height="300" preserveAspectRatio="xMidYMid meet"/>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(resolve(root, 'public/og.png'))
console.log('✓ public/og.png (1200x630) 생성 완료')
