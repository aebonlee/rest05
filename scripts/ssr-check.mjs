// 렌더타임 에러 진단: App을 Node에서 SSR 렌더해 throw를 잡는다.
import esbuild from 'esbuild'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const entry = `
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './src/App.jsx'
globalThis.__html = renderToStaticMarkup(React.createElement(App))
`

const result = await esbuild.build({
  stdin: { contents: entry, resolveDir: process.cwd(), loader: 'js' },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  jsx: 'automatic',
  write: false,
  define: { 'import.meta.env': JSON.stringify({ VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '', VITE_CHAT_FUNCTION: 'chat' }) },
  loader: { '.css': 'empty', '.png': 'empty' },
})

const code = result.outputFiles[0].text
const mod = { exports: {} }
const fn = new Function('require', 'module', 'exports', 'globalThis', code)
try {
  fn(require, mod, mod.exports, globalThis)
  console.log('✓ SSR 렌더 성공 — 렌더타임 throw 없음. (length=' + (globalThis.__html || '').length + ')')
} catch (e) {
  console.log('✗ 렌더 에러 발견:\n', e && e.stack ? e.stack : e)
  process.exit(1)
}
