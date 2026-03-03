import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthContextValue = {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_STORAGE_KEY = 'portfolio-auth-logged-in'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    setIsLoggedIn(stored === 'true')
  }, [])

  const login = () => {
    setIsLoggedIn(true)
    window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }

  const logout = () => {
    setIsLoggedIn(false)
    window.localStorage.setItem(AUTH_STORAGE_KEY, 'false')
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      login,
      logout,
    }),
    [isLoggedIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  }

  return context
}
