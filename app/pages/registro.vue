<template>
  <div class="registro-page animate-fade-in">
    <div class="card registro-card">
      <div class="registro-header">
        <div class="brand-mark">
          <span class="brand-mark-text">SC</span>
        </div>
        <h1>Crear cuenta</h1>
        <p>Accede a todas las herramientas de simulación</p>
      </div>

      <form id="registro-form" class="registro-form" @submit.prevent="handleRegistro">
        <div class="form-group">
          <label class="label" for="nombre">Nombre completo</label>
          <input id="nombre" v-model="form.nombre" type="text" class="input" placeholder="María García" required />
        </div>
        <div class="form-group">
          <label class="label" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label class="label" for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" class="input" placeholder="Mínimo 8 caracteres" minlength="8" required />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <button id="registro-submit" type="submit" class="btn btn-primary registro-btn" :disabled="loading">
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="registro-footer">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" id="link-login">Iniciar sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { signIn } = useAuth()
const router = useRouter()

const form = reactive({ nombre: '', email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleRegistro() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch('/api/registro', {
      method: 'POST',
      body: form,
    })
    // Auto-login tras registro exitoso
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    if (res?.error) {
      successMsg.value = 'Cuenta creada. Inicia sesión.'
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    errorMsg.value = e?.data?.message ?? 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registro-page { width: 100%; display: flex; justify-content: center; }
.registro-card { width: 100%; max-width: 420px; padding: 2.5rem 2rem; }
.registro-header { text-align: center; margin-bottom: 2rem; }
.brand-mark {
  width: 52px; height: 52px; border-radius: var(--radius-lg);
  background: var(--gradient-primary); display: flex; align-items: center;
  justify-content: center; margin: 0 auto 1rem;
  box-shadow: 0 0 24px rgba(79,142,247,0.35);
}
.brand-mark-text { font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; color: #fff; }
.registro-header h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
.registro-header p  { font-size: 0.85rem; color: var(--color-text-muted); }
.registro-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; }
.error-msg {
  background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3);
  color: var(--color-danger); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); font-size: 0.85rem;
}
.success-msg {
  background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3);
  color: var(--color-accent); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); font-size: 0.85rem;
}
.registro-btn { width: 100%; padding: 0.75rem; font-size: 1rem; margin-top: 0.25rem; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.registro-footer { text-align: center; font-size: 0.85rem; margin-top: 1.5rem; color: var(--color-text-muted); }
</style>
