import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from './Others.module.css'
import { supabase } from '../../api/supabase'

type SolvedAcUser = {
  solvedCount: number
  tier: number
  maxStreak: number
  arenaRating: number
}

type ProjectCategoryRow = {
  category: string | null
}

type SkillCountRow = {
  skill_id: number
}

const allTier = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby']
const allSubtier = ['V', 'IV', 'III', 'II', 'I']

const getTierText = (idx: number) => {
  if (!idx || idx < 1) return 'Unrated'

  const tier = Number.isInteger(idx / 5) ? Math.floor(idx / 5) - 1 : Math.floor(idx / 5)
  const safeTier = Math.min(Math.max(tier, 0), allTier.length - 1)

  let subtier = 0
  if (idx % 5 === 1) subtier = 0
  else if (idx % 5 === 0) subtier = 4
  else subtier = (idx % 5) - 1

  return `${allTier[safeTier]} ${allSubtier[subtier]}`
}

const normalizeCategory = (category: string | null) => category?.trim().toLowerCase() ?? ''

const Others = () => {
  const { data: solvedAc, isLoading: solvedLoading } = useQuery<SolvedAcUser>({
    queryKey: ['solvedac', 'dipokal'],
    queryFn: async () => {
      const response = await fetch('https://solved.ac/api/v3/user/show?handle=dipokal')
      if (!response.ok) {
        throw new Error('Failed to fetch solved.ac profile')
      }
      return response.json() as Promise<SolvedAcUser>
    },
    staleTime: 1000 * 60 * 10,
  })

  const { data: projectCategories = [] } = useQuery<ProjectCategoryRow[]>({
    queryKey: ['project-category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project').select('category')
      if (error) throw error
      return (data ?? []) as ProjectCategoryRow[]
    },
  })

  const { data: skillRows = [] } = useQuery<SkillCountRow[]>({
    queryKey: ['skill-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('skill').select('skill_id')
      if (error) throw error
      return (data ?? []) as SkillCountRow[]
    },
  })

  const projectStats = useMemo(() => {
    return projectCategories.reduce(
      (acc, row) => {
        const category = normalizeCategory(row.category)

        acc.total += 1
        if (category.includes('front')) acc.frontend += 1
        else if (category.includes('back')) acc.backend += 1
        else if (category.includes('mobile')) acc.mobile += 1
        else acc.other += 1

        return acc
      },
      { total: 0, frontend: 0, backend: 0, mobile: 0, other: 0 },
    )
  }, [projectCategories])

  const tierText = solvedAc ? getTierText(solvedAc.tier) : '데이터 확인 중'

  return (
    <section className={styles.others}>
      <h2 className={styles.title}>Others</h2>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>📌 백준 / solved.ac 지표</h3>
          <ul className={styles.list}>
            <li>푼 문제 수: <strong>{solvedLoading ? '불러오는 중...' : solvedAc?.solvedCount ?? '-'}</strong></li>
            <li>현재 티어: <strong>{tierText}</strong></li>
            <li>최대 연속 풀이: <strong>{solvedLoading ? '-' : `${solvedAc?.maxStreak ?? 0}일`}</strong></li>
            <li>arena rating: <strong>{solvedLoading ? '-' : solvedAc?.arenaRating ?? '-'}</strong></li>
          </ul>
          <p className={styles.helper}>문제 해결력 지표를 통해 꾸준함과 알고리즘 기반 사고력을 보여줄 수 있습니다.</p>
        </article>

        <article className={styles.card}>
          <h3 className={styles.cardTitle}>📊 프로젝트 통계</h3>
          <ul className={styles.list}>
            <li>총 프로젝트 수: <strong>{projectStats.total}</strong></li>
            <li>Frontend 프로젝트: <strong>{projectStats.frontend}</strong></li>
            <li>Backend 프로젝트: <strong>{projectStats.backend}</strong></li>
            <li>Mobile 프로젝트: <strong>{projectStats.mobile}</strong></li>
            <li>기타 카테고리: <strong>{projectStats.other}</strong></li>
            <li>사용 기술 스택 수: <strong>{skillRows.length}</strong></li>
          </ul>
          <p className={styles.helper}>단순 나열보다 숫자로 보여주면 포트폴리오 신뢰도가 높아집니다.</p>
        </article>

        <article className={styles.card}>
          <h3 className={styles.cardTitle}>🧭 개발자 커리어</h3>
          <ul className={styles.timeline}>
            <li><span>인하대학교 정보통신공학과</span><em>기초 CS/공학 역량</em></li>
            <li><span>현대오토에버 SW 스쿨</span><em>실무형 프로젝트 협업 경험</em></li>
          </ul>
          <p className={styles.helper}>추가하면 좋은 항목: 협업 방식(Git Flow), 코드 품질 활동(리팩터링/테스트), 배포 운영 경험(CI/CD).</p>
        </article>
      </div>
    </section>
  )
}

export default Others
