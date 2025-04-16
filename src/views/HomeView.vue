<script setup>
import UserPosts from '../components/UserPosts.vue';
</script>

<template>
  <div class="home-container">
    <h1>Trabajos Recientes</h1>
    <UserPosts />
  </div>
</template>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>