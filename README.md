# rest05 · 드림아이티비즈 인재풀 (Talent Showcase)

기업이 먼저 찾아오는 **역(逆)채용** 인재 홍보 플랫폼.
드림아이티비즈가 키운 취업준비생/수료생을 인재 카드로 전시하고,
기업이 직접 둘러본 뒤 채용을 제의한다.
취업준비생을 위한 **AI 취업 코치 챗봇**(취업상담·이력서·자기소개서 코칭) 내장.

🔗 https://rest05.dreamitbiz.com

## 빠른 시작
```bash
npm install
cp .env.example .env   # Supabase 값 입력
npm run dev
```

## 챗봇 (OpenAI)
키는 **Supabase Edge Function 시크릿**에만 둔다(브라우저 노출 X).
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy chat --no-verify-jwt
```

자세한 내용 → [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

## 스택
React 18 · Vite · Supabase Edge Functions · GitHub Pages (Actions 자동 배포)
