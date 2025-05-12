<template>
  <div class="avatar-container">
    <div class="avatar" v-if="!modelValue">
      {{ userInitial }}
    </div>
    <img v-else :src="modelValue" class="avatar" alt="Profile picture" />
    <label for="profile-image" class="avatar-upload">
      <i class="fas fa-camera"></i>
      <input
        type="file"
        id="profile-image"
        accept="image/*"
        @change="handleImageUpload"
        class="hidden"
      />
    </label>
  </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
  props: {
    modelValue: String,
    userInitial: String
  },
  
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const store = useStore();

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await fetch('http://localhost:3000/api/users/profile-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${store.state.token}`
          },
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');

        const data = await response.json();
        emit('update:modelValue', data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen');
      }
    };

    return {
      handleImageUpload
    };
  }
};
</script>

<style scoped>
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.avatar-upload:hover {
  background: rgba(0, 0, 0, 0.7);
}

.hidden {
  display: none;
}
</style>