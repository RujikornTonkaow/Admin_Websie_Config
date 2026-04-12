<script setup lang="ts">
import type { SiteSettings } from '~/types/admin'

const { t } = useI18n()
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
    toast.value = { message: t('siteSettings.loadError'), type: 'error' }
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await api.siteSettings.update(form)
    toast.value = { message: t('siteSettings.saveSuccess'), type: 'success' }
  } catch {
    toast.value = { message: t('siteSettings.saveError'), type: 'error' }
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
        <label for="site_title" class="form-label">{{ $t('siteSettings.siteTitle') }}</label>
        <input id="site_title" v-model="form.site_title" type="text" class="form-input" :placeholder="$t('siteSettings.siteTitlePlaceholder')" />
        <p class="mt-1 text-xs text-slate-500">{{ $t('siteSettings.siteTitleHelp') }}</p>
      </div>

      <div>
        <label for="page_title" class="form-label">{{ $t('siteSettings.pageTitle') }}</label>
        <input id="page_title" v-model="form.page_title" type="text" class="form-input" :placeholder="$t('siteSettings.pageTitlePlaceholder')" />
        <p class="mt-1 text-xs text-slate-500">{{ $t('siteSettings.pageTitleHelp') }}</p>
      </div>

      <div>
        <label for="meta_description" class="form-label">{{ $t('siteSettings.metaDescription') }}</label>
        <textarea id="meta_description" v-model="form.meta_description" class="form-textarea" rows="3" :placeholder="$t('siteSettings.metaDescriptionPlaceholder')" />
        <p class="mt-1 text-xs text-slate-500">{{ $t('siteSettings.metaDescriptionHelp') }}</p>
      </div>

      <div>
        <label for="footer_tagline" class="form-label">{{ $t('siteSettings.footerTagline') }}</label>
        <input id="footer_tagline" v-model="form.footer_tagline" type="text" class="form-input" :placeholder="$t('siteSettings.footerTaglinePlaceholder')" />
        <p class="mt-1 text-xs text-slate-500">{{ $t('siteSettings.footerTaglineHelp') }}</p>
      </div>

      <div>
        <label for="default_theme" class="form-label">{{ $t('siteSettings.defaultTheme') }}</label>
        <select id="default_theme" v-model="form.default_theme" class="form-select">
          <option value="midnight">{{ $t('siteSettings.themeMidnight') }}</option>
          <option value="sunshine">{{ $t('siteSettings.themeSunshine') }}</option>
        </select>
        <p class="mt-1 text-xs text-slate-500">{{ $t('siteSettings.defaultThemeHelp') }}</p>
      </div>

      <FormImageUpload
        v-model="form.profile_image!"
        :label="$t('siteSettings.profileImage')"
        :help-text="$t('siteSettings.profileImageHelp')"
      />

      <div class="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" class="btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>
