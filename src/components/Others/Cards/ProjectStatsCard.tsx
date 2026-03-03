import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from './CardCommon.module.css'
import {
  calculateProjectStats,
  getProjectCategories,
  getSkillRows,
  type ProjectCategoryRow,
  type SkillCountRow,
} from '../../../api/stats'

const ProjectStatsCard = () => {
  const {
    data: projectCategoryRows = [],
    isLoading: pLoading,
    isError: pErr,
  } = useQuery<ProjectCategoryRow[]>({
    queryKey: ['project-categories'],
    queryFn: getProjectCategories,
    staleTime: 1000 * 60 * 10,
  })

  const {
    data: skillRows = [],
    isLoading: sLoading,
    isError: sErr,
  } = useQuery<SkillCountRow[]>({
    queryKey: ['skill-ids'],
    queryFn: getSkillRows,
    staleTime: 1000 * 60 * 10,
  })

  const stats = useMemo(() => calculateProjectStats(projectCategoryRows), [projectCategoryRows])

  const loading = pLoading || sLoading
  const error = pErr || sErr

  const entries = useMemo(() => Object.entries(stats.byCategory), [stats.byCategory])

  return (
    <>
      <h3 className={styles.cardTitle}>Stats</h3>
      <div className={styles.subTitle}>프로젝트 통계</div>

      {loading ? (
        <p className={styles.helper}>불러오는 중...</p>
      ) : error ? (
        <p className={styles.helper}>통계 조회에 실패했습니다.</p>
      ) : (
        <ul className={styles.list}>
          <li>
            총 프로젝트 수: <strong>{stats.total}</strong>
          </li>

          {entries.map(([category, count]) => (
            <li key={category}>
              {category} 프로젝트: <strong>{count}</strong>
            </li>
          ))}

          <li>
            사용 기술 스택 수: <strong>{skillRows.length}</strong>
          </li>
        </ul>
      )}
    </>
  )
}

export default ProjectStatsCard