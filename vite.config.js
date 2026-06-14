import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 커스텀 도메인(rest05.dreamitbiz.com) 사용 → base는 반드시 '/'
// (reponame 경로로 두면 자산 404 발생: 기존 rest02/03/04 동일 이슈)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
