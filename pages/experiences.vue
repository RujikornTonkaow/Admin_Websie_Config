<script setup lang="ts">
import type { Experience } from '~/types/admin'

const api = useAdminApi()

const items = ref<Experience[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  role: '',
  company: '',
  period: '',
  description: '',
  highlights: [''] as string[],
  sort_order: 0,
})

const deleteTarget = ref<Experience | null>(null)
const deleting = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.experiences.list()
  } catch {
    toast.value = { message: 'Failed to load experiences', type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, { role: '', company: '', period: '', description: '', highlights: [''], sort_order: 0 })
  editingId.value = null
  showForm.value = false
}

const openCreate = () => {
  resetForm()
  form.sort_order = items.value.length
  showForm.value = true
}

const openEdit = (item: Experience) => {
  Object.assign(form, {
    role: item.role,
    company: item.company,
    period: item.period,
    description: item.description,
    highlights: item.highlights?.length ? [...item.highlights] : [''],
    sort_order: item.sort_order,
  })
  editingId.value = item.id
  showForm.value = true
}

const addHighlight = () => {
  form.highlights.push('')
}

const removeHighlight = (index: number) => {
  if (form.highlights.length <= 1) return
  form.highlights.splice(index, 1)
}

const handleSave = async () => {
  if (!form.role.trim() || !form.company.trim() || !form.period.trim()) {
    toast.value = { message: 'Role, company, and period are required', type: 'error' }
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      highlights: form.highlights.filter(h => h.trim()),
    }

    if (editingId.value) {
      await api.experiences.update(editingId.value, payload)
      toast.value = { message: 'Experience updated', type: 'success' }
    } else {
      await api.experiences.create(payload)
      toast.value = { message: 'Experience created', type: 'success' }
    }
    resetForm()
    await loadData()
  } catch {
    toast.value = { message: 'Failed to save experience', type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.experiences.delete(deleteTarget.value.id)
    toast.value = { message: 'Experience deleted', type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch {
    toast.value = { message: 'Failed to delete experience', type: 'error' }
  } finally {
    deleting.value = false
  }
}

const moveUp = async (index: number) => {
  if (index === 0) return
  const ids = items.value.map(i => i.id)
  ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
  try {
    await api.experiences.reorder(ids)
    await loadData()
  } catch {
    toast.value = { message: 'Failed to reorder', type: 'error' }
  }
}

const moveDown = async (index: number) => {
  if (index >= items.value.length - 1) return
  const ids = items.value.map(i => i.id)
  ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
  try {
    await api.experiences.reorder(ids)
    await loadData()
  } catch {
    toast.value = { message: 'Failed to reorder', type: 'error' }
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Delete Experience"
      :message="`Are you sure you want to delete '${deleteTarget?.role} at ${deleteTarget?.company}'?`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ items.length }} experience(s)</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="h-4 w-4" /> Add Experience
      </button>
    </div>

    <div v-if="showForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ editingId ? 'Edit Experience' : 'New Experience' }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">Role / Position</label>
          <input v-model="form.role" type="text" class="form-input" placeholder="Senior Full-Stack Developer" />
        </div>
        <div>
          <label class="form-label">Company</label>
          <input v-model="form.company" type="text" class="form-input" placeholder="Company Name" />
        </div>
      </div>

      <div>
        <label class="form-label">Period</label>
        <input v-model="form.period" type="text" class="form-input" placeholder="2024 - Present" />
      </div>

      <div>
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-textarea" rows="2" placeholder="Brief description of your role" />
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="form-label mb-0">Highlights</label>
          <button type="button" class="text-sm font-medium text-indigo-600 hover:text-indigo-700" @click="addHighlight">
            + Add Highlight
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="(_, index) in form.highlights" :key="index" class="flex gap-2">
            <input
              v-model="form.highlights[index]"
              type="text"
              class="form-input flex-1"
              :placeholder="`Achievement ${index + 1}`"
            />
            <button
              v-if="form.highlights.length > 1"
              type="button"
              class="shrink-0 text-slate-400 hover:text-red-500"
              @click="removeHighlight(index)"
            >
              <Icon name="mdi:trash-can-outline" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetForm">Cancel</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleSave">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ editingId ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:briefcase" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">No experience added yet</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="card flex items-start gap-4 !p-4"
      >
        <div class="flex shrink-0 flex-col gap-0.5 pt-1">
          <button
            class="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
            :disabled="index === 0"
            @click="moveUp(index)"
          >
            <Icon name="mdi:chevron-up" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
            :disabled="index === items.length - 1"
            @click="moveDown(index)"
          >
            <Icon name="mdi:chevron-down" class="h-4 w-4" />
          </button>
        </div>

        <div
          class="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2"
          :class="index === 0 ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white'"
        />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900">{{ item.role }}</p>
          <p class="text-sm text-slate-600">{{ item.company }}</p>
          <p class="text-xs text-slate-400">{{ item.period }}</p>
          <p v-if="item.description" class="mt-1 text-xs text-slate-500">{{ item.description }}</p>
          <ul v-if="item.highlights?.length" class="mt-2 space-y-1">
            <li v-for="(h, hi) in item.highlights.slice(0, 3)" :key="hi" class="text-xs text-slate-500">
              &bull; {{ h }}
            </li>
            <li v-if="item.highlights.length > 3" class="text-xs text-slate-400">
              +{{ item.highlights.length - 3 }} more
            </li>
          </ul>
        </div>

        <div class="flex shrink-0 gap-1">
          <button class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" @click="openEdit(item)">
            <Icon name="mdi:pencil" class="h-4 w-4" />
          </button>
          <button class="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" @click="deleteTarget = item">
            <Icon name="mdi:trash-can-outline" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
