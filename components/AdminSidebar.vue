<script setup lang="ts">
import type { SidebarLink } from '~/types/admin'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const links: SidebarLink[] = [
  { label: 'Dashboard', to: '/', icon: 'mdi:view-dashboard' },
  { label: 'Site Settings', to: '/site-settings', icon: 'mdi:cog' },
  { label: 'Hero', to: '/hero', icon: 'mdi:star-circle' },
  { label: 'About', to: '/about', icon: 'mdi:account-details' },
  { label: 'Skills', to: '/skills', icon: 'mdi:code-braces' },
  { label: 'Projects', to: '/projects', icon: 'mdi:folder-multiple' },
  { label: 'Experience', to: '/experiences', icon: 'mdi:briefcase' },
  { label: 'Social Links', to: '/social-links', icon: 'mdi:link-variant' },
  { label: 'Messages', to: '/contacts', icon: 'mdi:email' },
]

const isActive = (path: string): boolean => route.path === path
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-slate-900 transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex h-16 items-center gap-3 border-b border-slate-700 px-4">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
        <Icon name="mdi:shield-crown" class="h-5 w-5 text-white" />
      </div>
      <span v-show="!collapsed" class="text-lg font-semibold text-white truncate">
        Admin Panel
      </span>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-2 py-4">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="[
          isActive(link.to)
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
          collapsed ? 'justify-center' : '',
        ]"
        :title="collapsed ? link.label : undefined"
      >
        <Icon :name="link.icon" class="h-5 w-5 shrink-0" />
        <span v-show="!collapsed" class="truncate">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="border-t border-slate-700 p-3">
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        :class="collapsed ? 'justify-center' : ''"
        @click="useAuth().logout()"
      >
        <Icon name="mdi:logout" class="h-5 w-5 shrink-0" />
        <span v-show="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>
