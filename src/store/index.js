import { createStore } from 'vuex';
import { authService } from '@/services/authService';

export default createStore({
  state: {
    user: null,
    isAuthenticated: false
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    }
  },
  actions: {
    async initAuth({ commit }) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          commit('setUser', null);
          return;
        }

        const response = await authService.getCurrentUser();
        if (response) {
          commit('setUser', response);
        } else {
          localStorage.removeItem('token');
          commit('setUser', null);
        }
      } catch (error) {
        console.error('Init auth error:', error);
        localStorage.removeItem('token');
        commit('setUser', null);
      }
    },

    async register({ commit }, userData) {
      try {
        const response = await authService.register(userData);
        commit('setUser', response.user);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    async login({ commit }, { email, password }) {
      try {
        const response = await authService.login(email, password);
        commit('setUser', response.user);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
});