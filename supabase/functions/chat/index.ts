// Supabase Edge Function: 취업 코칭 챗봇 + AI 역량평가 (OpenAI 프록시)
//
// 배포:    supabase functions deploy chat --no-verify-jwt
// 시크릿:  supabase secrets set OPENAI_API_KEY=sk-...   (대시보드 Edge Functions → Secrets)
//
// mode 별 동작:
//   (없음)/'coach'  → 취업 코칭 챗봇(이력서·자소서·취업상담)
//   'questions'     → 직무별 다양한 역량평가 질문 생성(공정·객관)
//   'grade'         → 답변을 공정한 기준으로 0~100 채점 + 피드백
// 브라우저는 이 함수만 호출 → OpenAI 키 비노출.

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

const COACH_PROMPT = `너는 '드림아이티비즈 인재풀'의 AI 취업 코치다.
대상은 IT 직무(개발/데이터/DevOps/QA/보안/기획/디자인/IT마케팅/기술지원 등) 취업준비생이다.
역할: 취업 상담, 이력서 첨삭(성과를 수치·임팩트 중심으로), 자기소개서 코칭(STAR 구조).
원칙: 한국어로 따뜻하지만 솔직하게. 막연한 칭찬 대신 실행 가능한 피드백. 필요하면 핵심 질문 1~2개 먼저.`

const RECRUIT_PROMPT = `너는 '드림아이티비즈 인재풀'의 AI 채용 어시스턴트다.
기업 담당자가 필요한 직무를 설명하면, (1) 모호한 요구사항을 명확히 하도록 핵심 질문을 던지고,
(2) 아래 제공된 '인재 후보 목록' 중에서 가장 적합한 인재를 추천한다.
추천 시 반드시 후보 목록 안의 인재만 이름과 함께 제시하고, 직무·기술스택·인증점수를 근거로 매칭 이유를 설명한다.
적합한 인재가 없으면 솔직히 없다고 말하고 어떤 조건을 완화하면 좋을지 제안한다. 한국어, 간결하게.`

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

async function openai(messages: { role: string; content: string }[], opts: { temperature?: number; jsonMode?: boolean } = {}) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: opts.temperature ?? 0.6,
      max_tokens: 1000,
      ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
  })
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST만 허용됩니다.' }, 405)
  if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY 시크릿이 설정되지 않았습니다.' }, 500)

  let body: any = {}
  try { body = await req.json() } catch (_) { return json({ error: '잘못된 요청 본문입니다.' }, 400) }
  const mode = body?.mode || 'coach'

  try {
    // ── 직무별 역량평가 질문 생성 ──
    if (mode === 'questions') {
      const field = String(body?.field || 'IT 직무')
      const n = Math.min(6, Math.max(3, Number(body?.count) || 5))
      const content = await openai([
        { role: 'system', content: '너는 공정하고 객관적인 IT 직무 역량 평가관이다. 특정 회사/학교에 유리하지 않은 중립적 질문만 만든다. 반드시 JSON으로만 답한다.' },
        { role: 'user', content: `직무: "${field}". 이 직무의 실무 역량을 공정하게 평가할 수 있는 서로 다른 영역(기초지식/문제해결/실무경험/협업·커뮤니케이션 등)의 질문 ${n}개를 만들어라. 형식: {"questions": ["...", "..."]}` },
      ], { temperature: 0.8, jsonMode: true })
      const parsed = JSON.parse(content)
      return json({ questions: Array.isArray(parsed?.questions) ? parsed.questions.slice(0, n) : [] })
    }

    // ── 공정 채점 ──
    if (mode === 'grade') {
      const field = String(body?.field || 'IT 직무')
      const qa = Array.isArray(body?.qa) ? body.qa : []
      if (qa.length === 0) return json({ error: '채점할 답변이 없습니다.' }, 400)
      const transcript = qa.map((p: any, i: number) => `Q${i + 1}. ${p.q}\nA${i + 1}. ${p.a || '(무응답)'}`).join('\n\n')
      const content = await openai([
        { role: 'system', content: '너는 공정하고 일관된 IT 직무 역량 채점관이다. 동일한 기준을 모든 지원자에게 똑같이 적용한다. 출신 학교/회사/표현의 화려함이 아니라 답변의 정확성·구체성·문제해결력만 본다. 무응답은 0점 처리. 반드시 JSON으로만 답한다.' },
        { role: 'user', content: `직무: "${field}".\n아래 Q&A를 0~100점으로 공정하게 채점하라. 점수 근거와 보완점을 한국어로 간단히.\n\n${transcript}\n\n형식: {"score": 0-100, "feedback": "...", "strengths": ["..."], "improvements": ["..."]}` },
      ], { temperature: 0.2, jsonMode: true })
      const r = JSON.parse(content)
      const score = Math.max(0, Math.min(100, Math.round(Number(r?.score) || 0)))
      return json({ score, feedback: r?.feedback || '', strengths: r?.strengths || [], improvements: r?.improvements || [] })
    }

    // ── 챗봇(코칭 / 기업 인재추천) ──
    const messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
    if (messages.length === 0) return json({ error: '메시지가 비어 있습니다.' }, 400)

    let system = COACH_PROMPT
    if (mode === 'recruit') {
      const talents = Array.isArray(body?.talents) ? body.talents.slice(0, 60) : []
      const list = talents.map((t: any, i: number) =>
        `${i + 1}. ${t.name} | ${t.field} | 점수 ${t.score ?? '-'} | ${t.status ?? ''} | 스택: ${(t.skills || []).join(', ')} | ${t.headline ?? ''}`).join('\n')
      system = `${RECRUIT_PROMPT}\n\n[인재 후보 목록]\n${list || '(등록된 인재 없음)'}`
    }
    const reply = await openai([{ role: 'system', content: system }, ...messages])
    return json({ reply })
  } catch (e) {
    return json({ error: `요청 실패: ${e instanceof Error ? e.message : String(e)}` }, 502)
  }
})
