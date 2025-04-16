<template>
  <nav class="navbar">
    <div class="container">

      <router-link to="/" class="logo">MiApp</router-link>

      <div class="nav-links">
        <template v-if="isAuthenticated">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/profile">Perfil</router-link>
          <button @click="handleLogout" class="logout-btn">
            Cerrar sesión
          </button>
        </template>
        <template v-else>
          <router-link to="/login">Iniciar sesión</router-link>
          <router-link to="/register">Registrarse</router-link>
        </template>
      </div>

      <!-- Add this button before the closing nav tag -->
      <button class="theme-toggle" @click="$emit('toggle-theme')" :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
        <i class="fas" :class="isDarkMode ? 'fa-sun' : 'fa-moon'"></i>
      </button>
    </div>
  </nav>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { logout } from "@/services/firebase";

export default {
  props: {
    isDarkMode: Boolean
  },
  emits: ['toggle-theme'],
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(() => store.getters.isAuthenticated);

    const handleLogout = async () => {
      try {
        await logout();
        store.commit("setUser", null);
        router.push("/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    return { isAuthenticated, handleLogout };
  },
};
</script>

<style scoped>
.navbar {
  background-color: #42b983;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.theme-toggle:hover {
  background-color: var(--accent-green);
  color: var(--surface);
}

.theme-toggle i {
  font-size: 1.2rem;
}
</style>
