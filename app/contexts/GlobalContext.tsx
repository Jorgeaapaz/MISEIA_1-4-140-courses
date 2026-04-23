'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SerializedUser } from '@/lib/types'

interface GlobalState {
  user: SerializedUser | null
  token: string | null
  setAuth: (user: SerializedUser, token: string) => void
  clearAuth: () => void
  isLoading: boolean
}

const GlobalContext = createContext<GlobalState>({
  user: null,
  token: null,
  setAuth: () => {},
  clearAuth: () => {},
  isLoading: true,
})

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SerializedUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  function setAuth(user: SerializedUser, token: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setToken(token)
  }

  function clearAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return (
    <GlobalContext.Provider value={{ user, token, setAuth, clearAuth, isLoading }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  return useContext(GlobalContext)
}
