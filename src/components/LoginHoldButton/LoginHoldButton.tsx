import { useRef, useState } from 'react'
import styles from './LoginHoldButton.module.css'
import vectorIcon from '../../assets/icons/vector.svg'
import { supabase } from '../../api/supabase'
const HOLD_DURATION = 2000
const PROGRESS_VISIBLE_DELAY = 300

function LoginHoldButton() {
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)

  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const holdStartTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const loginTriggeredRef = useRef(false)

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
    if (holdStartTimeRef.current === null) holdStartTimeRef.current = timestamp

    const elapsed = timestamp - holdStartTimeRef.current
    const effectiveElapsed = Math.max(elapsed - PROGRESS_VISIBLE_DELAY, 0)
    const progressDuration = HOLD_DURATION - PROGRESS_VISIBLE_DELAY
    const nextProgress = Math.min(effectiveElapsed / progressDuration, 1)
    setProgress(nextProgress)

    if (elapsed >= HOLD_DURATION) {
      setIsHolding(false)
      setIsLoginPopupOpen(true)
      holdStartTimeRef.current = null
      rafRef.current = null
      loginTriggeredRef.current = true
      return
    }

    rafRef.current = requestAnimationFrame(updateProgress)
  }

  const startHold = () => {
    if (isLoginPopupOpen || isHolding) return

    loginTriggeredRef.current = false
    setIsHolding(true)
    setProgress(0)
    holdStartTimeRef.current = null
    rafRef.current = requestAnimationFrame(updateProgress)
  }

  const stopHold = () => {
    if (!isHolding) return
    resetHoldingState()
  }

  const handleClick = () => {
    if (loginTriggeredRef.current) {
      loginTriggeredRef.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = async () => {
    if (isLoggingIn) return

    const id = loginId.trim()
    const password = loginPw

    if (!id || !password) {
      alert('아이디/비밀번호를 입력하세요.')
      return
    }

    try {
      setIsLoggingIn(true)

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .eq('password', password)
        .maybeSingle()

      if (error) throw error

      if (data?.id) {
        alert('로그인 성공')
        setIsLoginPopupOpen(false)
        // 필요하면 "로그인 여부"만 저장
        localStorage.setItem('isLoggedIn', 'true')
      } else {
        alert('로그인 실패')
      }
    } catch (e) {
      console.error(e)
      alert('로그인 실패')
    } finally {
      setIsLoggingIn(false)
    }
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
        onClick={handleClick}
        aria-label="맨 위로 이동"
      >
        <span
          className={styles.progressLayer}
          style={{
            backgroundImage: `conic-gradient(var(--progress-color) ${progressAngle}, transparent 0deg)`,
          }}
        />
        <span className={styles.buttonInner} aria-hidden="true">
          <img src={vectorIcon} alt="" className={styles.icon} />
        </span>
      </button>

      {isLoginPopupOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="로그인 팝업">
          <div className={styles.modalCard}>
            <h2>로그인</h2>

            <div className={styles.form}>
              <input
                className={styles.input}
                placeholder="아이디"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoFocus
              />
              <input
                className={styles.input}
                placeholder="비밀번호"
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin()
                }}
              />

              <button
                type="button"
                className={styles.loginButton}
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? '로그인 중...' : '로그인'}
              </button>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsLoginPopupOpen(false)}
              disabled={isLoggingIn}
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default LoginHoldButton