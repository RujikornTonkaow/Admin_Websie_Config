<script setup lang="ts">
import type { ContactMessage } from '~/types/admin'

const { t, locale } = useI18n()
const api = useAdminApi()
const { isEditor } = useAuth()

const items = ref<ContactMessage[]>([])
const unreadCount = ref(0)
const loading = ref(true)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const selectedMessage = ref<ContactMessage | null>(null)
const deleteTarget = ref<ContactMessage | null>(null)
const deleting = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.contacts.list()
    items.value = res.items
    unreadCount.value = res.unreadCount
  } catch {
    toast.value = { message: t('contacts.loadError'), type: 'error' }
  } finally {
    loading.value = false
  }
}

const openMessage = async (msg: ContactMessage) => {
  try {
    const full = await api.contacts.getById(msg.id)
    selectedMessage.value = full

    const idx = items.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], is_read: true }
    }
  } catch {
    toast.value = { message: t('contacts.loadMessageError'), type: 'error' }
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.contacts.delete(deleteTarget.value.id)
    toast.value = { message: t('contacts.deleteSuccess'), type: 'success' }
    if (selectedMessage.value?.id === deleteTarget.value.id) {
      selectedMessage.value = null
    }
    deleteTarget.value = null
    await loadData()
  } catch {
    toast.value = { message: t('contacts.deleteError'), type: 'error' }
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const dateLocale = locale.value === 'th' ? 'th-TH' : 'en-US'
  return date.toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <Toast v-if="toast" :message="toast.message" :type="toast.type" @close="toast = null" />

    <ConfirmDialog
      :open="!!deleteTarget"
      :title="$t('contacts.deleteTitle')"
      :message="$t('contacts.deleteMessage', { name: deleteTarget?.name })"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <p class="text-sm text-slate-500">{{ $t('contacts.count', { count: items.length }) }}</p>
        <span
          v-if="unreadCount > 0"
          class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
        >
          {{ $t('contacts.unread', { count: unreadCount }) }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:email-outline" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">{{ $t('contacts.noMessages') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div class="space-y-2 lg:col-span-2">
        <div
          v-for="msg in items"
          :key="msg.id"
          class="cursor-pointer rounded-xl border p-4 transition-colors"
          :class="[
            selectedMessage?.id === msg.id
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-slate-200 bg-white hover:border-slate-300',
          ]"
          @click="openMessage(msg)"
        >
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-slate-900 truncate">{{ msg.name }}</p>
                <span
                  v-if="!msg.is_read"
                  class="h-2 w-2 shrink-0 rounded-full bg-indigo-500"
                />
              </div>
              <p class="text-xs text-slate-500 truncate">{{ msg.email }}</p>
              <p class="mt-1 text-sm font-medium text-slate-700 truncate">{{ msg.subject }}</p>
            </div>
            <button
              v-if="isEditor"
              class="ml-2 shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
              @click.stop="deleteTarget = msg"
            >
              <Icon name="mdi:trash-can-outline" class="h-4 w-4" />
            </button>
          </div>
          <p class="mt-1 text-xs text-slate-400">{{ formatDate(msg.created_at) }}</p>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div v-if="selectedMessage" class="card">
          <div class="mb-4 border-b border-slate-200 pb-4">
            <h3 class="text-lg font-semibold text-slate-900">{{ selectedMessage.subject }}</h3>
            <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span class="flex items-center gap-1">
                <Icon name="mdi:account" class="h-4 w-4" />
                {{ selectedMessage.name }}
              </span>
              <a :href="`mailto:${selectedMessage.email}`" class="flex items-center gap-1 text-indigo-600 hover:underline">
                <Icon name="mdi:email-outline" class="h-4 w-4" />
                {{ selectedMessage.email }}
              </a>
              <span class="flex items-center gap-1">
                <Icon name="mdi:clock-outline" class="h-4 w-4" />
                {{ formatDate(selectedMessage.created_at) }}
              </span>
            </div>
          </div>
          <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {{ selectedMessage.message }}
          </p>
        </div>

        <div v-else class="card flex flex-col items-center justify-center py-16 text-center">
          <Icon name="mdi:email-open-outline" class="mb-3 h-12 w-12 text-slate-300" />
          <p class="text-sm text-slate-500">{{ $t('contacts.selectMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
