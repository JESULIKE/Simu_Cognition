<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">SC</div>
        <span class="brand-name">Simu-Cognition</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Simulador
        </NuxtLink>
        <NuxtLink to="/dashboard/historial" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Historial
        </NuxtLink>
        <NuxtLink to="/dashboard/datasets" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Calibrar Datos
        </NuxtLink>
        <NuxtLink to="/dashboard/validacion" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Validación Empírica
        </NuxtLink>
      </nav>


    </aside>

    <!-- Main -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100dvh;
}

/* ── Sidebar ── */
.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100dvh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.8rem;
  color: #fff;
  box-shadow: 0 0 12px var(--color-primary-glow);
}

.brand-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    background var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease);
}
.nav-item:hover { background: var(--color-surface-2); color: var(--color-text); }
.nav-item--active {
  background: rgba(59,111,212,0.10);
  color: var(--color-primary);
  font-weight: 600;
}



/* ── Main ── */
.main-content {
  background: var(--color-bg);
  overflow-y: auto;
  padding: 2rem;
}

@media (max-width: 900px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; flex-direction: row; flex-wrap: wrap; }
}
</style>
