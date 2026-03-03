const AUTH_STORAGE_KEY = 'authSession'

export interface AuthSession {
  userId: string
  authenticatedAt: string
}

export const getAuthSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthSession

    if (!parsed?.userId || !parsed?.authenticatedAt) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const setAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const isAuthenticated = () => Boolean(getAuthSession())
