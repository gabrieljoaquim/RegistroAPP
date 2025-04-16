<script setup>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useRoute } from 'vue-router';

const route = useRoute();
const profileId = computed(() => route.params.id);
const isOwnProfile = computed(() => !profileId.value || profileId.value === auth.currentUser?.uid);

const user = ref(null);
const profile = ref({
  name: '',
  about: '',
  experiences: [],
  education: [],
  skills: [],
  languages: []
});

const newExperience = ref({
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  description: ''
});

const newEducation = ref({
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: ''
});

const newSkill = ref('');
const newLanguage = ref('');
const editMode = ref(false);

const loadProfile = async () => {
  try {
    const userId = profileId.value || auth.currentUser?.uid;
    if (userId) {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        profile.value = {
          name: data.name || '',
          about: data.about || '',
          experiences: data.experiences || [],
          education: data.education || [],
          skills: data.skills || [],
          languages: data.languages || []
        };
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
};

// Replace the existing onMounted with this:
onMounted(() => {
  loadProfile();
});

// Add these methods for updating profile data
const addExperience = async () => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const newExp = { ...newExperience.value, id: Date.now() };
    
    await updateDoc(userRef, {
      experiences: arrayUnion(newExp)
    });
    
    profile.value.experiences.push(newExp);
    newExperience.value = { title: '', company: '', location: '', startDate: '', endDate: '', description: '' };
  } catch (error) {
    console.error('Error adding experience:', error);
  }
};

const addEducation = async () => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const newEdu = { ...newEducation.value, id: Date.now() };
    
    await updateDoc(userRef, {
      education: arrayUnion(newEdu)
    });
    
    profile.value.education.push(newEdu);
    newEducation.value = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
  } catch (error) {
    console.error('Error adding education:', error);
  }
};

const addSkill = async () => {
  if (!newSkill.value.trim()) return;
  
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      skills: arrayUnion(newSkill.value.trim())
    });
    
    profile.value.skills.push(newSkill.value.trim());
    newSkill.value = '';
  } catch (error) {
    console.error('Error adding skill:', error);
  }
};

const deleteExperience = async (expId) => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const expToDelete = profile.value.experiences.find(exp => exp.id === expId);
    
    await updateDoc(userRef, {
      experiences: arrayRemove(expToDelete)
    });
    
    profile.value.experiences = profile.value.experiences.filter(exp => exp.id !== expId);
  } catch (error) {
    console.error('Error deleting experience:', error);
  }
};

const deleteEducation = async (eduId) => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const eduToDelete = profile.value.education.find(edu => edu.id === eduId);
    
    await updateDoc(userRef, {
      education: arrayRemove(eduToDelete)
    });
    
    profile.value.education = profile.value.education.filter(edu => edu.id !== eduId);
  } catch (error) {
    console.error('Error deleting education:', error);
  }
};

const deleteSkill = async (skill) => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      skills: arrayRemove(skill)
    });
    
    profile.value.skills = profile.value.skills.filter(s => s !== skill);
  } catch (error) {
    console.error('Error deleting skill:', error);
  }
};

// Añadir la función de actualizar nombre
const updateUserName = async (newName) => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      name: newName
    });
    
    profile.value.name = newName;
  } catch (error) {
    console.error('Error updating user name:', error);
  }
};
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>{{ isOwnProfile ? 'Mi Perfil Profesional' : 'Perfil Profesional' }}</h1>
      <button v-if="isOwnProfile" @click="editMode = !editMode">
        {{ editMode ? 'Ver Perfil' : 'Editar Perfil' }}
      </button>
    </div>

    <div v-if="!editMode || !isOwnProfile" class="profile-view">
      <section class="profile-section">
        <h2>Experiencia</h2>
        <div v-for="exp in profile.experiences" :key="exp.id" class="experience-card">
          <div class="card-header">
            <h3>{{ exp.title }}</h3>
            <button v-if="isOwnProfile" class="delete-btn" @click="deleteExperience(exp.id)">×</button>
          </div>
          <p>{{ exp.company }} - {{ exp.location }}</p>
          <p>{{ exp.startDate }} - {{ exp.endDate }}</p>
          <p>{{ exp.description }}</p>
        </div>
      </section>

      <section class="profile-section">
        <h2>Educación</h2>
        <div v-for="edu in profile.education" :key="edu.id" class="education-card">
          <div class="card-header">
            <h3>{{ edu.degree }}</h3>
            <button v-if="isOwnProfile" class="delete-btn" @click="deleteEducation(edu.id)">×</button>
          </div>
          <p>{{ edu.institution }}</p>
          <p>{{ edu.startDate }} - {{ edu.endDate }}</p>
        </div>
      </section>

      <section class="profile-section">
        <h2>Habilidades</h2>
        <div class="skills-container">
          <div v-for="skill in profile.skills" :key="skill" class="skill-tag">
            {{ skill }}
            <button v-if="isOwnProfile" class="delete-btn small" @click="deleteSkill(skill)">×</button>
          </div>
        </div>
      </section>
    </div>

    <div v-if="editMode && isOwnProfile" class="profile-edit">
      <section class="edit-section">
        <h2>Información Personal</h2>
        <form @submit.prevent="updateUserName(profile.name)" class="form-group">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="profile.name" type="text" placeholder="Tu nombre" required>
          </div>
          <button type="submit">Actualizar Nombre</button>
        </form>
      </section>
      <section>
      <h2>Agregar Experiencia</h2>
      <form @submit.prevent="addExperience" class="form-group">
        <input v-model="newExperience.title" placeholder="Cargo" required>
        <input v-model="newExperience.company" placeholder="Empresa" required>
        <input v-model="newExperience.location" placeholder="Ubicación">
        <input type="date" v-model="newExperience.startDate" required>
        <input type="date" v-model="newExperience.endDate">
        <textarea v-model="newExperience.description" placeholder="Descripción"></textarea>
        <button type="submit">Agregar Experiencia</button>
      </form>
    </section>

    <section class="edit-section">
      <h2>Agregar Educación</h2>
      <form @submit.prevent="addEducation" class="form-group">
        <input v-model="newEducation.institution" placeholder="Institución" required>
        <input v-model="newEducation.degree" placeholder="Título" required>
        <input v-model="newEducation.field" placeholder="Campo de estudio">
        <input type="date" v-model="newEducation.startDate" required>
        <input type="date" v-model="newEducation.endDate">
        <button type="submit">Agregar Educación</button>
      </form>
    </section>

    <section class="edit-section">
      <h2>Agregar Habilidad</h2>
      <form @submit.prevent="addSkill" class="form-group">
        <input v-model="newSkill" placeholder="Nueva habilidad">
        <button type="submit">Agregar Habilidad</button>
      </form>
    </section>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.profile-header h1 {
  color: var(--text-primary);
  font-size: 1.8em;
  margin: 0;
}

.profile-header button {
  background: var(--primary-green);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-header button:hover {
  background: var(--secondary-green);
  transform: translateY(-2px);
}

.profile-section {
  margin-bottom: 30px;
  padding: 25px;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.profile-section h2 {
  color: var(--text-primary);
  font-size: 1.4em;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-green);
}

.experience-card, .education-card {
  background: var(--background);
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.experience-card:hover, .education-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.card-header h3 {
  color: var(--primary-green);
  font-size: 1.2em;
  margin: 0;
}

.experience-card p, .education-card p {
  color: var(--text-primary);
  margin: 8px 0;
  line-height: 1.5;
}

.delete-btn {
  background: var(--surface);
  color: #dc3545;
  border: 2px solid #dc3545;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  padding: 0;
  font-size: 18px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
}

.delete-btn.small {
  width: 22px;
  height: 22px;
  line-height: 18px;
  font-size: 16px;
  margin-left: 8px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--background);
  color: var(--text-primary);
  border: 1px solid var(--primary-green);
  border-radius: 20px;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.skill-tag:hover {
  background: var(--primary-green);
  color: white;
}

.edit-section {
  background: var(--surface);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.edit-section h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input, textarea {
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-green);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

button[type="submit"] {
  background: var(--primary-green);
  color: white;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

button[type="submit"]:hover {
  background: var(--secondary-green);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-section, .edit-section {
    padding: 15px;
  }
}
</style>