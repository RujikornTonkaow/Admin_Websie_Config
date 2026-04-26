<script setup lang="ts">
import { navigationLinks } from '~/config/navigation'
import { adminModules } from '~/config/modules'
import type { ManagedSite } from '~/types/site'

const props = defineProps<{
  collapsed: boolean
  sites: ManagedSite[]
  selectedSiteId: string | null
}>()

const emit = defineEmits<{
  'update-site': [siteId: string, reloadCurrentRoute: boolean]
}>()

const { t } = useI18n()
const route = useRoute()
const { hasRole, userRole } = useAuth()

const enabledModules = computed(() =>
  adminModules.filter(m => m.enabled),
)

const portfolioModule = computed(() =>
  enabledModules.value.find(module => module.id === 'portfolio'),
)

const nonPortfolioModules = computed(() =>
  enabledModules.value.filter(module =>
    module.id !== 'portfolio' && props.sites.some(site => site.type === module.id),
  ),
)

const portfolioSites = computed(() =>
  props.sites.filter(site => site.type === 'portfolio'),
)

const moduleLinks = (moduleId: string) =>
  navigationLinks
    .filter(link => link.moduleId === moduleId)
    .filter(link => !link.minRole || hasRole(link.minRole))

const portfolioSiteLinks = computed(() =>
  moduleLinks('portfolio').filter(link => !['/users', '/sites'].includes(link.to)),
)

const globalLinks = computed(() =>
  navigationLinks
    .filter(link => ['/users', '/sites'].includes(link.to))
    .filter(link => !link.minRole || hasRole(link.minRole)),
)

const expandedModules = ref<Set<string>>(new Set())

const siteModuleId = (siteId: string): string => `portfolio:${siteId}`

watch(
  () => props.sites,
  (sites) => {
    if (expandedModules.value.size > 0) return

    for (const site of sites.filter(site => site.type === 'portfolio')) {
      expandedModules.value.add(siteModuleId(site.id))
    }
  },
  { immediate: true },
)

const toggleModule = (moduleId: string) => {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

const isActive = (path: string): boolean => route.path === path
const isSiteActive = (path: string, siteId: string): boolean =>
  route.path === path && props.selectedSiteId === siteId

const handleSiteLinkClick = (siteId: string, path: string) => {
  emit('update-site', siteId, route.path === path && props.selectedSiteId !== siteId)
}

const roleBadge = computed(() => {
  const map: Record<string, { label: string; color: string }> = {
    super_admin: { label: t('roles.superAdmin'), color: 'bg-rose-500 text-white' },
    admin: { label: t('roles.admin'), color: 'bg-sky-500 text-white' },
    editor: { label: t('roles.editor'), color: 'bg-violet-500 text-white' },
    viewer: { label: t('roles.viewer'), color: 'bg-slate-500 text-white' },
  }
  return map[userRole.value] ?? map.viewer
})
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-pink-200/50 bg-gradient-to-b from-sky-100 via-violet-100 to-pink-100 transition-all duration-300"
    :class="props.collapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex h-16 items-center gap-3 border-b border-purple-200/50 px-4">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-pink-400">
        <Icon name="mdi:shield-crown" class="h-5 w-5 text-white" />
      </div>
      <span v-show="!props.collapsed" class="text-lg font-semibold text-slate-700 truncate">
        {{ $t('nav.adminPanel') }}
      </span>
    </div>

    <nav class="flex-1 space-y-2 overflow-y-auto px-2 py-4">
      <template v-if="portfolioModule">
        <div v-for="site in portfolioSites" :key="site.id" class="space-y-0.5">
          <button
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
            :class="props.collapsed ? 'justify-center text-slate-400' : 'text-slate-500 hover:text-slate-700'"
            :title="props.collapsed ? site.name : undefined"
            @click="props.collapsed ? undefined : toggleModule(siteModuleId(site.id))"
          >
            <Icon :name="portfolioModule.icon" class="h-4 w-4 shrink-0" />
            <span v-show="!props.collapsed" class="flex-1 text-left truncate">{{ site.name }}</span>
            <Icon
              v-show="!props.collapsed"
              name="mdi:chevron-down"
              class="h-4 w-4 shrink-0 transition-transform duration-200"
              :class="expandedModules.has(siteModuleId(site.id)) ? '' : '-rotate-90'"
            />
          </button>

          <template v-if="!props.collapsed && expandedModules.has(siteModuleId(site.id))">
            <NuxtLink
              v-for="link in portfolioSiteLinks"
              :key="`${site.id}:${link.to}`"
              :to="link.to"
              class="flex items-center gap-3 rounded-lg py-2 pl-7 pr-3 text-sm font-medium transition-colors"
              :class="
                isSiteActive(link.to, site.id)
                  ? 'bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
              "
              @click="handleSiteLinkClick(site.id, link.to)"
            >
              <Icon :name="link.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ t(link.labelKey) }}</span>
            </NuxtLink>
          </template>
        </div>
      </template>

      <div v-for="mod in nonPortfolioModules" :key="mod.id" class="space-y-0.5">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          :class="props.collapsed ? 'justify-center text-slate-400' : 'text-slate-500 hover:text-slate-700'"
          :title="props.collapsed ? t(mod.labelKey) : undefined"
          @click="props.collapsed ? undefined : toggleModule(mod.id)"
        >
          <Icon :name="mod.icon" class="h-4 w-4 shrink-0" />
          <span v-show="!props.collapsed" class="flex-1 text-left truncate">{{ t(mod.labelKey) }}</span>
          <Icon
            v-show="!props.collapsed"
            name="mdi:chevron-down"
            class="h-4 w-4 shrink-0 transition-transform duration-200"
            :class="expandedModules.has(mod.id) ? '' : '-rotate-90'"
          />
        </button>

        <template v-if="!props.collapsed && expandedModules.has(mod.id)">
          <template v-if="moduleLinks(mod.id).length > 0">
            <NuxtLink
              v-for="link in moduleLinks(mod.id)"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 rounded-lg py-2 pl-7 pr-3 text-sm font-medium transition-colors"
              :class="
                isActive(link.to)
                  ? 'bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
              "
            >
              <Icon :name="link.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ t(link.labelKey) }}</span>
            </NuxtLink>
          </template>
          <p v-else class="py-2 pl-7 pr-3 text-xs text-slate-400 italic">
            {{ $t('modules.comingSoon') }}
          </p>
        </template>
      </div>

      <NuxtLink
        v-for="link in globalLinks"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg py-2 pl-3 pr-3 text-sm font-medium transition-colors"
        :class="
          isActive(link.to)
            ? 'bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-sm'
            : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
        "
      >
        <Icon :name="link.icon" class="h-4 w-4 shrink-0" />
        <span v-show="!props.collapsed" class="truncate">{{ t(link.labelKey) }}</span>
      </NuxtLink>
    </nav>

    <div class="border-t border-purple-200/50 p-3 space-y-2">
      <div
        v-show="!collapsed"
        class="flex items-center justify-center"
      >
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="roleBadge.color"
        >
          {{ roleBadge.label }}
        </span>
      </div>
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-700"
        :class="collapsed ? 'justify-center' : ''"
        @click="useAuth().logout()"
      >
        <Icon name="mdi:logout" class="h-5 w-5 shrink-0" />
        <span v-show="!collapsed">{{ $t('nav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>
