<script setup lang="ts">
import type { SiteSettings, ContactMessage } from '~/types/admin'

const { t } = useI18n()
const api = useAdminApi()
const { isEditor, userRole } = useAuth()

const stats = ref<{ label: string; value: string; icon: string; color: string }[]>([])
const recentMessages = ref<ContactMessage[]>([])
const loading = ref(true)

const loadDashboard = async () => {
  loading.value = true
  try {
    if (isEditor.value) {
      const [skillsList, projectsList, experiencesList, contactsRes] = await Promise.all([
        api.skills.list(),
        api.projects.list(),
        api.experiences.list(),
        api.contacts.list(),
      ])

      const unreadLabel = contactsRes.unreadCount > 0
        ? `${contactsRes.items.length} (${contactsRes.unreadCount} ${t('contacts.unread', { count: '' }).trim()})`
        : String(contactsRes.items.length)

      stats.value = [
        { label: t('dashboard.stats.skills'), value: String(skillsList.length), icon: 'mdi:code-braces', color: 'bg-blue-100 text-blue-600' },
        { label: t('dashboard.stats.projects'), value: String(projectsList.length), icon: 'mdi:folder-multiple', color: 'bg-emerald-100 text-emerald-600' },
        { label: t('dashboard.stats.experience'), value: String(experiencesList.length), icon: 'mdi:briefcase', color: 'bg-amber-100 text-amber-600' },
        { label: t('dashboard.stats.messages'), value: unreadLabel, icon: 'mdi:email', color: 'bg-purple-100 text-purple-600' },
      ]

      recentMessages.value = contactsRes.items.slice(0, 5)
    } else {
      const contactsRes = await api.contacts.list()
      const unreadLabel = contactsRes.unreadCount > 0
        ? `${contactsRes.items.length} (${contactsRes.unreadCount} ${t('contacts.unread', { count: '' }).trim()})`
        : String(contactsRes.items.length)

      stats.value = [
        { label: t('dashboard.stats.messages'), value: unreadLabel, icon: 'mdi:email', color: 'bg-purple-100 text-purple-600' },
      ]

      recentMessages.value = contactsRes.items.slice(0, 5)
    }
  } catch {
    // Error handled by API composable
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="card flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl" :class="stat.color">
            <Icon :name="stat.icon" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="text-sm text-slate-500">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div v-if="isEditor" class="card">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900">{{ $t('dashboard.quickActions') }}</h2>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <NuxtLink to="/site-settings" class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
              <Icon name="mdi:cog" class="h-5 w-5 text-slate-500" />
              <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.siteSettings') }}</span>
            </NuxtLink>
            <NuxtLink to="/hero" class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
              <Icon name="mdi:star-circle" class="h-5 w-5 text-slate-500" />
              <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.editHero') }}</span>
            </NuxtLink>
            <NuxtLink to="/projects" class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
              <Icon name="mdi:folder-plus" class="h-5 w-5 text-slate-500" />
              <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.addProject') }}</span>
            </NuxtLink>
            <NuxtLink to="/skills" class="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
              <Icon name="mdi:code-braces" class="h-5 w-5 text-slate-500" />
              <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.addSkill') }}</span>
            </NuxtLink>
          </div>
        </div>

        <div class="card">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900">{{ $t('dashboard.recentMessages') }}</h2>
            <NuxtLink to="/contacts" class="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              {{ $t('dashboard.viewAll') }}
            </NuxtLink>
          </div>

          <div v-if="recentMessages.length === 0" class="py-8 text-center text-sm text-slate-500">
            {{ $t('dashboard.noMessages') }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="msg in recentMessages"
              :key="msg.id"
              class="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Icon name="mdi:account" class="h-4 w-4 text-slate-500" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-900 truncate">{{ msg.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ msg.subject }}</p>
              </div>
              <span
                v-if="!msg.is_read"
                class="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
