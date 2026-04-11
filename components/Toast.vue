<script setup lang="ts">
const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
}>()

const emit = defineEmits<{
  close: []
}>()

const iconMap = {
  success: 'mdi:check-circle',
  error: 'mdi:alert-circle',
  info: 'mdi:information',
}

const colorMap = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColorMap = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

const type = computed(() => props.type ?? 'info')

onMounted(() => {
  setTimeout(() => emit('close'), 4000)
})
</script>

<template>
  <div
    class="fixed right-4 top-20 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all"
    :class="colorMap[type]"
  >
    <Icon :name="iconMap[type]" class="h-5 w-5 shrink-0" :class="iconColorMap[type]" />
    <span class="text-sm font-medium">{{ message }}</span>
    <button class="ml-2 opacity-50 hover:opacity-100" @click="emit('close')">
      <Icon name="mdi:close" class="h-4 w-4" />
    </button>
  </div>
</template>
