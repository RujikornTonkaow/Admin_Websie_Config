<script setup lang="ts">
import type { ManagedSite, SiteType } from '~/types/site'

const { t } = useI18n()
const api = useAdminApi()

const items = ref<ManagedSite[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const showCreateForm = ref(false)
const editingSite = ref<ManagedSite | null>(null)
const deleteTarget = ref<ManagedSite | null>(null)
const deleting = ref(false)

const form = reactive({
  name: '',
  slug: '',
  type: 'portfolio' as SiteType,
  domains: '',
})

const siteTypes: SiteType[] = ['portfolio', 'shop', 'finance']

const parseDomains = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map(domain => domain.trim())
    .filter(Boolean)

const resetForm = () => {
  Object.assign(form, {
    name: '',
    slug: '',
    type: 'portfolio' as SiteType,
    domains: '',
  })
  showCreateForm.value = false
  editingSite.value = null
}

const openCreate = () => {
  resetForm()
  showCreateForm.value = true
}

const openEdit = (site: ManagedSite) => {
  editingSite.value = site
  showCreateForm.value = false
  Object.assign(form, {
    name: site.name,
    slug: site.slug,
    type: site.type,
    domains: site.domains.join('\n'),
  })
}

const loadSites = async () => {
  loading.value = true
  try {
    items.value = await api.sites.list()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('sites.loadError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  const domains = parseDomains(form.domains)
  if (!form.name.trim() || !form.slug.trim() || domains.length === 0) {
    toast.value = { message: t('sites.required'), type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.sites.create({
      name: form.name.trim(),
      slug: form.slug.trim(),
      type: form.type,
      domains,
    })
    toast.value = { message: t('sites.createSuccess'), type: 'success' }
    resetForm()
    await loadSites()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('sites.createError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleUpdate = async () => {
  if (!editingSite.value) return

  const domains = parseDomains(form.domains)
  if (!form.name.trim() || !form.slug.trim() || domains.length === 0) {
    toast.value = { message: t('sites.required'), type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.sites.update(editingSite.value.id, {
      name: form.name.trim(),
      slug: form.slug.trim(),
      domains,
    })
    toast.value = { message: t('sites.updateSuccess'), type: 'success' }
    resetForm()
    await loadSites()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('sites.updateError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return

  deleting.value = true
  try {
    await api.sites.delete(deleteTarget.value.id)
    toast.value = { message: t('sites.deleteSuccess'), type: 'success' }
    deleteTarget.value = null
    await loadSites()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('sites.deleteError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    deleting.value = false
  }
}

onMounted(loadSites)
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <ConfirmDialog
      :open="!!deleteTarget"
      :title="$t('sites.deleteTitle')"
      :message="$t('sites.deleteMessage', { name: deleteTarget?.name })"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ $t('sites.count', { count: items.length }) }}</p>
      <button class="btn-primary" @click="openCreate">
        <Icon name="mdi:plus" class="h-4 w-4" /> {{ $t('sites.newSite') }}
      </button>
    </div>

    <div v-if="showCreateForm || editingSite" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ editingSite ? $t('sites.editSite') : $t('sites.newSite') }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">{{ $t('sites.name') }}</label>
          <input v-model="form.name" type="text" class="form-input" :placeholder="$t('sites.namePlaceholder')" />
        </div>
        <div>
          <label class="form-label">{{ $t('sites.slug') }}</label>
          <input v-model="form.slug" type="text" class="form-input" :placeholder="$t('sites.slugPlaceholder')" />
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('sites.type') }}</label>
        <select v-model="form.type" class="form-select" :disabled="!!editingSite">
          <option v-for="type in siteTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <div>
        <label class="form-label">{{ $t('sites.domains') }}</label>
        <textarea
          v-model="form.domains"
          class="form-textarea min-h-24"
          :placeholder="$t('sites.domainsPlaceholder')"
        />
        <p class="mt-1 text-xs text-slate-500">{{ $t('sites.domainsHelp') }}</p>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetForm">{{ $t('common.cancel') }}</button>
        <button
          type="button"
          class="btn-primary"
          :disabled="saving"
          @click="editingSite ? handleUpdate() : handleCreate()"
        >
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ editingSite ? $t('common.save') : $t('sites.createSite') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:web-off" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">{{ $t('sites.noSites') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div v-for="site in items" :key="site.id" class="card space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold text-slate-900">{{ site.name }}</h3>
            <p class="text-xs text-slate-500">{{ site.slug }} · {{ site.type }}</p>
          </div>
          <span class="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
            {{ site.type }}
          </span>
        </div>

        <div class="space-y-1">
          <p v-for="domain in site.domains" :key="domain" class="text-sm text-slate-600">
            {{ domain }}
          </p>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-3">
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            @click="openEdit(site)"
          >
            <Icon name="mdi:pencil" class="mr-1 inline h-4 w-4" />
            {{ $t('common.edit') }}
          </button>
          <button
            type="button"
            class="rounded px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
            @click="deleteTarget = site"
          >
            <Icon name="mdi:trash-can-outline" class="mr-1 inline h-4 w-4" />
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
