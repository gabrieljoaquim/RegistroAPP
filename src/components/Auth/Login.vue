<template>
  <div class="login-container">
    <div class="card">
      <h2 class="title">Iniciar sesión</h2>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            v-model="password"
            type="password"
            id="password"
            required
            placeholder="Ingresa tu contraseña"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Iniciar sesión</span>
          <span v-else>Iniciando...</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="footer-links">
        <router-link to="/forgot-password" class="link">
          ¿Olvidaste tu contraseña?
        </router-link>
        <span class="divider">|</span>
        <router-link to="/register" class="link">
          Crear una cuenta
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { loginWithEmailAndPassword } from "@/services/firebase";

export default {
  setup() {
    const email = ref("");
    const password = ref("");
    const error = ref(null);
    const loading = ref(false);
    const router = useRouter();
    const store = useStore();

    const handleLogin = async () => {
      error.value = null;
      loading.value = true;

      try {
        const result = await loginWithEmailAndPassword(
          email.value,
          password.value
        );

        if (result.success) {
          store.commit("setUser", result.user);
          router.push("/dashboard");
        } else {
          error.value = result.error;
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    return { email, password, error, loading, handleLogin };
  },
};
</script>

<style scoped>
/* Estilos similares al componente de registro */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
}

.footer-links {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.link {
  color: #42b983;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover {
  text-decoration: underline;
}

.divider {
  color: #ccc;
}
</style>
