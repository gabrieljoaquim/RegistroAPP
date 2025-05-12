<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { axiosInstance } from '@/services/authService';

const store = useStore();
const newPost = ref({
  title: '',
  description: '',
  review: ''
});

const posts = ref([]);
const loading = ref(false);
const editingPost = ref(null);

const createPost = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.post('/posts', {
      title: newPost.value.title,
      description: newPost.value.description,
      review: newPost.value.review
    });

    // Reset form
    newPost.value = {
      title: '',
      description: '',
      review: ''
    };
    
    await loadPosts();
  } catch (error) {
    console.error('Error creating post:', error);
  } finally {
    loading.value = false;
  }
};

const loadPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts');
    posts.value = response.data.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt)
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

const deletePost = async (post) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
    try {
      await axiosInstance.delete(`/posts/${post.id}`);
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }
};

const startEditing = (post) => {
  editingPost.value = { ...post };
};

const updatePost = async () => {
  try {
    await axiosInstance.put(`/posts/${editingPost.value.id}`, {
      title: editingPost.value.title,
      description: editingPost.value.description,
      review: editingPost.value.review
    });
    editingPost.value = null;
    await loadPosts();
  } catch (error) {
    console.error('Error updating post:', error);
  }
};

onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="create-post-section">
      <h2>Crear Nueva Publicación</h2>
      <form @submit.prevent="createPost" class="post-form">
        <div class="form-group">
          <input 
            v-model="newPost.title" 
            type="text" 
            placeholder="Título del trabajo"
            required
          >
        </div>
        
        <div class="form-group">
          <textarea 
            v-model="newPost.description" 
            placeholder="Descripción del trabajo"
            required
          ></textarea>
        </div>
        
        <div class="form-group">
          <textarea 
            v-model="newPost.review" 
            placeholder="Reseña o comentarios adicionales"
          ></textarea>
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Publicando...' : 'Publicar Trabajo' }}
        </button>
      </form>
    </div>

    <div class="posts-section">
      <h2>Mis Trabajos</h2>
      <div class="posts-grid">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div v-if="editingPost?.id === post.id" class="edit-form">
            <input v-model="editingPost.title" type="text">
            <textarea v-model="editingPost.description"></textarea>
            <textarea v-model="editingPost.review"></textarea>
            <div class="edit-buttons">
              <button @click="updatePost">Guardar</button>
              <button @click="editingPost = null">Cancelar</button>
            </div>
          </div>
          
          <div v-else>
            <div class="post-content">
              <h3>{{ post.title }}</h3>
              <p class="description">{{ post.description }}</p>
              <p class="review">{{ post.review }}</p>
              <p class="date">{{ post.createdAt?.toLocaleDateString() }}</p>
            </div>
            <div class="post-actions">
              <button @click="startEditing(post)" class="edit-btn">Editar</button>
              <button @click="deletePost(post)" class="delete-btn">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.create-post-section {
  background: var(--surface);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.create-post-section h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input, textarea {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 5px;
  background: var(--background);
  color: var(--text-primary);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-green);
}

button[type="submit"] {
  background: var(--primary-green);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background: var(--secondary-green);
}

.posts-section h2 {
  color: var(--text-primary);
  margin: 30px 0 20px;
}

.post-card {
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.post-content {
  padding: 20px;
}

.post-content h3 {
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.description {
  color: var(--text-primary);
  margin-bottom: 12px;
}

.review {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--background);
  border-radius: 8px;
  border-left: 4px solid var(--primary-green);
}

.date {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: var(--background);
  border-top: 1px solid var(--border-color);
}

.edit-form {
  padding: 20px;
  background: var(--surface);
}

.edit-form input,
.edit-form textarea {
  width: 100%;
  margin-bottom: 12px;
}

.edit-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.edit-buttons button:first-child {
  background: var(--primary-green);
  color: white;
}

.edit-buttons button:last-child {
  background: var(--background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.form-group {
  display: flex;
  flex-direction: column;
}

textarea {
  min-height: 100px;
}

.file-input-label {
  background: #f0f2f5;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.file-input-label input {
  display: none;
}

.image-preview {
  max-width: 300px;
  margin: 10px 0;
}

.image-preview img {
  width: 100%;
  border-radius: 4px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-content {
  padding: 15px;
}

.post-content h3 {
  margin: 0 0 10px 0;
}

.description {
  color: #444;
  margin-bottom: 10px;
}

.review {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.date {
  color: #888;
  font-size: 0.9em;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
}

.edit-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #0077b5;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.edit-form {
  padding: 15px;
}

.edit-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
