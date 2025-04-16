<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <Navbar v-if="showNavbar" @toggle-theme="toggleTheme" :isDarkMode="isDarkMode" />
    <router-view />
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";

export default {
  components: { Navbar },
  setup() {
    const router = useRouter();

    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true');

    const showNavbar = computed(() => {
      return !["/login", "/register", "/forgot-password"].includes(
        router.currentRoute.value.path
      );
    });
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
    };

    return { showNavbar, isDarkMode, toggleTheme };
  },
};
</script>

<style>
:root {
  /* Light theme variables */
  --primary-green: #2E7D32;
  --secondary-green: #43A047;
  --accent-green: #81C784;
  --background: #f5f5f5;
  --surface: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #546E7A;
  --border-color: #E0E0E0;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

.dark-mode {
  /* Dark theme variables */
  --primary-green: #66BB6A;
  --secondary-green: #4CAF50;
  --accent-green: #81C784;
  --background: #1E1E1E;
  --surface: #2D2D2D;
  --text-primary: #E0E0E0;
  --text-secondary: #B0BEC5;
  --border-color: #424242;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--background);
  min-height: 100vh;
  transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--background);
}

/* Common component styles */
.card {
  background-color: var(--surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.btn {
  background-color: var(--primary-green);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: var(--secondary-green);
}

.input {
  background-color: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 4px;
}

.input:focus {
  border-color: var(--primary-green);
  outline: none;
}
</style>
