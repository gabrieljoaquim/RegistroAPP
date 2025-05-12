<template>
  <div class="budgets-container">
    <div class="header-actions">
      <h2>Mis Presupuestos</h2>
      <router-link to="/budget" class="create-budget-btn">
        Crear Nuevo Presupuesto
      </router-link>
    </div>

    <div class="budgets-grid">
      <div v-for="budget in budgets" 
           :key="budget.id" 
           class="budget-card">
        <div class="budget-header">
          <h3>Cliente: {{ budget.clientName }}</h3>
          <span class="date">{{ budget.createdAt?.toLocaleDateString() }}</span>
        </div>
        
        <div class="budget-items">
          <div v-for="(item, index) in budget.items" 
               :key="index" 
               class="budget-item">
            <span>{{ item.description }}</span>
          </div>
        </div>
        
        <div class="budget-footer">
  <div class="totals">
    <div>Subtotal: ${{ budget.subtotal?.toFixed(2) || '0.00' }}</div>
    <div>IVA (19%): ${{ budget.iva?.toFixed(2) || '0.00' }}</div>
    <div class="total">Total Final: ${{ budget.grandTotal?.toFixed(2) || '0.00' }}</div>
  </div>
</div>
        <div class="budget-actions">
          <button 
            @click="handleGeneratePDF(budget)" 
            class="action-btn">
            Generar PDF
          </button>
          <router-link 
            :to="`/budget/${budget.id}/edit`" 
            class="action-btn edit-btn">
            Editar
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { axiosInstance } from '@/services/authService';
import { generatePDF } from '../utils/pdfGenerator';
import { saveAs } from 'file-saver';

const store = useStore();
const budgets = ref([]);
const loading = ref(true);
const userData = ref(null);

const loadUserData = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    userData.value = {
      companyName: response.data.companyName || '',
      phone: response.data.phone || '',
      email: response.data.email || '',
      address: response.data.address || '',
      slogan: response.data.slogan || ''
    };
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

const handleGeneratePDF = async (budget) => {
  try {
    if (!userData.value) {
      await loadUserData();
    }

    const pdfDoc = await generatePDF(budget, userData.value);
    pdfDoc.download(`Presupuesto-${budget.clientName}.pdf`);

    if (confirm('¿Deseas ver el PDF en el navegador?')) {
      pdfDoc.open();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const loadBudgets = async () => {
  try {
    const response = await axiosInstance.get('/budgets');
    budgets.value = response.data.map(budget => ({
      ...budget,
      createdAt: new Date(budget.createdAt),
      subtotal: Number(budget.subtotal || 0),
      iva: Number(budget.iva || 0),
      grandTotal: Number(budget.grandTotal || 0)
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading budgets:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBudgets();
  loadUserData();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.create-budget-btn {
  background-color: var(--accent-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.budget-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background-color: var(--accent-color);
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: var(--secondary-color);
}

.budgets-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.budget-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.budget-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.date {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.budget-item {
  display: block;
  padding: 4px 0;
  color: var(--text-primary);
}

.budget-items {
  margin: 15px 0;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 10px;
}

.budget-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid var(--border-color);
}

.totals {
  text-align: right;
}

.total {
  font-weight: bold;
  font-size: 1.1em;
  margin-top: 5px;
  color: var(--text-primary);
}

.loading, .no-budgets {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>