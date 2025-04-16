import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(store)
app.use(router)

// Inicializar autenticación antes de montar la app
store.dispatch('initAuth').then(() => {
  app.mount('#app')
})