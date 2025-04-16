<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const user = ref(null);
const userPosts = ref([]);
const loading = ref(true);
const error = ref(null);

const loadUserData = async () => {
  try {
    // Load user profile
    const userDoc = await getDoc(doc(db, 'users', props.userId));
    if (userDoc.exists()) {
      user.value = userDoc.data();
    }

    // Load user posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', props.userId),
      orderBy('createdAt', 'desc')
    );
    const postsSnap = await getDocs(postsQuery);
    userPosts.value = postsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (err) {
    error.value = 'Error cargando el perfil';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<template>
  <div class="profile-detail">
    <div v-if="loading" class="loading">
      Cargando perfil...
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="profile-content">
      <div class="user-info-section">
        <h2>{{ user.name }}</h2>
        <div class="contact-info">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p v-if="user.phone"><strong>Teléfono:</strong> {{ user.phone }}</p>
        </div>
      </div>

      <div class="experience-section" v-if="user.experiences?.length">
        <h3>Experiencia</h3>
        <div v-for="exp in user.experiences" :key="exp.id" class="experience-card">
          <h4>{{ exp.title }}</h4>
          <p>{{ exp.company }} - {{ exp.location }}</p>
          <p>{{ exp.startDate }} - {{ exp.endDate }}</p>
          <p>{{ exp.description }}</p>
        </div>
      </div>

      <div class="user-posts-section">
        <h3>Publicaciones</h3>
        <div class="user-posts-grid">
          <div v-for="post in userPosts" :key="post.id" class="post-card">
            <h4>{{ post.title }}</h4>
            <p>{{ post.description }}</p>
            <span class="date">{{ post.createdAt?.toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-content {
  display: grid;
  gap: 30px;
}

.user-info-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.contact-info {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.experience-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.experience-card {
  padding: 15px;
  margin: 10px 0;
  border-left: 4px solid #1a73e8;
  background: #f8f9fa;
  border-radius: 4px;
}

.user-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
}

.error-message {
  color: #dc3545;
}

@media (max-width: 768px) {
  .user-posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>