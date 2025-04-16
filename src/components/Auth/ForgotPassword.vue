<template>
  <div class="forgot-password-container">
    <div class="card">
      <h2 class="title">Recuperar contraseña</h2>

      <form @submit.prevent="handleResetPassword" class="form">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            id="email"
            required
            placeholder="Ingresa tu correo electrónico"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Enviar enlace</span>
          <span v-else>Enviando...</span>
        </button>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="footer-links">
        <router-link to="/login" class="link">
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { sendPasswordReset } from "@/services/firebase";

export default {
  setup() {
    const email = ref("");
    const error = ref(null);
    const successMessage = ref(null);
    const loading = ref(false);
    const router = useRouter();

    const handleResetPassword = async () => {
      error.value = null;
      successMessage.value = null;
      loading.value = true;

      try {
        const result = await sendPasswordReset(email.value);

        if (result.success) {
          successMessage.value =
            "Se ha enviado un correo con instrucciones para restablecer tu contraseña.";
        } else {
          error.value = result.error || "Ocurrió un error al enviar el correo.";
        }
      } catch (err) {
        error.value = err.message || "Ocurrió un error inesperado.";
      } finally {
        loading.value = false;
      }
    };

    return { email, error, successMessage, loading, handleResetPassword };
  },
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

.success-message {
  color: #42b983;
  margin-top: 1rem;
  text-align: center;
}

.error-message {
  color: #ff4444;
  margin-top: 1rem;
  text-align: center;
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
