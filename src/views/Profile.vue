<template>
  <div class="profile">
    <h1>Tu perfil</h1>

    <div class="profile-card">
      <div class="profile-info">
        <ProfileImage
          v-model="profileImage"
          :userInitial="userInitial"
        />
        <div class="details">
          <h2>{{ userName }}</h2>
          <p>{{ userEmail }}</p>
          <p>Miembro desde: {{ joinDate }}</p>
        </div>
      </div>

      <div class="actions">
        <button @click="changePassword" class="btn-secondary">
          Cambiar contraseña
        </button>
        <button @click="deleteAccount" class="btn-danger">
          Eliminar cuenta
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import ProfileImage from '@/components/ProfileImage.vue';

export default {
  components: {
    ProfileImage
  },
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const profileImage = ref(null);

    const user = computed(() => store.state.user);

    const userInitial = computed(() => {
      return user.value?.email?.charAt(0).toUpperCase() || "U";
    });

    const userName = computed(() => {
      return (
        user.value?.displayName || user.value?.email?.split("@")[0] || "Usuario"
      );
    });

    const userEmail = computed(() => {
      return user.value?.email || "";
    });

    const joinDate = computed(() => {
      if (!user.value?.metadata?.creationTime) return "Fecha desconocida";
      return new Date(user.value.metadata.creationTime).toLocaleDateString();
    });

    const changePassword = () => {
      router.push("/forgot-password");
    };

    const deleteAccount = () => {
      if (
        confirm(
          "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
        )
      ) {
        console.log("Cuenta eliminada");
      }
    };

    onMounted(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/profile/image', {
          headers: {
            'Authorization': `Bearer ${store.state.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          profileImage.value = data.imageUrl;
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    });

    return {
      userInitial,
      userName,
      userEmail,
      joinDate,
      changePassword,
      deleteAccount,
      profileImage,
    };
  },
};
</script>

<style scoped>
.profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.details h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.details p {
  color: #666;
  margin-bottom: 0.25rem;
}

.actions {
  display: flex;
  gap: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #cc0000;
}
</style>
