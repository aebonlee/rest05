# rest05 — 드림아이티비즈 인재 쇼케이스 플랫폼 (개발 문서)

기업이 먼저 찾아오는 **역(逆)채용** 플랫폼. 드림아이티비즈가 키운 취업준비생/수료생을
인재 카드로 전시하고, 기업이 직접 둘러본 뒤 채용을 제의한다.
취업준비생을 위한 **AI 취업 코치 챗봇**(취업상담·이력서·자기소개서 코칭)을 함께 제공한다.

- 배포 URL: https://rest05.dreamitbiz.com
- 디자인 베이스: Claude Design 시안(실타래/thread 연결선) — `Recruit.dc.html`을 React로 재구성

## 기술 스택
- React 18 + Vite 5
- Supabase (Edge Function = OpenAI 프록시)
- GitHub Actions → GitHub Pages 자동 배포 (main push)

## 디렉터리
```
src/
  App.jsx              # 전체 페이지(Nav/Hero/인재카드/분야/절차/CTA/Footer)
  hooks/useThread.js   # 실타래 스크롤-드로잉 연결선 로직
  components/Chatbot.jsx  # 플로팅 취업 코칭 챗봇
  data/talents.js      # 인재/분야/절차/통계 데이터
  lib/supabase.js      # Supabase 클라이언트
  lib/chat.js          # Edge Function('chat') 호출
supabase/functions/chat/index.ts  # OpenAI 프록시 Edge Function
```

## 로컬 실행
```bash
npm install
cp .env.example .env        # 값 채우기 (아래 참고)
npm run dev
```

## 환경변수 (.env)
| 변수 | 설명 | 노출 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | 공개 안전 |
| `VITE_SUPABASE_ANON_KEY` | anon public key | 공개 안전 |
| `VITE_CHAT_FUNCTION` | Edge Function 이름(기본 `chat`) | 공개 안전 |

> **OpenAI 키는 .env에 넣지 않는다.** 프런트엔드 빌드에 노출되기 때문.
> 키는 Supabase Edge Function 시크릿으로만 등록한다(아래).

## 챗봇 백엔드 (Supabase Edge Function)

### 1) OpenAI 키 등록 (서버 시크릿)
- **대시보드:** Supabase → 프로젝트 → Edge Functions → Secrets → Add new secret
  - `OPENAI_API_KEY` = `sk-...`
  - (선택) `OPENAI_MODEL` = `gpt-4o-mini` (생략 시 기본값)
- **CLI:**
  ```bash
  supabase secrets set OPENAI_API_KEY=sk-...
  ```

### 2) 함수 배포
```bash
supabase functions deploy chat --no-verify-jwt
```
- `--no-verify-jwt`: anon 키만으로 호출 허용(공개 챗봇).
- 호출 흐름: 브라우저 → `supabase.functions.invoke('chat')` → Edge Function → OpenAI.
  OpenAI 키는 서버에만 있으므로 브라우저에 절대 노출되지 않는다.

## 배포 (GitHub Pages)
`main` 브랜치 push 시 `.github/workflows/deploy.yml`이 자동 빌드·배포.

리포 **Settings → Secrets and variables → Actions** 에 등록:
- Variables: `VITE_SUPABASE_URL`, `VITE_CHAT_FUNCTION`(=`chat`)
- Secrets: `VITE_SUPABASE_ANON_KEY`

> 처음 1회: Settings → Pages → Source 를 **GitHub Actions** 로 전환해야 한다
> (신규 Pages는 legacy로 시작될 수 있음).

## 디자인 토큰
- 네이비 `#0F2540`, 오렌지 `#E8623D` / `#FF8A6B`, 크림 배경 `#FBFAF8`
- 폰트 Pretendard, 시그니처 = 실타래(spool) + 스크롤 연결 실선(thread)

## TODO (다음 단계)
- [ ] 인재 데이터 Supabase 테이블(`rest05_talents`) 연동(현재 정적)
- [ ] 인재 상세 페이지 / 채용 제의 폼
- [ ] 취업준비생 프로필 등록(인증) 플로우
- [ ] 챗봇 대화 로그 저장(선택)
