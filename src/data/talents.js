// 인재(취업준비생) 쇼케이스 데이터.
// 추후 Supabase 테이블(rest05_talents)에서 불러오도록 교체 가능.

export const FILTERS = ['전체', '프론트엔드', '백엔드', 'AI·데이터', '기획·PM', '디자인']

export const TALENTS = [
  {
    field: '프론트엔드',
    name: '김도현',
    headline: 'React로 사용자 경험을 설계하는 프론트엔드 개발자',
    status: '구직중',
    blurb: '디자인 시스템 구축과 접근성에 강점. 실서비스 3종 런칭 경험.',
    skills: ['React', 'TypeScript', 'Vite', '디자인시스템'],
  },
  {
    field: 'AI·데이터',
    name: '이서연',
    headline: '데이터로 의사결정을 돕는 AI·데이터 분석가',
    status: '구직중',
    blurb: 'LLM 파인튜닝과 대시보드 설계. 캐글 상위 5% 입상.',
    skills: ['Python', 'PyTorch', 'SQL', 'LLM'],
  },
  {
    field: '백엔드',
    name: '박준영',
    headline: '대용량 트래픽을 견디는 백엔드 엔지니어',
    status: '채용제의 수신중',
    blurb: 'MSA 설계와 인프라 자동화 경험. 응답속도 40% 개선 사례.',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    field: '기획·PM',
    name: '최유진',
    headline: '문제를 정의하고 팀을 정렬시키는 서비스 기획자',
    status: '구직중',
    blurb: '0→1 신규 서비스 기획. 사용자 인터뷰 기반 그로스 실험 주도.',
    skills: ['서비스기획', 'Figma', '데이터분석', 'A/B테스트'],
  },
  {
    field: '디자인',
    name: '정하늘',
    headline: '브랜드와 제품을 잇는 프로덕트 디자이너',
    status: '구직중',
    blurb: 'UX 리서치부터 UI까지. 모바일 앱 리브랜딩 프로젝트 리드.',
    skills: ['UI/UX', 'Figma', '프로토타이핑', '모션'],
  },
  {
    field: '프론트엔드',
    name: '한지우',
    headline: '인터랙션에 진심인 프론트엔드 개발자',
    status: '채용제의 수신중',
    blurb: '웹 애니메이션·3D 인터랙션 특화. 사내 컴포넌트 라이브러리 제작.',
    skills: ['React', 'Three.js', 'GSAP', 'CSS'],
  },
]

export const FIELDS = [
  { icon: 'F', name: '프론트엔드', desc: '사용자가 만나는 화면을 설계하고 구현하는 인재들이 모여 있습니다.' },
  { icon: 'B', name: '백엔드', desc: '서비스의 안정성과 확장성을 책임지는 서버·인프라 인재들입니다.' },
  { icon: 'A', name: 'AI·데이터', desc: '데이터와 모델로 가치를 만드는 분석가·ML 엔지니어들입니다.' },
  { icon: 'P', name: '기획·PM', desc: '문제를 정의하고 제품의 방향을 잡는 기획·프로덕트 인재들입니다.' },
  { icon: 'D', name: '디자인', desc: '브랜드와 경험을 디자인하는 프로덕트·UX 디자이너들입니다.' },
  { icon: 'O', name: 'DevOps·기타', desc: '배포·운영 자동화 등 제품을 든든히 받치는 다양한 인재들입니다.' },
]

// 기업이 인재를 만나는 절차 (역채용 흐름)
export const STEPS = [
  { no: '01', title: '인재 탐색', desc: '직무·기술 스택으로 필터링해 우리 인재풀을 둘러봅니다.' },
  { no: '02', title: '프로필 열람', desc: '포트폴리오·프로젝트·역량을 한눈에 확인합니다.' },
  { no: '03', title: '채용 제의', desc: '관심 인재에게 기업이 먼저 채용을 제안합니다.' },
  { no: '04', title: '매칭 성사', desc: '드림아이티비즈가 면접·온보딩까지 연결합니다.' },
]

export const STATS = [
  { num: '120+', label: '등록된 인재' },
  { num: '6개', label: '직무 분야' },
  { num: '85%', label: '수료생 취업률' },
  { num: '40+', label: '협력 기업' },
]
