<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, loginDemo } = useAuth()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    errorMsg.value = 'Please enter username and password'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await login(form)
    await navigateTo('/')
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
        <Icon name="mdi:shield-crown" class="h-8 w-8 text-white" />
      </div>
      <h1 class="text-2xl font-bold text-white">Admin Panel</h1>
      <p class="mt-1 text-sm text-slate-400">Sign in to manage your portfolio</p>
    </div>

    <form class="card space-y-5" @submit.prevent="handleSubmit">
      <div
        v-if="errorMsg"
        class="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <Icon name="mdi:alert-circle" class="h-4 w-4 shrink-0" />
        {{ errorMsg }}
      </div>

      <div>
        <label for="username" class="form-label">Username</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          class="form-input"
          placeholder="admin"
          autocomplete="username"
        />
      </div>

      <div>
        <label for="password" class="form-label">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="••••••••"
          autocomplete="current-password"
        />
      </div>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        <Icon v-if="loading" name="mdi:loading" class="h-4 w-4 animate-spin" />
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200" />
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="bg-white px-2 text-slate-400">or</span>
        </div>
      </div>

      <button
        type="button"
        class="btn-secondary w-full"
        @click="loginDemo(); navigateTo('/')"
      >
        <Icon name="mdi:eye-outline" class="h-4 w-4" />
        Demo Mode (Preview UI)
      </button>
    </form>
  </div>
</template>
