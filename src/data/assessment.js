import { DIMENSIONS } from './talents'

// ─────────────────────────────────────────────────────────────
// 직무분야별 역량 점검(평가) 항목.
// 각 항목을 '갖췄을 때' 해당 축 점수에 가산되고, 축별 100점 상한.
// 5개 축 평균 = 종합 인증 점수.
// (취준생 자가 점검 → 드림아이티비즈가 증빙 검토 후 확정)
// ─────────────────────────────────────────────────────────────

// 모든 직무 공통(학력/자격/경력) — 모든 지원자에게 동일 적용되는 객관 기준
const common = (certName) => [
  { dim: 'education', label: '관련 전공 학위 또는 부트캠프/교육과정 수료', points: 70 },
  { dim: 'education', label: '직무 관련 추가 교육·연수 이수', points: 30 },
  { dim: 'cert', label: `${certName} 직무 자격 보유`, points: 60 },
  { dim: 'cert', label: '어학·기타 공인 자격', points: 40 },
  { dim: 'career', label: '인턴/실무 6개월 이상', points: 50 },
  { dim: 'career', label: '관련 팀 프로젝트 2건 이상', points: 50 },
]

// 직무별 포트폴리오/역량평가 항목을 합쳐 완성
const make = (certName, portfolio, evals) => [
  ...common(certName),
  ...portfolio.map(([label, points]) => ({ dim: 'portfolio', label, points })),
  ...evals.map(([label, points]) => ({ dim: 'assessment', label, points })),
]

export const ASSESSMENT = {
  '프론트엔드': make('정보처리기사',
    [['배포된 실서비스/웹앱 보유', 50], ['GitHub 꾸준한 활동(커밋/오픈소스)', 30], ['반응형·웹접근성 구현 경험', 20]],
    [['프론트엔드 코딩테스트 통과', 55], ['React 기술 면접 모의평가 통과', 45]]),
  '백엔드': make('정보처리기사/SQLD',
    [['API·서버 배포 운영 경험', 50], ['기술 블로그/문서화', 30], ['대용량·성능 개선 사례', 20]],
    [['백엔드 코딩테스트 통과', 55], ['시스템 설계 면접 모의평가 통과', 45]]),
  'AI·데이터': make('ADsP/빅데이터분석기사',
    [['모델·분석 프로젝트 공개', 50], ['Kaggle·논문·블로그 실적', 30], ['데이터 파이프라인 구축 경험', 20]],
    [['데이터 코딩테스트 통과', 55], ['ML 기술 면접 모의평가 통과', 45]]),
  'DevOps·클라우드': make('AWS/CKA 등 클라우드 자격',
    [['CI/CD 파이프라인 구축 사례', 50], ['IaC(Terraform 등) 활용', 30], ['모니터링·운영 자동화 경험', 20]],
    [['인프라 실무 과제 평가 통과', 55], ['장애 대응 시나리오 평가 통과', 45]]),
  'QA·테스트': make('ISTQB 등 QA 자격',
    [['테스트 케이스·자동화 산출물', 50], ['버그 리포팅·QA 문서', 30], ['테스트 자동화 도구 활용', 20]],
    [['테스트 설계 과제 평가 통과', 55], ['QA 실무 면접 모의평가 통과', 45]]),
  '보안': make('정보보안기사/CISSP 등',
    [['모의해킹·취약점 분석 보고서', 50], ['CTF·보안 활동 실적', 30], ['보안 솔루션 운영 경험', 20]],
    [['보안 실무 과제 평가 통과', 55], ['보안 기술 면접 모의평가 통과', 45]]),
  '기획·PM': make('컴활/PMP 등',
    [['서비스 기획서·릴리즈 사례', 50], ['데이터 분석 리포트', 30], ['사용자 리서치 수행 경험', 20]],
    [['케이스 인터뷰 모의평가 통과', 55], ['지표·논리 구조화 평가 통과', 45]]),
  '디자인': make('GTQ/컬러리스트 등',
    [['UI/UX 포트폴리오 사이트', 50], ['실제 출시된 디자인 사례', 30], ['디자인 시스템 구축 경험', 20]],
    [['포트폴리오 디자인 리뷰 통과', 55], ['UX 과제 모의평가 통과', 45]]),
  'IT마케팅·세일즈': make('GAIQ/마케팅 자격 등',
    [['캠페인·그로스 성과 자료', 50], ['콘텐츠·채널 운영 실적', 30], ['CRM·데이터 분석 경험', 20]],
    [['마케팅 실무 과제 평가 통과', 55], ['세일즈 롤플레이 평가 통과', 45]]),
  '기술지원·CS': make('컴활/IT 기초 자격',
    [['기술지원·CS 운영 경험 자료', 50], ['매뉴얼·FAQ 작성 실적', 30], ['티켓·이슈 처리 경험', 20]],
    [['CS 시나리오 평가 통과', 55], ['기술 이해도 평가 통과', 45]]),
}

// 정의되지 않은 직무를 위한 공통 기본 기준(폭넓은 IT 직무 포괄)
const DEFAULT_ITEMS = make('직무 관련 자격',
  [['직무 산출물 포트폴리오', 50], ['관련 활동·실적 자료', 30], ['실무 도구 활용 경험', 20]],
  [['직무 실무 과제 평가 통과', 55], ['직무 면접 모의평가 통과', 45]])

/** 직무분야 점검항목(정의 없으면 공통 기본) */
export function getItems(field) {
  return ASSESSMENT[field] || DEFAULT_ITEMS
}

/** 체크된 항목 라벨 Set → 축별 점수(0~100) */
export function computeScores(field, checkedSet) {
  const byDim = {}
  DIMENSIONS.forEach((d) => (byDim[d.key] = 0))
  getItems(field).forEach((it) => {
    if (checkedSet.has(it.label)) byDim[it.dim] = Math.min(100, byDim[it.dim] + it.points)
  })
  return byDim
}

/** 직무분야 점검항목을 축별로 그룹핑 */
export function itemsByDimension(field) {
  const items = getItems(field)
  return DIMENSIONS.map((d) => ({ ...d, items: items.filter((it) => it.dim === d.key) }))
}
