import { useRef, useState } from 'react'
import styles from './LoginHoldButton.module.css'
import vectorIcon from '../../assets/icons/vector.svg'
import { supabase } from '../../api/supabase'
import { clearAuthSession, isAuthenticated, setAuthSession } from '../../utils/authStorage'

type ModalType = 'login' | 'logout' | null

// 로그인 버튼을 위한 시간
const HOLD_DURATION = 2000
// up 버튼으로 동작하는 시간 (delay)
const PROGRESS_VISIBLE_DELAY = 300

// 로그인 버튼 기능
function LoginHoldButton() {
  // 진행률
  const [progress, setProgress] = useState(0)
  // 버튼 누르고 있는지의 여부
  const [isHolding, setIsHolding] = useState(false)

  const [modalType, setModalType] = useState<ModalType>(null)

  // 누르기 시작한 시점 저장
  const holdStartTimeRef = useRef<number | null>(null)
  // requestAnimationFrame id 저장
  const rafRef = useRef<number | null>(null)
  // 로그인 트리거가 이미 실행됐는지 체크
  const loginTriggeredRef = useRef(false)

  // 로그인
  const [loginId, setLoginId] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const resetLoginForm = () => {
    setLoginId('')
    setLoginPw('')
  }

  // 홀드 상태 초기화 함수
  const resetHoldingState = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    holdStartTimeRef.current = null
    setIsHolding(false)
    setProgress(0)
  }

  // 프레임마다 진행률 업데이트
  const updateProgress = (timestamp: number) => {
    if (holdStartTimeRef.current === null) {
      holdStartTimeRef.current = timestamp
    }

    const elapsed = timestamp - holdStartTimeRef.current
    const effectiveElapsed = Math.max(elapsed - PROGRESS_VISIBLE_DELAY, 0)
    const progressDuration = HOLD_DURATION - PROGRESS_VISIBLE_DELAY
    const nextProgress = Math.min(effectiveElapsed / progressDuration, 1)
    setProgress(nextProgress)

    // 지정 시간 이상 누르면 로그인 팝업 실행
    if (elapsed >= HOLD_DURATION) {
      setIsHolding(false)
      const authenticated = isAuthenticated()
      if (!authenticated) {
        resetLoginForm()
      }
      setModalType(isAuthenticated() ? 'logout' : 'login')
      holdStartTimeRef.current = null
      rafRef.current = null
      loginTriggeredRef.current = true
      return
    }

    // 다음 프레임 요청
    rafRef.current = requestAnimationFrame(updateProgress)
  }

  // 마우스/터치로 누르기 시작
  const startHold = () => {
    if (modalType || isHolding) return

    loginTriggeredRef.current = false
    setIsHolding(true)
    setProgress(0)
    holdStartTimeRef.current = null
    rafRef.current = requestAnimationFrame(updateProgress)
  }

  // 누르기 중단 시 초기화
  const stopHold = () => {
    if (!isHolding) return
    resetHoldingState()
  }

  // 일반 클릭 시 맨 위로 스크롤
  const handleClick = () => {
    if (loginTriggeredRef.current) {
      loginTriggeredRef.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeModal = () => {
    resetLoginForm()
    setModalType(null)
  }

  const handleLogout = () => {
    clearAuthSession()
    closeModal()
    window.dispatchEvent(new Event('auth-changed'))
    alert('로그아웃 되었습니다.')
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
        setAuthSession({
          userId: data.id,
          authenticatedAt: new Date().toISOString(),
        })
        closeModal()
        window.dispatchEvent(new Event('auth-changed'))
        alert('로그인 성공')
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

  // 진행률을 각도로 변환
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
        {/* 원형 프로그레스 레이어 */}
        <span
          className={styles.progressLayer}
          style={{
            backgroundImage: `conic-gradient(var(--progress-color) ${progressAngle}, transparent 0deg)`,
          }}
        />
        {/* 버튼 내부 화살표 */}
        <span className={styles.buttonInner} aria-hidden="true">
          <img src={vectorIcon} alt="" />
        </span>
      </button>

      {/* 로그인 */}
      {modalType === 'login' ? (
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
                {isLoggingIn ? '로그인 중' : '로그인'}
              </button>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              disabled={isLoggingIn}
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {modalType === 'logout' ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="로그아웃 확인 팝업">
          <div className={styles.modalCard}>
            <h2>로그아웃</h2>
            <p>로그아웃 하시겠습니까?</p>

            <div className={styles.confirmActions}>
              <button type="button" className={styles.closeButton} onClick={closeModal}>
                취소
              </button>
              <button type="button" className={styles.loginButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default LoginHoldButton