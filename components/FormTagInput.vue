<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  label: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const newTag = ref('')

const addTags = (raw: string) => {
  const tags = raw
    .split(/[,\n]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && !props.modelValue.includes(t))

  if (tags.length === 0) {
    newTag.value = ''
    return
  }

  emit('update:modelValue', [...props.modelValue, ...tags])
  newTag.value = ''
}

const removeTag = (index: number) => {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTags(newTag.value)
  }
}

const handleBlur = () => {
  if (newTag.value.trim()) {
    addTags(newTag.value)
  }
}
</script>

<template>
  <div>
    <label class="form-label">{{ label }}</label>

    <div class="flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white p-2">
      <span
        v-for="(tag, index) in modelValue"
        :key="index"
        class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
      >
        {{ tag }}
        <button
          type="button"
          class="ml-0.5 text-indigo-400 transition-colors hover:text-indigo-700"
          @click="removeTag(index)"
        >
          <Icon name="mdi:close" class="h-3.5 w-3.5" />
        </button>
      </span>

      <input
        v-model="newTag"
        type="text"
        :placeholder="placeholder ?? 'Type and press Enter or comma'"
        class="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
    </div>
    <p class="mt-1 text-xs text-slate-400">Press Enter or comma to add. Click outside to confirm.</p>
  </div>
</template>
