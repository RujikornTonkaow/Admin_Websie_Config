<script setup lang="ts">
import type { Project } from '~/types/admin'

const api = useAdminApi()

const items = ref<Project[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  title: '',
  description: '',
  tags: [] as string[],
  image: '',
  live_url: '',
  source_url: '',
  sort_order: 0,
})

const deleteTarget = ref<Project | null>(null)
const deleting = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.projects.list()
  } catch {
    toast.value = { message: 'Failed to load projects', type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, { title: '', description: '', tags: [], image: '', live_url: '', source_url: '', sort_order: 0 })
  editingId.value = null
  showForm.value = false
}

const openCreate = () => {
  resetForm()
  form.sort_order = items.value.length
  showForm.value = true
}

const openEdit = (item: Project) => {
  Object.assign(form, {
    title: item.title,
    description: item.description,
    tags: [...item.tags],
    image: item.image ?? '',
    live_url: item.live_url ?? '',
    source_url: item.source_url ?? '',
    sort_order: item.sort_order,
  })
  editingId.value = item.id
  showForm.value = true
}

const handleSave = async () => {
  if (!form.title.trim() || !form.description.trim()) {
    toast.value = { message: 'Title and description are required', type: 'error' }
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await api.projects.update(editingId.value, form)
      toast.value = { message: 'Project updated', type: 'success' }
    } else {
      await api.projects.create(form)
      toast.value = { message: 'Project created', type: 'success' }
    }
    resetForm()
    await loadData()
  } catch {
    toast.value = { message: 'Failed to save project', type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.projects.delete(deleteTarget.value.id)
    toast.value = { message: 'Project deleted', type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch {
    toast.value = { message: 'Failed to delete project', type: 'error' }
  } finally {
    deleting.value = false
  }
}

const moveUp = async (index: number) => {
  if (index === 0) return
  const ids = items.value.map(i => i.id)
  ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
  try {
    await api.projects.reorder(ids)
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
    await api.projects.reorder(ids)
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
      title="Delete Project"
      :message="`Are you sure you want to delete '${deleteTarget?.title}'?`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ items.length }} project(s)</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="h-4 w-4" /> Add Project
      </button>
    </div>

    <div v-if="showForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ editingId ? 'Edit Project' : 'New Project' }}
      </h3>

      <div>
        <label class="form-label">Title</label>
        <input v-model="form.title" type="text" class="form-input" placeholder="Project title" />
      </div>

      <div>
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="Brief project description" />
      </div>

      <FormTagInput v-model="form.tags" label="Technologies" placeholder="e.g. Vue.js, Go, MongoDB" />

      <FormImageUpload v-model="form.image" label="Project Image" help-text="Recommended: 800×400px" />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">Live Demo URL</label>
          <input v-model="form.live_url" type="url" class="form-input" placeholder="https://..." />
        </div>
        <div>
          <label class="form-label">Source Code URL</label>
          <input v-model="form.source_url" type="url" class="form-input" placeholder="https://github.com/..." />
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
      <Icon name="mdi:folder-multiple" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">No projects added yet</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="card flex items-center gap-4 !p-4"
      >
        <div class="flex shrink-0 flex-col gap-0.5">
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

        <div v-if="item.image" class="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <img :src="api.getUploadUrl(item.image)" :alt="item.title" class="h-full w-full object-cover" />
        </div>
        <div v-else class="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon name="mdi:image-outline" class="h-6 w-6 text-slate-300" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-slate-900 truncate">{{ item.title }}</p>
          <p class="text-xs text-slate-500 truncate">{{ item.description }}</p>
          <div class="mt-1 flex flex-wrap gap-1">
            <span
              v-for="tag in item.tags.slice(0, 4)"
              :key="tag"
              class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {{ tag }}
            </span>
            <span v-if="item.tags.length > 4" class="text-[10px] text-slate-400">
              +{{ item.tags.length - 4 }}
            </span>
          </div>
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
