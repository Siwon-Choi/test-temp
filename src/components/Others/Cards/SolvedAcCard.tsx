import { useQuery } from '@tanstack/react-query'
import styles from './CardCommon.module.css'
import {
  getSolvedAcHandle,
  getSolvedAcTierText,
  getSolvedAcUser,
  type SolvedAcUser,
} from '../../../api/solvedAc'

const SolvedAcCard = () => {
  const solvedAcHandle = getSolvedAcHandle()

  const { data, isLoading, isError, error } = useQuery<SolvedAcUser, Error>({
    queryKey: ['solvedac', solvedAcHandle],
    queryFn: () => getSolvedAcUser(solvedAcHandle),
    enabled: Boolean(solvedAcHandle),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const solvedCountText = isLoading ? '불러오는 중...' : data?.solvedCount ?? '-'
  const tierText = isLoading ? '불러오는 중...' : data ? getSolvedAcTierText(data.tier) : '-'
  const maxStreakText = isLoading ? '불러오는 중...' : data?.maxStreak ? `${data.maxStreak}일` : '-'

  return (
    <>
      <h3 className={styles.cardTitle}>Stats</h3>

      <div className={styles.subTitle}>백준 통계</div>

      {solvedAcHandle ? (
        <>
          <ul className={styles.list}>
            <li>핸들: <strong>{solvedAcHandle}</strong></li>
            <li>푼 문제 수: <strong>{solvedCountText}</strong></li>
            <li>현재 티어: <strong>{tierText}</strong></li>
            <li>최대 연속 풀이: <strong>{maxStreakText}</strong></li>
          </ul>

          {isError && (
            <p className={styles.helper}>
              solved.ac 조회 실패: {error?.message ?? 'unknown error'}
            </p>
          )}
        </>
      ) : (
        <p className={styles.helper}>연동된 계정이 존재하지 않습니다.</p>
      )}
    </>
  )
}

export default SolvedAcCard