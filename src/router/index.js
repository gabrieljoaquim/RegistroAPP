import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import Login from '@/components/Auth/Login.vue'
import Register from '@/components/Auth/Register.vue'
import ForgotPassword from '@/components/Auth/ForgotPassword.vue'
import store from '@/store'

const routes = [
  { 
    path: '/', 
    component: Home,
    meta: { title: 'Inicio' }
  },
  { 
    path: '/login', 
    component: Login,
    meta: { title: 'Iniciar sesión', guestOnly: true }
  },
  { 
    path: '/register', 
    component: Register,
    meta: { title: 'Registrarse', guestOnly: true }
  },
  { 
    path: '/forgot-password', 
    component: ForgotPassword,
    meta: { title: 'Recuperar contraseña', guestOnly: true }
  },
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { title: 'Dashboard', requiresAuth: true }
  },
  { 
    path: '/profile', 
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'userProfile',
    component: () => import('../views/ProfileView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'UserProfile',
    component: () => import('../components/UserProfileDetail.vue'),
    props: true
  },
  {
    path: '/budget',
    name: 'budget',
    component: () => import('../views/BudgetView.vue')
  },
  {
    path: '/budgets',
    name: 'budgets',
    component: () => import('../views/BudgetListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budget/:id/edit',
    name: 'editBudget',
    component: () => import('../views/BudgetView.vue'),
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // Cambiar el título de la página
  document.title = to.meta.title ? `${to.meta.title} | MiApp` : 'MiApp'
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next('/login')
  } 
  // Verificar si la ruta es solo para invitados
  else if (to.meta.guestOnly && store.getters.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router