import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('ss_token') || null,
  user: JSON.parse(localStorage.getItem('ss_user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('ss_token', token)
    localStorage.setItem('ss_user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
    set({ token: null, user: null })
  },

  isAuthenticated: () => !!localStorage.getItem('ss_token'),
}))

export default useAuthStore
