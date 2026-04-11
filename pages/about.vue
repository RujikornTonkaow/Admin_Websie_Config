<script setup lang="ts">
import type { About, Stat } from '~/types/admin'

const api = useAdminApi()

const form = reactive<{
  title: string
  bio_paragraphs: string[]
  personality_tags: string[]
  stats: Stat[]
}>({
  title: '',
  bio_paragraphs: [''],
  personality_tags: [],
  stats: [],
})

const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const data = await api.about.get()
    Object.assign(form, {
      title: data.title,
      bio_paragraphs: data.bio_paragraphs?.length ? data.bio_paragraphs : [''],
      personality_tags: data.personality_tags ?? [],
      stats: data.stats ?? [],
    })
  } catch {
    toast.value = { message: 'Failed to load about data', type: 'error' }
  } finally {
    loading.value = false
  }
}

const addParagraph = () => {
  form.bio_paragraphs.push('')
}

const removeParagraph = (index: number) => {
  if (form.bio_paragraphs.length <= 1) return
  form.bio_paragraphs.splice(index, 1)
}

const addStat = () => {
  form.stats.push({ value: '', label: '' })
}

const removeStat = (index: number) => {
  form.stats.splice(index, 1)
}

const handleSave = async () => {
  saving.value = true
  try {
    await api.about.update({
      title: form.title,
      bio_paragraphs: form.bio_paragraphs.filter(p => p.trim()),
      personality_tags: form.personality_tags,
      stats: form.stats.filter(s => s.value.trim() && s.label.trim()),
    })
    toast.value = { message: 'About section saved successfully', type: 'success' }
  } catch {
    toast.value = { message: 'Failed to save about section', type: 'error' }
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <form v-else class="card space-y-6" @submit.prevent="handleSave">
      <div>
        <label for="about_title" class="form-label">Section Title</label>
        <input id="about_title" v-model="form.title" type="text" class="form-input" placeholder="Passionate about building great software" />
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="form-label mb-0">Bio Paragraphs</label>
          <button type="button" class="text-sm font-medium text-indigo-600 hover:text-indigo-700" @click="addParagraph">
            + Add Paragraph
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="(_, index) in form.bio_paragraphs" :key="index" class="flex gap-2">
            <textarea
              v-model="form.bio_paragraphs[index]"
              class="form-textarea flex-1"
              rows="3"
              :placeholder="`Paragraph ${index + 1}`"
            />
            <button
              v-if="form.bio_paragraphs.length > 1"
              type="button"
              class="mt-1 shrink-0 text-slate-400 hover:text-red-500"
              @click="removeParagraph(index)"
            >
              <Icon name="mdi:trash-can-outline" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <FormTagInput
        v-model="form.personality_tags"
        label="Personality Tags"
        placeholder="e.g. Problem Solver, Team Player"
      />

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="form-label mb-0">Stats</label>
          <button type="button" class="text-sm font-medium text-indigo-600 hover:text-indigo-700" @click="addStat">
            + Add Stat
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="(stat, index) in form.stats" :key="index" class="flex items-start gap-3">
            <div class="flex-1">
              <input v-model="stat.value" type="text" class="form-input" placeholder="Value (e.g. 5+)" />
            </div>
            <div class="flex-[2]">
              <input v-model="stat.label" type="text" class="form-input" placeholder="Label (e.g. Years Experience)" />
            </div>
            <button
              type="button"
              class="mt-2 shrink-0 text-slate-400 hover:text-red-500"
              @click="removeStat(index)"
            >
              <Icon name="mdi:trash-can-outline" class="h-5 w-5" />
            </button>
          </div>

          <div v-if="form.stats.length === 0" class="rounded-lg border-2 border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
            No stats added yet
          </div>
        </div>
      </div>

      <div class="flex justify-end border-t border-slate-200 pt-4">
        <button type="submit" class="btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
