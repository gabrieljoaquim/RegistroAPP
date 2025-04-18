<template>
  <div class="pdf-data-form">
    <h3>Datos para el PDF</h3>
    <form @submit.prevent="saveData">
      <div class="form-group">
        <label>Nombre de la Empresa</label>
        <input v-model="pdfData.companyName" type="text" required>
      </div>

      <div class="form-group">
        <label>Dirección</label>
        <input v-model="pdfData.address" type="text" required>
      </div>

      <div class="form-group">
        <label>Correo Electrónico</label>
        <input v-model="pdfData.email" type="email" required>
      </div>

      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="pdfData.phone" type="tel" required>
      </div>

      <div class="form-group">
        <label>Eslogan</label>
        <input v-model="pdfData.slogan" type="text">
      </div>

      <div class="form-group">
        <label>Nombre del Cliente</label>
        <input v-model="pdfData.clientName" type="text" required>
      </div>

      <div class="form-group">
        <label>Agradecimiento</label>
        <textarea v-model="pdfData.thankYouMessage" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label>Logo de la Empresa</label>
        <input type="file" @change="handleLogoUpload" accept="image/*">
        <img v-if="pdfData.logo" :src="pdfData.logo" class="logo-preview">
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn">Guardar Datos</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'pdf_company_data';

const pdfData = ref({
  companyName: '',
  address: '',
  email: '',
  phone: '',
  slogan: '',
  clientName: '',
  thankYouMessage: '',
  logo: null
});

// Add this function after the imports
const compressImage = (base64String, maxWidth = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

// Modify handleLogoUpload
const handleLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        // Compress image before saving
        const compressedImage = await compressImage(e.target.result);
        pdfData.value.logo = compressedImage;
        await saveData(false); // Pass false to avoid showing success message for logo upload
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error al procesar la imagen. Intente con una imagen más pequeña.');
    }
  }
};

// Modify saveData to accept a parameter for showing alert
const saveData = async (showAlert = true) => {
  try {
    const dataString = JSON.stringify(pdfData.value);
    
    // Check approximate size before saving
    if (dataString.length > 4900000) { // Leave some buffer below 5MB limit
      throw new Error('storage_limit');
    }
    
    localStorage.setItem(STORAGE_KEY, dataString);
    if (showAlert) {
      alert('Datos guardados correctamente');
    }
  } catch (error) {
    console.error('Error saving PDF data:', error);
    if (error.message === 'storage_limit') {
      alert('El logo es demasiado grande. Por favor, utilice una imagen más pequeña.');
    } else {
      alert('Error al guardar los datos');
    }
  }
};

const loadData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      pdfData.value = JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading PDF data:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.pdf-data-form {
  background: var(--surface);
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-primary);
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background);
  color: var(--text-primary);
}

.logo-preview {
  max-width: 200px;
  margin-top: 10px;
}

.form-actions {
  margin-top: 20px;
}

.save-btn {
  background-color: var(--accent-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  opacity: 0.9;
}
</style>