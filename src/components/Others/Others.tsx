import styles from './Others.module.css'
import SolvedAcCard from './Cards/SolvedAcCard'
import CareerCard from './Cards/CareerCard'
import EducationCertCard from './Cards/EducationCertCard'
import ProjectStatsCard from './Cards/ProjectStatsCard'

const Others = () => {
  return (
    <section className={styles.others}>
      <h2 className={styles.title}>Others</h2>

      <div className={styles.grid}>

        <article className={styles.card}>
          <CareerCard />
        </article>
        <article className={styles.card}>
          <EducationCertCard />
        </article>
        <article className={styles.card}>
          <SolvedAcCard />
        </article>
        <article className={styles.card}>
          <ProjectStatsCard />
        </article>
      </div>
    </section>
  )
}

export default Others