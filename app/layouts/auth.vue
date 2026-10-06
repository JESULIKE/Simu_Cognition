<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,111,212,0.10), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,58,237,0.07), transparent),
    linear-gradient(to bottom, #f0f4fb, #e8eef8);
  padding: 2rem 1rem;
}
</style>
