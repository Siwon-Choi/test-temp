import { useRef, useState } from 'react'
import styles from './LoginHoldButton.module.css'

const HOLD_DURATION = 3000

function LoginHoldButton() {
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)

  const holdStartTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const resetHoldingState = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    holdStartTimeRef.current = null
    setIsHolding(false)
    setProgress(0)
  }

  const updateProgress = (timestamp: number) => {
    if (holdStartTimeRef.current === null) {
      holdStartTimeRef.current = timestamp
    }

    const elapsed = timestamp - holdStartTimeRef.current
    const nextProgress = Math.min(elapsed / HOLD_DURATION, 1)
    setProgress(nextProgress)

    if (nextProgress >= 1) {
      setIsHolding(false)
      setIsLoginPopupOpen(true)
      holdStartTimeRef.current = null
      rafRef.current = null
      return
    }

    rafRef.current = requestAnimationFrame(updateProgress)
  }

  const startHold = () => {
    if (isLoginPopupOpen || isHolding) {
      return
    }

    setIsHolding(true)
    setProgress(0)
    holdStartTimeRef.current = null
    rafRef.current = requestAnimationFrame(updateProgress)
  }

  const stopHold = () => {
    if (!isHolding) {
      return
    }

    resetHoldingState()
  }

  const progressAngle = `${progress * 360}deg`

  return (
    <>
      <button
        type="button"
        className={styles.floatingButton}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        onTouchCancel={stopHold}
        aria-label="3초 길게 눌러 로그인 팝업 열기"
      >
        <span
          className={styles.progressLayer}
          style={{
            backgroundImage: `conic-gradient(var(--progress-color) ${progressAngle}, transparent 0deg)`,
          }}
        />
        <span className={styles.buttonInner}>로그인</span>
      </button>

      {isLoginPopupOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="로그인 팝업">
          <div className={styles.modalCard}>
            <h2>로그인</h2>
            <p>로그인 기능은 아직 준비 중이에요.</p>
            <button type="button" className={styles.closeButton} onClick={() => setIsLoginPopupOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default LoginHoldButton
