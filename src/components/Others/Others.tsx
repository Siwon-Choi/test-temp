import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from './Others.module.css'
import {
  calculateProjectStats,
  getProjectCategories,
  getSkillRows,
  type ProjectCategoryRow,
  type SkillCountRow,
} from '../../api/portfolio'
import {
  getSolvedAcHandle,
  getSolvedAcTierText,
  getSolvedAcUser,
  type SolvedAcUser,
} from '../../api/solvedac'

const solvedAcHandle = getSolvedAcHandle()

const Others = () => {
  const { data: solvedAc, isLoading: solvedLoading } = useQuery<SolvedAcUser>({
    queryKey: ['solvedac', solvedAcHandle],
    queryFn: () => getSolvedAcUser(solvedAcHandle),
    enabled: Boolean(solvedAcHandle),
    staleTime: 1000 * 60 * 10,
  })

  const { data: projectCategories = [] } = useQuery<ProjectCategoryRow[]>({
    queryKey: ['project-category-counts'],
    queryFn: getProjectCategories,
  })

  const { data: skillRows = [] } = useQuery<SkillCountRow[]>({
    queryKey: ['skill-count'],
    queryFn: getSkillRows,
  })

  const projectStats = useMemo(() => calculateProjectStats(projectCategories), [projectCategories])

  const tierText = solvedAc ? getSolvedAcTierText(solvedAc.tier) : '데이터 확인 중'

  return (
    <section className={styles.others}>
      <h2 className={styles.title}>Others</h2>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>📌 백준 / solved.ac 지표</h3>
          {solvedAcHandle ? (
            <ul className={styles.list}>
              <li>핸들: <strong>{solvedAcHandle}</strong></li>
              <li>푼 문제 수: <strong>{solvedLoading ? '불러오는 중...' : solvedAc?.solvedCount ?? '-'}</strong></li>
              <li>현재 티어: <strong>{tierText}</strong></li>
              <li>최대 연속 풀이: <strong>{solvedLoading ? '-' : `${solvedAc?.maxStreak ?? 0}일`}</strong></li>
              <li>arena rating: <strong>{solvedLoading ? '-' : solvedAc?.arenaRating ?? '-'}</strong></li>
            </ul>
          ) : (
            <p className={styles.helper}>`VITE_SOLVEDAC_HANDLE` 환경변수를 설정하면 계정 지표가 표시됩니다.</p>
          )}
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
