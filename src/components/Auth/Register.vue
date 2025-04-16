<template>
  <div class="register-container">
    <div class="card">
      <h2 class="title">Crear una cuenta</h2>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="name">Nombre completo</label>
          <input
            v-model="name"
            type="text"
            id="name"
            required
            placeholder="Ingresa tu nombre"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            minlength="6"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Registrarse</span>
          <span v-else>Creando cuenta...</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="footer-links">
        <router-link to="/login" class="link">
          ¿Ya tienes cuenta? Inicia sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { registerWithEmailAndPassword } from "@/services/firebase";
import { auth } from "@/services/firebase";

export default {
  setup() {
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const error = ref(null);
    const loading = ref(false);
    const router = useRouter();
    const store = useStore();

    // const handleRegister = async () => {
    //   error.value = null;
    //   loading.value = true;

    //   try {
    //     const result = await registerWithEmailAndPassword(
    //       email.value,
    //       password.value,
    //       name.value
    //     );

    //     if (result.success) {
    //       store.commit("setUser", result.user);
    //       router.push("/dashboard");
    //     } else {
    //       error.value = result.error;
    //     }
    //   } catch (err) {
    //     error.value = err.message;
    //   } finally {
    //     loading.value = false;
    //   }
    // };

    const handleRegister = async () => {
      error.value = null;
      const result = await registerWithEmailAndPassword(
        email.value,
        password.value,
        name.value
      );

      if (!result.success) {
        if (result.errorCode === "auth/email-already-in-use") {
          error.value =
            "Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?";
        } else {
          error.value = result.error || "Ocurrió un error al registrarse";
        }
      } else {
        // Redirigir al dashboard o mostrar mensaje de éxito
        console.log("Usuario registrado:", result.user);
      }
    };

    const checkAuthConfig = () => {
      console.log("Configuración actual de Auth:", {
        appName: auth.app.name,
        config: auth.app.options,
        currentUser: auth.currentUser,
      });
    };

    // Llama a esta función cuando se monte tu componente
    checkAuthConfig();

    return { name, email, password, error, loading, handleRegister };
  },
};
</script>

<style scoped>
.register-container {
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
}

.link {
  color: #42b983;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
