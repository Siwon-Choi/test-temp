import styles from './CardCommon.module.css'

const CareerCard = () => {
  return (
    <>
      <h3 className={styles.cardTitle}>Career</h3>

      <div>
        <div className={styles.subTitle}>학력 및 커리어</div>
        <ul className={styles.list}>
          <li>연수고등학교 <span className={styles.muted}>2016.03 ~ 2019.02</span></li>
          <li>
            인하대학교 <span className={styles.muted}>2019.03 ~ 2025.08</span>
            <div className={styles.muted}>정보통신공학 전공</div>
          </li>
        </ul>
      </div>
    </>
  )
}

export default CareerCard