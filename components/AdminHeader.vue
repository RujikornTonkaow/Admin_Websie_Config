<script setup lang="ts">
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const { t } = useI18n()
const route = useRoute()
const { isMockMode, userRole } = useAuth()

const pageTitle = computed(() => {
  const titleKeys: Record<string, string> = {
    '/': 'nav.dashboard',
    '/site-settings': 'nav.siteSettings',
    '/hero': 'nav.hero',
    '/about': 'nav.about',
    '/skills': 'nav.skills',
    '/projects': 'nav.projects',
    '/experiences': 'nav.experience',
    '/social-links': 'nav.socialLinks',
    '/contacts': 'nav.messages',
    '/users': 'nav.users',
    '/sites': 'nav.sites',
  }
  const key = titleKeys[route.path]
  return key ? t(key) : t('nav.admin')
})

const isViewerRole = computed(() => userRole.value === 'viewer')
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
    <button
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      aria-label="Toggle sidebar"
      @click="emit('toggle-sidebar')"
    >
      <Icon name="mdi:menu" class="h-5 w-5" />
    </button>

    <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>

    <div class="flex-1" />

    <div
      v-if="isViewerRole && !isMockMode"
      class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200"
    >
      <Icon name="mdi:eye-outline" class="h-3.5 w-3.5" />
      {{ $t('common.readOnly') }}
    </div>

    <div
      v-if="isMockMode"
      class="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200"
    >
      <Icon name="mdi:flask-outline" class="h-3.5 w-3.5" />
      {{ $t('common.demoMode') }}
    </div>

    <LanguageSwitcher />
  </header>
</template>
