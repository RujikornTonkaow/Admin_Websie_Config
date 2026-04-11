<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmText?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="emit('cancel')" />

        <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Icon name="mdi:alert" class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ message }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button class="btn-secondary" :disabled="loading" @click="emit('cancel')">
              Cancel
            </button>
            <button class="btn-danger" :disabled="loading" @click="emit('confirm')">
              <Icon v-if="loading" name="mdi:loading" class="h-4 w-4 animate-spin" />
              {{ confirmText ?? 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
