<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const loadPosts = async () => {
  try {
    // Temporarily remove orderBy until index is created
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    posts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    // Sort locally until index is created
    posts.value.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading posts:', error);
    error.value = 'Error al cargar las publicaciones';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPosts();
});

const viewUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
};
</script>

<template>
  <div class="posts-container">
    <div v-if="loading" class="loading">
      Cargando publicaciones...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="posts-feed">
      <div v-for="post in posts" 
           :key="post.id" 
           class="post-card"
           @click="viewUserProfile(post.userId)">
        <div class="post-header">
          <div class="user-info">
            <h3>{{ post.userName }}</h3>
            <span class="user-link">Ver perfil</span>
          </div>
          <span class="date">{{ post.createdAt?.toLocaleDateString() }}</span>
        </div>
        
        <div class="post-content">
          <h2>{{ post.title }}</h2>
          <p class="description">{{ post.description }}</p>
          <p v-if="post.review" class="review">{{ post.review }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.posts-container {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.posts-feed {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  padding: 20px 0;
}

@media (max-width: 1400px) {
  .posts-feed {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .posts-feed {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .post-card {
    margin: 0 10px;
  }
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  margin: 20px 0;
}

.error-message {
  color: #dc3545;
  background: var(--surface);
  border: 1px solid var(--border-color);
}

.posts-feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

.post-card {
  cursor: pointer;
  padding: 20px;
  background: var(--surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
}

.post-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1em;
  font-weight: 600;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9em;
  background: var(--background);
  padding: 4px 8px;
  border-radius: 4px;
}

.post-content h2 {
  margin: 0 0 15px 0;
  color: var(--primary-green);
  font-size: 1.4em;
  line-height: 1.3;
}

.description {
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 1.05em;
}

.review {
  color: var(--text-secondary);
  font-style: italic;
  padding: 15px;
  background: var(--background);
  border-radius: 8px;
  border-left: 4px solid var(--primary-green);
  margin-top: 15px;
  line-height: 1.5;
}

.user-link {
  color: var(--primary-green);
  font-size: 0.9em;
}
</style>