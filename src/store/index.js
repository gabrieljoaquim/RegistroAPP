import { createStore } from 'vuex'
import { authStateListener } from '@/services/firebase'

export default createStore({
  state: {
    user: null,
    authIsReady: false
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload
    },
    setAuthIsReady(state, payload) {
      state.authIsReady = payload
    }
  },
  actions: {
    async initAuth({ commit }) {
      return new Promise((resolve) => {
        authStateListener((user) => {
          // Si tenemos un usuario, guardamos sus datos
          if (user) {
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }
            commit('setUser', userData)
          } else {
            commit('setUser', null)
          }
          commit('setAuthIsReady', true)
          resolve(user)
        })
      })
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user
    },
    currentUser(state) {
      return state.user
    },
    // Nuevo getter para obtener el email del usuario
    userEmail(state) {
      return state.user?.email || ''
    }
  }
})