<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label: string
  helpText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { upload, getUploadUrl } = useAdminApi()

const uploading = ref(false)
const errorMsg = ref('')

const previewUrl = computed(() => {
  if (!props.modelValue) return ''
  return getUploadUrl(props.modelValue)
})

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errorMsg.value = 'File size must be less than 10MB'
    return
  }

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.type)) {
    errorMsg.value = 'Only JPG, PNG, GIF, WebP, and SVG files are allowed'
    return
  }

  uploading.value = true
  errorMsg.value = ''

  try {
    const result = await upload(file)
    emit('update:modelValue', result.url)
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div>
    <label class="form-label">{{ label }}</label>

    <div class="mt-1 flex items-start gap-4">
      <div
        v-if="previewUrl"
        class="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
      >
        <img :src="previewUrl" :alt="label" class="h-full w-full object-cover" />
      </div>

      <div
        v-else
        class="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50"
      >
        <Icon name="mdi:image-outline" class="h-8 w-8 text-slate-400" />
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="btn-secondary cursor-pointer text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': uploading }"
        >
          <Icon v-if="uploading" name="mdi:loading" class="h-4 w-4 animate-spin" />
          <span>{{ uploading ? 'Uploading...' : 'Choose File' }}</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            :disabled="uploading"
            @change="handleFileChange"
          />
        </label>
        <p v-if="helpText" class="text-xs text-slate-500">{{ helpText }}</p>
        <p v-if="errorMsg" class="text-xs text-red-600">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>
