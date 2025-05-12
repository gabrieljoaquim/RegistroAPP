<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Perfil de Usuario</h2>
      
      <div class="profile-image-section">
        <ProfileImage
          v-model="profileData.imageUrl"
          :userInitial="userInitial"
        />
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="profileData.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="profileData.email" type="email" required />
        </div>

        <div class="form-group">
          <label>Nombre de la Empresa</label>
          <input v-model="profileData.companyName" type="text" />
        </div>

        <div class="form-group">
          <label>Teléfono</label>
          <input v-model="profileData.phone" type="tel" />
        </div>

        <div class="form-group">
          <label>Dirección</label>
          <input v-model="profileData.address" type="text" />
        </div>

        <div class="form-group">
          <label>Slogan de la Empresa</label>
          <input v-model="profileData.slogan" type="text" />
        </div>

        <div v-if="message" :class="['message', message.type]">
          {{ message.text }}
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { axiosInstance } from '@/services/authService';
import ProfileImage from '@/components/ProfileImage.vue';

const store = useStore();
const loading = ref(false);
const message = ref(null);

const profileData = ref({
  name: '',
  email: '',
  companyName: '',
  phone: '',
  address: '',
  slogan: '',
  imageUrl: ''
});

const userInitial = computed(() => {
  return profileData.value.name ? profileData.value.name.charAt(0).toUpperCase() : '';
});

const loadUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    profileData.value = {
      ...profileData.value,
      ...response.data
    };
  } catch (error) {
    console.error('Error loading profile:', error);
    message.value = {
      type: 'error',
      text: 'Error al cargar el perfil'
    };
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    message.value = null;

    const response = await axiosInstance.put('/users/profile', profileData.value);
    
    await store.dispatch('setUser', response.data);
    
    message.value = {
      type: 'success',
      text: 'Perfil actualizado correctamente'
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    message.value = {
      type: 'error',
      text: error.response?.data?.message || 'Error al actualizar el perfil'
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-image-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.profile-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>