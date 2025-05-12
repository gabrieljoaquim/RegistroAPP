<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { axiosInstance } from '@/services/authService';
import { saveAs } from 'file-saver';
import PDFDataForm from '../components/PDFDataForm.vue';

// Update pdfMake imports
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { documentStyles, defaultFonts } from '../utils/pdfConfig';

const router = useRouter();
const newBudget = ref({
  postId: '',
  clientName: '',
  items: [],
  total: 0,
  status: 'pending',
  createdAt: null
});

const budgetItem = ref({
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0
});

const userPosts = ref([]);
const budgets = ref([]);
const loading = ref(false);

const loadUserPosts = async () => {
  try {
    const response = await axiosInstance.get('/posts/user');
    userPosts.value = response.data;
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};






const addItemToBudget = () => {
  const total = budgetItem.value.quantity * budgetItem.value.unitPrice;
  newBudget.value.items.push({
    ...budgetItem.value,
    total
  });
  newBudget.value.total += total;
  
  // Reset item form
  budgetItem.value = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  };
};

const removeItem = (index) => {
  const item = newBudget.value.items[index];
  newBudget.value.total -= item.total;
  newBudget.value.items.splice(index, 1);
};

const route = useRoute();
// Mover la definición de isEditing después de definir route
const isEditing = computed(() => route.params.id);

// Añadir función para cargar el presupuesto existente
const loadExistingBudget = async () => {
  if (isEditing.value) {
    try {
      const budgetDoc = await getDoc(doc(db, 'budgets', route.params.id));
      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        newBudget.value = {
          postId: data.postId,
          clientName: data.clientName,
          items: data.items,
          total: data.total,
          status: data.status,
          createdAt: data.createdAt
        };
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  }
};

// Modificar la función createBudget para manejar tanto creación como actualización
// Añadir después de la definición de budgetItem
const operationalCosts = ref({
  workers: {
    officials: { quantity: 0, dailyRate: 0 },
    helpers: { quantity: 0, dailyRate: 0 }
  },
  duration: 0, // días estimados
  daily: {
    transport: 0,
    food: 0,
    lodging: 0
  },
  equipment: {
    rental: 0,
    scaffolding: 0
  },
  administrativeRate: 10 // porcentaje por defecto
});

// Añadir método para calcular costos operativos
// Modificar el método calculateOperationalCosts
const calculateOperationalCosts = () => {
  const { workers, duration, daily, equipment } = operationalCosts.value;
  
  // Costo total de trabajadores
  const workersTotal = duration * (
    (workers.officials.quantity * workers.officials.dailyRate) +
    (workers.helpers.quantity * workers.helpers.dailyRate)
  );

  // Total de trabajadores para costos diarios
  const totalWorkers = workers.officials.quantity + workers.helpers.quantity;
  
  // Costos diarios totales
  const dailyTotal = duration * totalWorkers * (
    daily.transport +
    daily.food +
    daily.lodging
  );

  // Costos de equipos
  const equipmentTotal = equipment.rental + equipment.scaffolding;

  // Total operativo (suma de todos los costos)
  const total = workersTotal + dailyTotal + equipmentTotal;

  return {
    workersTotal,
    dailyTotal,
    equipmentTotal,
    total
  };
};

// Modificar el método calculateTotals
const calculateTotals = computed(() => {
  // Total de materiales (suma de items)
  const materialsTotal = newBudget.value.total;
  
  // Total de costos operativos
  const operationalResult = calculateOperationalCosts();
  
  // Subtotal (materiales + costos operativos)
  const subtotal = materialsTotal + operationalResult.total;
  
  // Gastos administrativos sobre el subtotal
  const administrativeRate = operationalCosts.value.administrativeRate;
  const administrativeCost = subtotal * (administrativeRate / 100);
  
  // Total antes de IVA
  const totalBeforeIVA = subtotal + administrativeCost;
  
  // Cálculo del IVA
  const iva = totalBeforeIVA * 0.19;
  
  // Total final
  const grandTotal = totalBeforeIVA + iva;

  return {
    materialsTotal,
    operationalTotal: operationalResult.total,
    subtotal,
    administrativeCost,
    totalBeforeIVA,
    iva,
    grandTotal,
    administrativeRate
  };
});

// Modificar createBudget para incluir los costos operativos
const createBudget = async () => {
  try {
    loading.value = true;
    const totals = calculateTotals.value;
    const budgetData = {
      ...newBudget.value,
      operationalCosts: operationalCosts.value,
      materialsTotal: totals.materialsTotal,
      operationalTotal: totals.operationalTotal,
      subtotal: totals.subtotal,
      administrativeCost: totals.administrativeCost,
      totalBeforeIVA: totals.totalBeforeIVA,
      iva: totals.iva,
      grandTotal: totals.grandTotal,
      userId: auth.currentUser.uid,
      updatedAt: new Date()
    };

    if (isEditing.value) {
      // Actualizar presupuesto existente
      await updateDoc(doc(db, 'budgets', route.params.id), budgetData);
    } else {
      // Crear nuevo presupuesto
      budgetData.createdAt = new Date();
      await addDoc(collection(db, 'budgets'), budgetData);
    }

    // Redirigir a la lista de presupuestos
    router.push('/budgets');
  } catch (error) {
    console.error('Error saving budget:', error);
  } finally {
    loading.value = false;
  }
};

// Modificar onMounted para cargar el presupuesto si estamos editando
// Eliminar el segundo onMounted y mantener solo este
onMounted(() => {
  loadUserPosts();
  loadUserData();
  loadExistingBudget();
});

const userData = ref({
  companyName: '',
  phone: '',
  email: '',
  address: '',
  slogan: ''
});

const loadUserData = async () => {
  try {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      userData.value = {
        companyName: userDoc.data().companyName || '',
        phone: userDoc.data().phone || '',
        email: userDoc.data().email || '',
        address: userDoc.data().address || '',
        slogan: userDoc.data().slogan || ''
      };
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

const generatePDF = async () => {
  const fileName = prompt('Nombre para el archivo PDF:', 'Presupuesto');
  if (!fileName) return;

  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: documentStyles.defaultStyle,
    styles: documentStyles.styles,
    content: [
      { text: userData.value.companyName, style: 'header' },
      { text: userData.value.slogan, style: 'slogan' },
      {
        columns: [
          {
            text: [
              `Tel: ${userData.value.phone}\n`,
              `Email: ${userData.value.email}\n`,
              `Dirección: ${userData.value.address}\n`
            ]
          },
          {
            text: `Fecha: ${new Date().toLocaleDateString()}`,
            alignment: 'right'
          }
        ]
      },
      { text: 'PRESUPUESTO', style: 'subheader', margin: [0, 20, 0, 10] },
      { text: `Cliente: ${newBudget.value.clientName}`, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Descripción', 'Cantidad', 'Precio Unit.', 'Total'],
            ...newBudget.value.items.map(item => [
              item.description,
              item.quantity.toString(),
              `$${item.unitPrice.toFixed(2)}`,
              `$${item.total.toFixed(2)}`
            ])
          ]
        }
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                ['Subtotal Materiales:', `$${calculateTotals.value.materialsTotal.toFixed(2)}`],
                ['Gastos Operativos:', `$${calculateTotals.value.operationalTotal.toFixed(2)}`],
                ['Gastos Administrativos:', `$${calculateTotals.value.administrativeCost.toFixed(2)}`],
                ['Subtotal:', `$${calculateTotals.value.subtotalWithAdmin.toFixed(2)}`],
                ['IVA (19%):', `$${calculateTotals.value.iva.toFixed(2)}`],
                ['Total Final:', `$${calculateTotals.value.grandTotal.toFixed(2)}`]
              ]
            },
            layout: 'noBorders',
            margin: [0, 20, 0, 0]
          }
        ]
      }
    ]
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  
  pdfDoc.getBlob(async (blob) => {
    const file = new File([blob], `${fileName}.pdf`, { type: 'application/pdf' });
    
    if (confirm('¿Deseas guardar el PDF?')) {
      saveAs(file, `${fileName}.pdf`);
    }
    
    if (confirm('¿Deseas compartir el PDF?')) {
      try {
        await navigator.share({
          files: [file],
          title: 'Presupuesto',
          text: 'Compartir presupuesto'
        });
      } catch (error) {
        console.error('Error sharing:', error);
        const shareUrl = URL.createObjectURL(file);
        window.open(shareUrl, '_blank');
      }
    }
  });
};

onMounted(() => {
  loadUserPosts();
  loadUserData();
});
// Configurar fuentes antes de generar el PDF
pdfMake.fonts = defaultFonts;
</script>

<template>
  <div class="budget-container">

    <PDFDataForm />
    
    <div class="header-actions">
      <h2>{{ isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto' }}</h2>
      <router-link to="/budgets" class="view-budgets-btn">
        Ver Presupuestos
      </router-link>
    </div>
    
    <form @submit.prevent="createBudget" class="budget-form">
      <div class="form-group">
        <label>Trabajo</label>
        <select v-model="newBudget.postId" required>
          <option value="">Seleccionar trabajo</option>
          <option v-for="post in userPosts" 
                  :key="post.id" 
                  :value="post.id">
            {{ post.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Nombre del Cliente</label>
        <input v-model="newBudget.clientName" 
               type="text" 
               required 
               placeholder="Nombre del cliente">
      </div>

      <div class="items-section">
        <h3>Ítems del Presupuesto</h3>
        
        <div class="add-item-form">
          <input v-model="budgetItem.description" 
                 type="text" 
                 placeholder="Descripción">
          <input v-model.number="budgetItem.quantity" 
                 type="number" 
                 min="1">
          <input v-model.number="budgetItem.unitPrice" 
                 type="number" 
                 min="0">
          <button type="button" 
                  @click="addItemToBudget" 
                  :disabled="!budgetItem.description">
            Añadir Ítem
          </button>
        </div>

        <!-- Añadir después de la sección de items -->
<div class="operational-costs-section">
  <h3>Costos Operativos</h3>
  
  <div class="workers-section">
    <h4>Personal</h4>
    <div class="worker-inputs">
      <div class="worker-group">
        <label>Oficiales</label>
        <input v-model.number="operationalCosts.workers.officials.quantity" type="number" min="0" placeholder="Cantidad">
        <input v-model.number="operationalCosts.workers.officials.dailyRate" type="number" min="0" placeholder="Valor por día">
      </div>
      <div class="worker-group">
        <label>Ayudantes</label>
        <input v-model.number="operationalCosts.workers.helpers.quantity" type="number" min="0" placeholder="Cantidad">
        <input v-model.number="operationalCosts.workers.helpers.dailyRate" type="number" min="0" placeholder="Valor por día">
      </div>
    </div>
  </div>

  <div class="duration-section">
    <label>Duración estimada (días)</label>
    <input v-model.number="operationalCosts.duration" type="number" min="1">
  </div>

  <div class="daily-costs-section">
    <h4>Costos Diarios</h4>
    <div class="daily-inputs">
      <div class="cost-group">
        <label>Transporte</label>
        <input v-model.number="operationalCosts.daily.transport" type="number" min="0">
      </div>
      <div class="cost-group">
        <label>Alimentación</label>
        <input v-model.number="operationalCosts.daily.food" type="number" min="0">
      </div>
      <div class="cost-group">
        <label>Hospedaje</label>
        <input v-model.number="operationalCosts.daily.lodging" type="number" min="0">
      </div>
    </div>
  </div>

  <div class="equipment-section">
    <h4>Alquiler de Equipos</h4>
    <div class="equipment-inputs">
      <div class="cost-group">
        <label>Equipos</label>
        <input v-model.number="operationalCosts.equipment.rental" type="number" min="0">
      </div>
      <div class="cost-group">
        <label>Escaleras/Andamios</label>
        <input v-model.number="operationalCosts.equipment.scaffolding" type="number" min="0">
      </div>
    </div>
  </div>

  <div class="administrative-section">
    <label>Gastos Administrativos</label>
    <select v-model.number="operationalCosts.administrativeRate">
      <option value="5">5%</option>
      <option value="10">10%</option>
      <option value="15">15%</option>
      <option value="20">20%</option>
    </select>
  </div>
</div>


<!-- Modificar la sección del total -->
<div class="budget-total">
  <div>Total Materiales: ${{ calculateTotals.materialsTotal.toFixed(2) }}</div>
  <div>Total Gastos Operativos: ${{ calculateTotals.operationalTotal.toFixed(2) }}</div>
  <div>Subtotal: ${{ calculateTotals.subtotal.toFixed(2) }}</div>
  <div>Gastos Administrativos ({{ operationalCosts.administrativeRate }}%): 
       ${{ calculateTotals.administrativeCost.toFixed(2) }}</div>
  <div>TOTAL: ${{ calculateTotals.totalBeforeIVA.toFixed(2) }}</div>
  <div>IVA (19%): ${{ calculateTotals.iva.toFixed(2) }}</div>
  <div class="grand-total">Total Final: ${{ calculateTotals.grandTotal.toFixed(2) }}</div>
</div>


        <div class="items-list">
          <div v-for="(item, index) in newBudget.items" 
               :key="index" 
               class="budget-item">
            <span>{{ item.description }}</span>
            <span>{{ item.quantity }}</span>
            <span>${{ item.unitPrice }}</span>
            <span>${{ item.total }}</span>
            <button type="button" 
                    @click="removeItem(index)" 
                    class="delete-btn">
              X
            </button>
          </div>
        </div>

        <div class="budget-total">
          Total: ${{ newBudget.total }}
        </div>
      </div>

      <button type="submit" :disabled="loading || !newBudget.items.length">
        {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto') }}
      </button>
    </form>

  </div>
  
</template>

<style scoped>
.budget-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.budget-form {
  background: var(--surface);
  padding: 25px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.items-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--background);
  border-radius: 8px;
}
.operational-costs-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--background);
  border-radius: 8px;
}

.worker-inputs, .daily-inputs, .equipment-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 10px 0;
}

.worker-group, .cost-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.duration-section, .administrative-section {
  margin: 15px 0;
}

.grand-total {
  font-size: 1.4em;
  color: var(--accent-color);
  margin-top: 10px;
}
.add-item-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.items-list {
  margin-top: 20px;
}

.budget-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.delete-btn {
  background: var(--danger-color, #dc3545);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: var(--danger-color-dark, #c82333);
}

.budget-total {
  text-align: right;
  margin-top: 20px;
  font-weight: bold;
  font-size: 1.2em;
  color: var(--text-primary);
}

button {
  background: var(--primary-green);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.generate-pdf-btn {
  margin-top: 20px;
  background: var(--secondary-green);
}


.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-budgets-btn {
  background-color: var(--accent-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.view-budgets-btn:hover {
  background-color: var(--accent-color-dark);
}


</style>
