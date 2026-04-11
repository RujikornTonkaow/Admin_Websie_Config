<script setup lang="ts">
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const { isMockMode } = useAuth()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/site-settings': 'Site Settings',
    '/hero': 'Hero Section',
    '/about': 'About Section',
    '/skills': 'Skills',
    '/projects': 'Projects',
    '/experiences': 'Experience',
    '/social-links': 'Social Links',
    '/contacts': 'Messages',
  }
  return titles[route.path] ?? 'Admin'
})
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
      v-if="isMockMode"
      class="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200"
    >
      <Icon name="mdi:flask-outline" class="h-3.5 w-3.5" />
      Demo Mode — changes won't be saved
    </div>
  </header>
</template>
