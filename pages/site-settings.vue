<script setup lang="ts">
import type { SiteSettings } from '~/types/admin'

const api = useAdminApi()

const form = reactive<Partial<SiteSettings>>({
  site_title: '',
  page_title: '',
  meta_description: '',
  footer_tagline: '',
  default_theme: 'midnight',
  profile_image: '',
})

const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await api.siteSettings.get()
    Object.assign(form, {
      site_title: data.site_title,
      page_title: data.page_title,
      meta_description: data.meta_description,
      footer_tagline: data.footer_tagline,
      default_theme: data.default_theme,
      profile_image: data.profile_image,
    })
  } catch {
    toast.value = { message: 'Failed to load site settings', type: 'error' }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await api.siteSettings.update(form)
    toast.value = { message: 'Site settings saved successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save site settings', type: 'error' }
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
        <label for="site_title" class="form-label">Site Title</label>
        <input id="site_title" v-model="form.site_title" type="text" class="form-input" placeholder="Portfolio" />
        <p class="mt-1 text-xs text-slate-500">Displayed in navbar and footer</p>
      </div>

      <div>
        <label for="page_title" class="form-label">Page Title</label>
        <input id="page_title" v-model="form.page_title" type="text" class="form-input" placeholder="Portfolio | Full-Stack Developer" />
        <p class="mt-1 text-xs text-slate-500">Shown in the browser tab</p>
      </div>

      <div>
        <label for="meta_description" class="form-label">Meta Description</label>
        <textarea id="meta_description" v-model="form.meta_description" class="form-textarea" rows="3" placeholder="SEO description..." />
        <p class="mt-1 text-xs text-slate-500">SEO description for search engines</p>
      </div>

      <div>
        <label for="footer_tagline" class="form-label">Footer Tagline</label>
        <input id="footer_tagline" v-model="form.footer_tagline" type="text" class="form-input" placeholder="Crafting digital experiences" />
      </div>

      <div>
        <label for="default_theme" class="form-label">Default Theme</label>
        <select id="default_theme" v-model="form.default_theme" class="form-select">
          <option value="midnight">Midnight (Dark)</option>
          <option value="sunshine">Sunshine (Light)</option>
        </select>
        <p class="mt-1 text-xs text-slate-500">Theme shown to first-time visitors</p>
      </div>

      <FormImageUpload
        v-model="form.profile_image!"
        label="Profile Image"
        help-text="Recommended: 400×400px, JPG or PNG"
      />

      <div class="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" class="btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
