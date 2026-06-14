-- ─────────────────────────────────────────────────────────────
-- rest05 스키마 (드림아이티비즈 인재풀)
-- ⚠️ 단일 공유 Supabase 프로젝트(hcmgdztsgjvzcyxyayaj) 사용 →
--    모든 객체는 반드시 rest05_ 접두사를 붙여 충돌을 방지한다.
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여넣고 실행
-- ─────────────────────────────────────────────────────────────

-- 1) 인재 프로필 (가입한 취업준비생 = auth.users 와 1:1)
create table if not exists public.rest05_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text,
  field       text,                       -- 프론트엔드 / 백엔드 / AI·데이터 / 기획·PM / 디자인
  headline    text,                       -- 한 줄 소개
  blurb       text,                       -- 상세 소개
  skills      text[] default '{}',        -- 기술 스택 태그
  status      text   default '구직중',     -- 구직중 / 채용제의 수신중 / 비공개
  is_public   boolean default false,      -- 인재풀 공개 여부
  provider    text,                       -- google / kakao
  -- 실력 증빙 · 5개 축 검증 점수(0~100). 드림아이티비즈 인증 평가로 부여
  score_education  int default 0,          -- 학력
  score_cert       int default 0,          -- 자격
  score_career     int default 0,          -- 경력
  score_portfolio  int default 0,          -- 포트폴리오
  score_assessment int default 0,          -- 역량평가
  -- 종합 인증 점수(5개 축 평균, 자동 계산)
  score_total int generated always as (
    round((score_education + score_cert + score_career + score_portfolio + score_assessment) / 5.0)
  ) stored,
  verified    boolean default false,      -- 인증 완료 여부(검증 통과)
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

comment on table public.rest05_profiles is 'rest05 인재 프로필(취업준비생)';

-- 2) 기업 채용 제의
create table if not exists public.rest05_offers (
  id           bigint generated always as identity primary key,
  talent_id    uuid references public.rest05_profiles(id) on delete cascade,
  company      text not null,
  contact      text not null,             -- 담당자 이메일/연락처
  message      text,
  created_at   timestamptz default now()
);

comment on table public.rest05_offers is 'rest05 기업 → 인재 채용 제의';

-- ─────────────────────────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────────────────────────
alter table public.rest05_profiles enable row level security;
alter table public.rest05_offers   enable row level security;

-- 공개된 인재는 누구나 열람 (기업이 둘러보는 역채용)
drop policy if exists rest05_profiles_select_public on public.rest05_profiles;
create policy rest05_profiles_select_public on public.rest05_profiles
  for select using (is_public = true or auth.uid() = id);

-- 본인 프로필만 생성/수정/삭제
drop policy if exists rest05_profiles_insert_own on public.rest05_profiles;
create policy rest05_profiles_insert_own on public.rest05_profiles
  for insert with check (auth.uid() = id);

drop policy if exists rest05_profiles_update_own on public.rest05_profiles;
create policy rest05_profiles_update_own on public.rest05_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists rest05_profiles_delete_own on public.rest05_profiles;
create policy rest05_profiles_delete_own on public.rest05_profiles
  for delete using (auth.uid() = id);

-- 채용 제의: 누구나(기업) 등록 가능, 해당 인재 본인만 열람
drop policy if exists rest05_offers_insert_any on public.rest05_offers;
create policy rest05_offers_insert_any on public.rest05_offers
  for insert with check (true);

drop policy if exists rest05_offers_select_owner on public.rest05_offers;
create policy rest05_offers_select_owner on public.rest05_offers
  for select using (auth.uid() = talent_id);

-- ─────────────────────────────────────────────────────────────
-- 가입 시 프로필 자동 생성 트리거 (google/kakao 공통)
-- ─────────────────────────────────────────────────────────────
create or replace function public.rest05_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.rest05_profiles (id, email, name, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists rest05_on_auth_user_created on auth.users;
create trigger rest05_on_auth_user_created
  after insert on auth.users
  for each row execute function public.rest05_handle_new_user();
