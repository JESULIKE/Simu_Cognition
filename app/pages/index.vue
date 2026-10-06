<template>
  <div class="redirect-screen">
    <div class="spinner"></div>
    <p>Redirigiendo a Simu-Cognition...</p>
  </div>
</template>

<script setup lang="ts">
const { status } = useAuth()

onMounted(() => {
  navigateTo('/dashboard')
})
</script>

<style scoped>
.redirect-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
