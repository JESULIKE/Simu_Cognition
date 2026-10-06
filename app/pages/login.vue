<template>
  <div class="login-page animate-fade-in">
    <div class="login-card card">
      <!-- Header -->
      <div class="login-header">
        <div class="brand-mark">
          <span class="brand-mark-text">SC</span>
        </div>
        <h1>Simu-Cognition</h1>
        <p>Simulador de curvas de aprendizaje para docentes</p>
      </div>

      <!-- Formulario -->
      <form id="login-form" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input"
            placeholder="tu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="label" for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button
          id="login-submit"
          type="submit"
          class="btn btn-primary login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" />
          <span>{{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
        </button>

        <div class="divider">
          <span>o</span>
        </div>

        <NuxtLink to="/dashboard" class="btn btn-ghost direct-btn">
          <span>🚀 Entrar directamente al Simulador (Modo Local)</span>
        </NuxtLink>
      </form>

      <!-- Hint de credenciales -->
      <div class="test-credentials">
        <span class="cred-title">Credenciales de prueba:</span>
        <code>docente@simu-cognition.app</code>
        <code>docente123</code>
        <button type="button" class="autofill-btn" @click="autoFill">Rellenar formulario</button>
      </div>

      <p class="login-footer">
        ¿Deseas registrar un nuevo docente?
        <NuxtLink to="/registro" id="link-registro">Crear cuenta</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { signIn } = useAuth()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

function autoFill() {
  form.email = 'docente@simu-cognition.app'
  form.password = 'docente123'
}

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    if (res?.error) {
      errorMsg.value = 'Email o contraseña incorrectos'
    } else {
      router.push('/dashboard')
    }
  } catch {
    errorMsg.value = 'Error de conexión. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { width: 100%; display: flex; justify-content: center; }

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 0 24px rgba(79,142,247,0.35);
}
.brand-mark-text { font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; color: #fff; }

.login-header h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
.login-header p  { font-size: 0.85rem; color: var(--color-text-muted); }

.login-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; }

.error-msg {
  background: rgba(248,113,113,0.12);
  border: 1px solid rgba(248,113,113,0.3);
  color: var(--color-danger);
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.login-btn { width: 100%; padding: 0.75rem; font-size: 1rem; margin-top: 0.25rem; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-footer {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 1.5rem;
  color: var(--color-text-muted);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.direct-btn {
  width: 100%;
  text-align: center;
  padding: 0.65rem;
  font-size: 0.9rem;
}

.test-credentials {
  margin-top: 1.5rem;
  padding: 0.875rem 1rem;
  background: rgba(79,142,247,0.07);
  border: 1px solid rgba(79,142,247,0.2);
  border-radius: var(--radius-md);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.cred-title { color: var(--color-text-muted); flex-basis: 100%; }
.test-credentials code {
  background: rgba(255,255,255,0.07);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  color: var(--color-primary);
}
.autofill-btn {
  margin-left: auto;
  padding: 0.3rem 0.75rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  cursor: pointer;
  transition: opacity 0.15s;
}
.autofill-btn:hover { opacity: 0.85; }
</style>
