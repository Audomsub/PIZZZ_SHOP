import { create } from 'zustand'

export const useUserStore = create((set) => {
  let initialUser = null
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) initialUser = JSON.parse(userStr)
  } catch (e) {
    console.error('Failed to parse user from localStorage', e)
  }

  return {
    user: initialUser,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: (userData, token) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      set({ user: userData, token, isAuthenticated: true })
    },

    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
      window.location.href = '/login'
    },

    initFromStorage: () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        set({ user: JSON.parse(user), token, isAuthenticated: true })
      }
    }
  }
})
