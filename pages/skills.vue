<script setup lang="ts">
import type { Skill, SkillCategory } from '~/types/admin'

const { t } = useI18n()
const api = useAdminApi()

const items = ref<Skill[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  icon: '',
  category: 'frontend' as SkillCategory,
  sort_order: 0,
})

const deleteTarget = ref<Skill | null>(null)
const deleting = ref(false)

const categories = computed<{ value: SkillCategory; label: string }[]>(() => [
  { value: 'frontend', label: t('skills.categories.frontend') },
  { value: 'backend', label: t('skills.categories.backend') },
  { value: 'devops', label: t('skills.categories.devops') },
  { value: 'tools', label: t('skills.categories.tools') },
])

const categoryLabel = (cat: string) =>
  categories.value.find(c => c.value === cat)?.label ?? cat

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.skills.list()
  } catch {
    toast.value = { message: t('skills.saveError'), type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, { name: '', icon: '', category: 'frontend', sort_order: 0 })
  editingId.value = null
  showForm.value = false
}

const openCreate = () => {
  resetForm()
  form.sort_order = items.value.length
  showForm.value = true
}

const openEdit = (item: Skill) => {
  Object.assign(form, {
    name: item.name,
    icon: item.icon,
    category: item.category,
    sort_order: item.sort_order,
  })
  editingId.value = item.id
  showForm.value = true
}

const handleSave = async () => {
  if (!form.name.trim() || !form.icon.trim()) {
    toast.value = { message: t('skills.nameIconRequired'), type: 'error' }
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await api.skills.update(editingId.value, form)
      toast.value = { message: t('skills.updateSuccess'), type: 'success' }
    } else {
      await api.skills.create(form)
      toast.value = { message: t('skills.createSuccess'), type: 'success' }
    }
    resetForm()
    await loadData()
  } catch {
    toast.value = { message: t('skills.saveError'), type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.skills.delete(deleteTarget.value.id)
    toast.value = { message: t('skills.deleteSuccess'), type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch {
    toast.value = { message: t('skills.deleteError'), type: 'error' }
  } finally {
    deleting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <ConfirmDialog
      :open="!!deleteTarget"
      :title="$t('skills.deleteTitle')"
      :message="$t('skills.deleteMessage', { name: deleteTarget?.name })"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ $t('skills.count', { count: items.length }) }}</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="h-4 w-4" /> {{ $t('skills.addSkill') }}
      </button>
    </div>

    <div v-if="showForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ editingId ? $t('skills.editSkill') : $t('skills.newSkill') }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">{{ $t('skills.skillName') }}</label>
          <input v-model="form.name" type="text" class="form-input" :placeholder="$t('skills.skillNamePlaceholder')" />
          <p class="mt-1 text-xs text-slate-500">{{ $t('skills.skillNameHelp') }}</p>
        </div>
        <div>
          <label class="form-label">{{ $t('skills.category') }}</label>
          <select v-model="form.category" class="form-select">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <p class="mt-1 text-xs text-slate-500">{{ $t('skills.categoryHelp') }}</p>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('skills.iconName') }}</label>
        <div class="flex items-center gap-3">
          <input v-model="form.icon" type="text" class="form-input flex-1" :placeholder="$t('skills.iconPlaceholder')" />
          <div v-if="form.icon" class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <Icon :name="form.icon" class="h-6 w-6" />
          </div>
        </div>
        <p class="mt-1 text-xs text-slate-500">
          {{ $t('skills.iconHelp') }}
          <a href="https://icon-sets.iconify.design/" target="_blank" class="text-indigo-600 hover:underline">{{ $t('skills.iconLink') }}</a>
        </p>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetForm">{{ $t('common.cancel') }}</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleSave">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ editingId ? $t('common.update') : $t('common.create') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:code-braces" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">{{ $t('skills.noSkills') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="card flex items-center gap-3 !p-4"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon :name="item.icon" class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-slate-900 truncate">{{ item.name }}</p>
          <p class="text-xs text-slate-500">{{ categoryLabel(item.category) }}</p>
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
