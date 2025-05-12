<template>
  <div class="forgot-password-container">
    <div class="card">
      <h2 class="title">Recuperar Contraseña</h2>

      <form @submit.prevent="handleResetPassword" class="form">
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

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Enviar enlace de recuperación</span>
          <span v-else>Enviando...</span>
        </button>

        <div v-if="message" :class="['message', message.type]">
          {{ message.text }}
        </div>
      </form>

      <div class="footer-links">
        <router-link to="/login" class="link">
          Volver a Iniciar Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";

const email = ref("");
const loading = ref(false);
const message = ref(null);
const router = useRouter();

const handleResetPassword = async () => {
  try {
    loading.value = true;
    message.value = null;

    const result = await authService.resetPassword(email.value);

    if (result.success) {
      message.value = {
        type: 'success',
        text: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
      };
      setTimeout(() => router.push('/login'), 3000);
    } else {
      message.value = {
        type: 'error',
        text: result.error || 'Error al enviar el enlace de recuperación'
      };
    }
  } catch (err) {
    message.value = {
      type: 'error',
      text: 'Error al conectar con el servidor'
    };
    console.error("Reset password error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
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

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.footer-links {
  margin-top: 1.5rem;
  text-align: center;
}

.link {
  color: #42b983;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
