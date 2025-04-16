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
          commit('setUser', user)
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
    }
  }
})