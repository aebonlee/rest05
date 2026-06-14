// Supabase Edge Function: 취업 코칭 챗봇 (OpenAI 프록시)
//
// 배포:
//   supabase functions deploy chat --no-verify-jwt
// 시크릿 등록(키는 서버에만 보관):
//   supabase secrets set OPENAI_API_KEY=sk-...   (또는 대시보드 Edge Functions → Secrets)
//
// 브라우저는 이 함수만 호출하므로 OpenAI 키가 노출되지 않는다.

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

const SYSTEM_PROMPT = `너는 '드림아이티비즈 인재풀'의 AI 취업 코치다.
대상은 IT 직무(프론트엔드/백엔드/AI·데이터/기획·디자인) 취업준비생이다.
역할:
- 취업 상담: 커리어 방향, 직무 적합성, 지원 전략을 코칭한다.
- 이력서(레쥬메) 첨삭: 성과를 수치·임팩트 중심으로 다듬어준다.
- 자기소개서 코칭: STAR 구조로 구체적인 경험을 끌어내고 문장을 고쳐준다.
원칙:
- 한국어로, 따뜻하지만 솔직하게 답한다.
- 막연한 칭찬 대신 '무엇을 어떻게 고치면 좋은지' 실행 가능한 피드백을 준다.
- 필요하면 먼저 핵심 질문을 1~2개 던져 정보를 모은다.
- 답변은 간결한 단락과 불릿을 적절히 섞어 읽기 쉽게 구성한다.`

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST만 허용됩니다.' }, 405)

  if (!OPENAI_API_KEY) {
    return json({ error: 'OPENAI_API_KEY 시크릿이 설정되지 않았습니다.' }, 500)
  }

  let messages: { role: string; content: string }[] = []
  try {
    const body = await req.json()
    messages = Array.isArray(body?.messages) ? body.messages : []
  } catch (_) {
    return json({ error: '잘못된 요청 본문입니다.' }, 400)
  }

  // 안전 가드: 사용자/어시스턴트 메시지만, 최근 20개로 제한
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)

  if (clean.length === 0) return json({ error: '메시지가 비어 있습니다.' }, 400)

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.6,
        max_tokens: 900,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...clean],
      }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return json({ error: `OpenAI 오류(${resp.status}): ${text}` }, 502)
    }

    const data = await resp.json()
    const reply = data?.choices?.[0]?.message?.content ?? ''
    return json({ reply })
  } catch (e) {
    return json({ error: `요청 실패: ${e instanceof Error ? e.message : String(e)}` }, 500)
  }
})
