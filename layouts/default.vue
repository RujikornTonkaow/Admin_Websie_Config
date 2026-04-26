<script setup lang="ts">
import type { ManagedSite } from '~/types/site'

const sidebarOpen = ref(true)
const api = useAdminApi()
const route = useRoute()
const { isSuperAdmin } = useAuth()
const { selectedSiteId, setSelectedSiteId } = useSiteContext()

const sites = ref<ManagedSite[]>([])
const siteLoading = ref(true)
const siteError = ref('')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const loadSites = async () => {
  siteLoading.value = true
  siteError.value = ''

  try {
    sites.value = await api.sites.list()
    const hasSelectedSite = sites.value.some(site => site.id === selectedSiteId.value)

    if (!hasSelectedSite) {
      setSelectedSiteId(sites.value[0]?.id ?? null)
    }
  } catch (err) {
    siteError.value = err instanceof Error ? err.message : 'Unable to load managed sites'
  } finally {
    siteLoading.value = false
  }
}

const handleSiteChange = (siteId: string, reloadCurrentRoute = false) => {
  setSelectedSiteId(siteId)

  if (reloadCurrentRoute && import.meta.client) {
    window.location.reload()
  }
}

const canRenderWithoutSites = computed(() =>
  isSuperAdmin.value && route.path === '/sites',
)

onMounted(loadSites)
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar
      :collapsed="!sidebarOpen"
      :sites="sites"
      :selected-site-id="selectedSiteId"
      @update-site="handleSiteChange"
    />

    <div class="flex flex-1 flex-col transition-all duration-300" :class="sidebarOpen ? 'ml-64' : 'ml-16'">
      <AdminHeader
        @toggle-sidebar="toggleSidebar"
      />

      <main class="flex-1 p-6">
        <div v-if="siteLoading" class="flex items-center justify-center py-20">
          <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
        </div>

        <div v-else-if="siteError" class="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {{ siteError }}
        </div>

        <div v-else-if="sites.length === 0 && !canRenderWithoutSites" class="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {{ $t('sites.noSites') }}
        </div>

        <slot v-else />
      </main>
    </div>
  </div>
</template>
