import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './FloatingQuickActions.module.css'

const LONG_PRESS_MS = 3000

const FloatingQuickActions = () => {
  const { isLoggedIn, login, logout } = useAuth()

  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleLongPress = () => {
    longPressTriggeredRef.current = true

    if (!isLoggedIn) {
      const shouldLogin = window.confirm('로그인 팝업을 띄워 로그인 처리로 넘어갈까요?')
      if (shouldLogin) {
        login()
        window.alert('로그인 상태로 변경되었습니다. (세부 로직은 추후 연결)')
      }
      return
    }

    const shouldLogout = window.confirm('로그아웃하시겠습니까?')
    if (shouldLogout) {
      logout()
      window.alert('로그아웃되었습니다.')
    }
  }

  const startLongPress = () => {
    clearLongPressTimer()
    longPressTriggeredRef.current = false

    longPressTimerRef.current = window.setTimeout(() => {
      handleLongPress()
    }, LONG_PRESS_MS)
  }

  const stopLongPress = () => {
    clearLongPressTimer()
  }

  const onScrollTopClick = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.authStatus}
        aria-label={isLoggedIn ? '현재 로그인 상태' : '현재 로그아웃 상태'}
      >
        {isLoggedIn ? 'ON' : 'OFF'}
      </button>

      <button
        type="button"
        className={styles.scrollTopButton}
        aria-label="맨 위로 이동, 3초 길게 누르면 로그인/로그아웃"
        onMouseDown={startLongPress}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={stopLongPress}
        onTouchCancel={stopLongPress}
        onClick={onScrollTopClick}
      >
        ↑
      </button>
    </div>
  )
}

export default FloatingQuickActions
