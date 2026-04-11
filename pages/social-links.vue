<script setup lang="ts">
import type { SocialLink } from '~/types/admin'

const api = useAdminApi()

const items = ref<SocialLink[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  url: '',
  icon: '',
  sort_order: 0,
})

const deleteTarget = ref<SocialLink | null>(null)
const deleting = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.socialLinks.list()
  } catch {
    toast.value = { message: 'Failed to load social links', type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, { name: '', url: '', icon: '', sort_order: 0 })
  editingId.value = null
  showForm.value = false
}

const openCreate = () => {
  resetForm()
  form.sort_order = items.value.length
  showForm.value = true
}

const openEdit = (item: SocialLink) => {
  Object.assign(form, {
    name: item.name,
    url: item.url,
    icon: item.icon,
    sort_order: item.sort_order,
  })
  editingId.value = item.id
  showForm.value = true
}

const handleSave = async () => {
  if (!form.name.trim() || !form.url.trim() || !form.icon.trim()) {
    toast.value = { message: 'All fields are required', type: 'error' }
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await api.socialLinks.update(editingId.value, form)
      toast.value = { message: 'Social link updated', type: 'success' }
    } else {
      await api.socialLinks.create(form)
      toast.value = { message: 'Social link created', type: 'success' }
    }
    resetForm()
    await loadData()
  } catch {
    toast.value = { message: 'Failed to save social link', type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.socialLinks.delete(deleteTarget.value.id)
    toast.value = { message: 'Social link deleted', type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch {
    toast.value = { message: 'Failed to delete social link', type: 'error' }
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Delete Social Link"
      :message="`Are you sure you want to delete '${deleteTarget?.name}'?`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ items.length }} link(s)</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="h-4 w-4" /> Add Link
      </button>
    </div>

    <div v-if="showForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ editingId ? 'Edit Social Link' : 'New Social Link' }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">Platform Name</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="e.g. GitHub" />
        </div>
        <div>
          <label class="form-label">Iconify Icon Name</label>
          <div class="flex items-center gap-3">
            <input v-model="form.icon" type="text" class="form-input flex-1" placeholder="e.g. mdi:github" />
            <div v-if="form.icon" class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <Icon :name="form.icon" class="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label">URL</label>
        <input v-model="form.url" type="text" class="form-input" placeholder="https://github.com/username" />
        <p class="mt-1 text-xs text-slate-500">For email, use mailto:email@example.com</p>
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
      <Icon name="mdi:link-variant" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">No social links added yet</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="card flex items-center gap-4 !p-4"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon :name="item.icon" class="h-5 w-5 text-slate-600" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-slate-900">{{ item.name }}</p>
          <a :href="item.url" target="_blank" class="text-xs text-indigo-600 hover:underline truncate block">
            {{ item.url }}
          </a>
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
