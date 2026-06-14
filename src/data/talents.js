// 인재(취업준비생) 쇼케이스 데이터.
// 추후 Supabase 테이블(rest05_profiles)에서 불러오도록 교체 가능.

// IT 도메인 한정 + 개발 외 폭넓은 IT 직무까지 포괄
export const FILTERS = [
  '전체', '프론트엔드', '백엔드', 'AI·데이터', 'DevOps·클라우드',
  'QA·테스트', '보안', '기획·PM', '디자인', 'IT마케팅·세일즈', '기술지원·CS',
]

// 드림아이티비즈 인재 인증 평가 5개 축 (실력 증빙)
export const DIMENSIONS = [
  { key: 'education', label: '학력' },
  { key: 'cert', label: '자격' },
  { key: 'career', label: '경력' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'assessment', label: '역량평가' },
]

// 5개 축 점수로 종합 인증 점수(100점 환산) 계산
export function totalScore(scores) {
  const vals = DIMENSIONS.map((d) => scores[d.key] ?? 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export const TALENTS = [
  {
    field: '프론트엔드',
    name: '김도현',
    headline: 'React로 사용자 경험을 설계하는 프론트엔드 개발자',
    status: '구직중',
    blurb: '디자인 시스템 구축과 접근성에 강점. 실서비스 3종 런칭 경험.',
    skills: ['React', 'TypeScript', 'Vite', '디자인시스템'],
    scores: { education: 88, cert: 82, career: 90, portfolio: 96, assessment: 92 },
    website: 'https://example.com', portfolio: 'https://github.com',
  },
  {
    field: 'AI·데이터',
    name: '이서연',
    headline: '데이터로 의사결정을 돕는 AI·데이터 분석가',
    status: '구직중',
    blurb: 'LLM 파인튜닝과 대시보드 설계. 캐글 상위 5% 입상.',
    skills: ['Python', 'PyTorch', 'SQL', 'LLM'],
    scores: { education: 94, cert: 90, career: 84, portfolio: 92, assessment: 95 },
    portfolio: 'https://github.com',
  },
  {
    field: '백엔드',
    name: '박준영',
    headline: '대용량 트래픽을 견디는 백엔드 엔지니어',
    status: '채용제의 수신중',
    blurb: 'MSA 설계와 인프라 자동화 경험. 응답속도 40% 개선 사례.',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    scores: { education: 86, cert: 88, career: 93, portfolio: 89, assessment: 91 },
  },
  {
    field: '기획·PM',
    name: '최유진',
    headline: '문제를 정의하고 팀을 정렬시키는 서비스 기획자',
    status: '구직중',
    blurb: '0→1 신규 서비스 기획. 사용자 인터뷰 기반 그로스 실험 주도.',
    skills: ['서비스기획', 'Figma', '데이터분석', 'A/B테스트'],
    scores: { education: 90, cert: 78, career: 86, portfolio: 88, assessment: 90 },
  },
  {
    field: '디자인',
    name: '정하늘',
    headline: '브랜드와 제품을 잇는 프로덕트 디자이너',
    status: '구직중',
    blurb: 'UX 리서치부터 UI까지. 모바일 앱 리브랜딩 프로젝트 리드.',
    skills: ['UI/UX', 'Figma', '프로토타이핑', '모션'],
    scores: { education: 84, cert: 80, career: 85, portfolio: 97, assessment: 89 },
  },
  {
    field: '프론트엔드',
    name: '한지우',
    headline: '인터랙션에 진심인 프론트엔드 개발자',
    status: '채용제의 수신중',
    blurb: '웹 애니메이션·3D 인터랙션 특화. 사내 컴포넌트 라이브러리 제작.',
    skills: ['React', 'Three.js', 'GSAP', 'CSS'],
    scores: { education: 82, cert: 85, career: 88, portfolio: 95, assessment: 93 },
  },
]

// IT 도메인 한정, 개발 외 폭넓은 직무까지 포괄
export const FIELDS = [
  { icon: 'F', name: '프론트엔드', desc: '사용자가 만나는 화면을 설계하고 구현하는 인재.' },
  { icon: 'B', name: '백엔드', desc: '서비스의 안정성과 확장성을 책임지는 서버 인재.' },
  { icon: 'A', name: 'AI·데이터', desc: '데이터와 모델로 가치를 만드는 분석가·ML 인재.' },
  { icon: 'O', name: 'DevOps·클라우드', desc: '배포·운영 자동화와 클라우드 인프라 인재.' },
  { icon: 'Q', name: 'QA·테스트', desc: '품질을 설계하고 검증하는 테스트 전문 인재.' },
  { icon: 'S', name: '보안', desc: '시스템과 데이터를 지키는 정보보안 인재.' },
  { icon: 'P', name: '기획·PM', desc: '문제를 정의하고 제품 방향을 잡는 기획 인재.' },
  { icon: 'D', name: '디자인', desc: '브랜드와 경험을 디자인하는 UX/UI 인재.' },
  { icon: 'M', name: 'IT마케팅·세일즈', desc: '데이터 기반 그로스·테크 세일즈 인재.' },
  { icon: 'C', name: '기술지원·CS', desc: '고객과 제품을 잇는 기술지원·CS 인재.' },
]

// 기업이 인재를 만나는 절차 (역채용 흐름)
export const STEPS = [
  { no: '01', title: '인재 탐색', desc: '직무·기술 스택으로 필터링해 우리 인재풀을 둘러봅니다.' },
  { no: '02', title: '프로필 열람', desc: '포트폴리오·프로젝트·역량을 한눈에 확인합니다.' },
  { no: '03', title: '채용 제의', desc: '관심 인재에게 기업이 먼저 채용을 제안합니다.' },
  { no: '04', title: '매칭 성사', desc: '드림아이티비즈가 면접·온보딩까지 연결합니다.' },
]

export const STATS = [
  { num: '29명', label: '1기 등록 인재' },
  { num: '10개', label: 'IT 직무 분야' },
  { num: '5축', label: '인증 평가 기준' },
  { num: 'AI', label: '역량평가 · 코칭' },
]
