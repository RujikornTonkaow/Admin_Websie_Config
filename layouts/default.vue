<script setup lang="ts">
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <AdminSidebar :collapsed="!sidebarOpen" />

    <div class="flex flex-1 flex-col transition-all duration-300" :class="sidebarOpen ? 'ml-64' : 'ml-16'">
      <AdminHeader @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
