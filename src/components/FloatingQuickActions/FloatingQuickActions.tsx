import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './FloatingQuickActions.module.css'

const LONG_PRESS_MS = 3000

const FloatingQuickActions = () => {
  const { isLoggedIn, login, logout } = useAuth()

  const [pressProgress, setPressProgress] = useState(0)

  const rafRef = useRef<number | null>(null)
  const pressStartedAtRef = useRef(0)
  const isPressingRef = useRef(false)
  const longPressTriggeredRef = useRef(false)

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const stopPressTracking = (resetProgress = true) => {
    isPressingRef.current = false

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (resetProgress) {
      setPressProgress(0)
    }
  }

  const triggerLongPressAction = () => {
    longPressTriggeredRef.current = true
    stopPressTracking(false)
    setPressProgress(1)

    if (!isLoggedIn) {
      const shouldLogin = window.confirm('로그인하시겠습니까?')
      if (shouldLogin) {
        login()
      }
    } else {
      const shouldLogout = window.confirm('로그아웃하시겠습니까?')
      if (shouldLogout) {
        logout()
      }
    }

    window.setTimeout(() => {
      setPressProgress(0)
    }, 120)
  }

  const tickProgress = () => {
    if (!isPressingRef.current) return

    const elapsed = performance.now() - pressStartedAtRef.current
    const nextProgress = Math.min(elapsed / LONG_PRESS_MS, 1)
    setPressProgress(nextProgress)

    if (nextProgress >= 1) {
      triggerLongPressAction()
      return
    }

    rafRef.current = window.requestAnimationFrame(tickProgress)
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    longPressTriggeredRef.current = false
    isPressingRef.current = true
    pressStartedAtRef.current = performance.now()
    setPressProgress(0)

    event.currentTarget.setPointerCapture(event.pointerId)

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = window.requestAnimationFrame(tickProgress)
  }

  const onPointerEnd = () => {
    stopPressTracking()
  }

  const onScrollTopClick = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buttonStyle = {
    '--press-progress': `${pressProgress}`,
  } as CSSProperties

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.scrollTopButton}
        style={buttonStyle}
        aria-label={isLoggedIn ? '맨 위로 이동, 3초 길게 누르면 로그아웃' : '맨 위로 이동, 3초 길게 누르면 로그인'}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerEnd}
        onPointerLeave={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={onScrollTopClick}
      >
        <span className={styles.icon}>↑</span>
      </button>
    </div>
  )
}

export default FloatingQuickActions
