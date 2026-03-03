import styles from './CardCommon.module.css'

const EducationCertCard = () => {
  return (
    <>
      <h3 className={styles.cardTitle}>Education & Certificate</h3>

      <div>
        <div className={styles.subTitle}>Education</div>
        <ul className={styles.list}>
          <li>
            현대오토에버 SW 스쿨 <span className={styles.muted}>2025.12~</span>
            <div className={styles.muted}>Frontend / Backend 등 수강</div>
          </li>
        </ul>
      </div>

      <div>
        <div className={styles.subTitle}>자격증</div>
        <ul className={styles.list}>
          <li>SQLD 자격증 <span className={styles.muted}>(2025.08.24)</span></li>
        </ul>
      </div>
    </>
  )
}

export default EducationCertCard