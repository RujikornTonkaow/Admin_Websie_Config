<script setup lang="ts">
import type { Hero } from '~/types/admin'

const api = useAdminApi()

const form = reactive<Partial<Hero>>({
  greeting: '',
  full_name: '',
  subtitle: '',
  cta_primary_text: '',
  cta_primary_link: '',
  cta_secondary_text: '',
  cta_secondary_link: '',
})

const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await api.hero.get()
    Object.assign(form, {
      greeting: data.greeting,
      full_name: data.full_name,
      subtitle: data.subtitle,
      cta_primary_text: data.cta_primary_text,
      cta_primary_link: data.cta_primary_link,
      cta_secondary_text: data.cta_secondary_text,
      cta_secondary_link: data.cta_secondary_link,
    })
  } catch {
    toast.value = { message: 'Failed to load hero data', type: 'error' }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await api.hero.update(form)
    toast.value = { message: 'Hero section saved successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save hero section', type: 'error' }
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <form v-else class="card space-y-6" @submit.prevent="handleSave">
      <div>
        <label for="greeting" class="form-label">Greeting Text</label>
        <input id="greeting" v-model="form.greeting" type="text" class="form-input" placeholder="Hello, I'm" />
      </div>

      <div>
        <label for="full_name" class="form-label">Full Name</label>
        <input id="full_name" v-model="form.full_name" type="text" class="form-input" placeholder="John Doe" />
      </div>

      <div>
        <label for="subtitle" class="form-label">Subtitle / Tagline</label>
        <textarea id="subtitle" v-model="form.subtitle" class="form-textarea" rows="3" placeholder="Full-Stack Developer crafting performant..." />
      </div>

      <fieldset class="space-y-4 rounded-lg border border-slate-200 p-4">
        <legend class="px-2 text-sm font-medium text-slate-700">Primary CTA Button</legend>
        <div>
          <label for="cta_primary_text" class="form-label">Button Text</label>
          <input id="cta_primary_text" v-model="form.cta_primary_text" type="text" class="form-input" placeholder="View My Work" />
        </div>
        <div>
          <label for="cta_primary_link" class="form-label">Button Link</label>
          <input id="cta_primary_link" v-model="form.cta_primary_link" type="text" class="form-input" placeholder="#projects" />
        </div>
      </fieldset>

      <fieldset class="space-y-4 rounded-lg border border-slate-200 p-4">
        <legend class="px-2 text-sm font-medium text-slate-700">Secondary CTA Button</legend>
        <div>
          <label for="cta_secondary_text" class="form-label">Button Text</label>
          <input id="cta_secondary_text" v-model="form.cta_secondary_text" type="text" class="form-input" placeholder="Get in Touch" />
        </div>
        <div>
          <label for="cta_secondary_link" class="form-label">Button Link</label>
          <input id="cta_secondary_link" v-model="form.cta_secondary_link" type="text" class="form-input" placeholder="#contact" />
        </div>
      </fieldset>

      <div class="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" class="btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
