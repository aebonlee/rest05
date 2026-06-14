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

## 핵심 기능 요약
- **인재 쇼케이스(역채용)**: 메인에서 인증 인재 카드 랜덤 노출, 기업용 검색(키워드)·최소점수·직무 필터
- **AI 챗봇 2종**(Edge Function `chat`, mode로 분기)
  - 취준생 코치(`coach`): 취업상담·이력서·자소서
  - 기업 인재추천(`recruit`): 직무 파악 + 인재풀에서 매칭 추천
- **객관 평가 점수**: 학력·자격·경력·포트폴리오·역량평가 5축. 직무별 점검항목+동일 배점(`src/data/assessment.js`)
- **AI 역량평가**(`questions`/`grade` mode): 직무별 다양한 질문 생성 → 공정 채점 → 역량평가 축 점수
- **인재 등록 폼**: 로그인 후 프로필+증빙서류 업로드(Storage)+점검항목+AI평가. `verified=false`로 제출→검토 후 확정
- **채용 제의**: 기업이 카드에서 바로 제의(`rest05_offers`)
- **쉬었음 청년** 재취업 지원 대상 플래그

## 챗봇/평가 백엔드 (Supabase Edge Function)
`supabase/functions/chat/index.ts` 한 함수가 `mode`로 분기:
`coach`(기본 코칭) · `recruit`(기업 인재추천) · `questions`(평가문항 생성) · `grade`(공정 채점).


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

## 데이터베이스 (Supabase · rest05_ 접두사)
> ⚠️ 단일 공유 프로젝트라 모든 객체에 `rest05_` 접두사 필수.

`supabase/schema.sql` 을 대시보드 **SQL Editor** 에 붙여넣고 실행:
- `rest05_profiles` — 인재 프로필. 5개 축 점수(`score_education/cert/career/portfolio/assessment`)와
  자동 계산되는 종합 인증 점수 `score_total`, `verified` 포함
- `rest05_offers` — 기업 → 인재 채용 제의
- RLS: 공개(`is_public`) 인재는 누구나 열람, 본인 프로필만 수정
- 가입 시 `rest05_profiles` 자동 생성 트리거(google/kakao 공통)

### 인재 인증 점수 (실력 증빙 5개 축)
학력 · 자격 · 경력 · 포트폴리오 · 역량평가 → 각 0~100 → 평균이 종합 인증 점수.
검증을 통과한 인재만 `verified=true`, `is_public=true` 로 인재풀에 노출.

## 로그인 (Google + Kakao OAuth)
프런트 코드는 `src/lib/auth.js` + `src/components/AuthButton.jsx` 로 이미 구현됨
(`supabase.auth.signInWithOAuth`). **대시보드에서 provider만 켜면** 동작한다.

Supabase → **Authentication → Providers**:
1. **Google** 활성화 → Google Cloud Console에서 OAuth 클라이언트 생성,
   Client ID/Secret 입력. 승인 리디렉션 URI:
   `https://hcmgdztsgjvzcyxyayaj.supabase.co/auth/v1/callback`
2. **Kakao** 활성화 → Kakao Developers 앱 생성, REST API 키/Client Secret 입력.
   Redirect URI 동일(`.../auth/v1/callback`)
3. **Authentication → URL Configuration → Redirect URLs** 에 사이트 추가:
   `https://rest05.dreamitbiz.com` (+ 로컬 `http://localhost:5173`)

## OG 이미지 (공유 미리보기)
- 메타태그: `index.html` 의 `og:*` / `twitter:*` (이미지 `https://rest05.dreamitbiz.com/og.png`)
- 이미지 재생성(sharp 임시 설치):
  ```bash
  npm i -D sharp && node scripts/make-og.mjs && npm un sharp
  ```
- 카카오 캐시 갱신: https://developers.kakao.com/tool/debugger/sharing 에서 URL 재스크랩

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
