import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(router)
app.use(store)

// Initialize the app immediately and handle auth state after mount
app.mount('#app')

// Check authentication state after mounting
store.dispatch('initAuth').catch(error => {
  console.error('Authentication initialization error:', error)
})