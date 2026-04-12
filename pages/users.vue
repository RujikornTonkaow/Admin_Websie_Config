<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types/admin'

const { t } = useI18n()
const api = useAdminApi()
const { currentUserId } = useAuth()

const items = ref<AdminUser[]>([])
const loading = ref(true)
const saving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showCreateForm = ref(false)
const showEditForm = ref(false)
const showPasswordForm = ref(false)
const editingUser = ref<AdminUser | null>(null)

const createForm = reactive({
  username: '',
  password: '',
  role: 'user_account' as UserRole,
})

const editForm = reactive({
  username: '',
  role: 'user_account' as UserRole,
})

const passwordForm = reactive({
  new_password: '',
  confirm_password: '',
})

const deleteTarget = ref<AdminUser | null>(null)
const deleting = ref(false)

const roles = computed<{ value: UserRole; label: string; description: string }[]>(() => [
  { value: 'admin', label: t('roles.admin'), description: t('users.roleDescriptions.admin') },
  { value: 'user_account', label: t('roles.user'), description: t('users.roleDescriptions.user') },
  { value: 'visitor', label: t('roles.visitor'), description: t('users.roleDescriptions.visitor') },
])

const roleBadgeClass = (role: UserRole): string => {
  const map: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-700',
    user_account: 'bg-blue-100 text-blue-700',
    visitor: 'bg-slate-100 text-slate-700',
  }
  return map[role] ?? map.visitor
}

const roleLabel = (role: UserRole): string =>
  roles.value.find(r => r.value === role)?.label ?? role

const isSelf = (user: AdminUser): boolean => user.id === currentUserId.value

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.users.list()
  } catch {
    toast.value = { message: t('users.deleteError'), type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetCreateForm = () => {
  Object.assign(createForm, { username: '', password: '', role: 'user_account' })
  showCreateForm.value = false
}

const openEdit = (user: AdminUser) => {
  editingUser.value = user
  Object.assign(editForm, { username: user.username, role: user.role })
  showEditForm.value = true
  showPasswordForm.value = false
  showCreateForm.value = false
}

const resetEditForm = () => {
  editingUser.value = null
  showEditForm.value = false
}

const openPasswordChange = (user: AdminUser) => {
  editingUser.value = user
  Object.assign(passwordForm, { new_password: '', confirm_password: '' })
  showPasswordForm.value = true
  showEditForm.value = false
  showCreateForm.value = false
}

const resetPasswordForm = () => {
  editingUser.value = null
  showPasswordForm.value = false
}

const handleCreate = async () => {
  if (!createForm.username.trim() || !createForm.password.trim()) {
    toast.value = { message: t('users.usernamePasswordRequired'), type: 'error' }
    return
  }
  if (createForm.password.length < 8) {
    toast.value = { message: t('users.passwordMinLength'), type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.create(createForm)
    toast.value = { message: t('users.createSuccess'), type: 'success' }
    resetCreateForm()
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('users.createError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleUpdate = async () => {
  if (!editingUser.value) return
  if (!editForm.username.trim()) {
    toast.value = { message: t('users.usernameRequired'), type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.update(editingUser.value.id, editForm)
    toast.value = { message: t('users.updateSuccess'), type: 'success' }
    resetEditForm()
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('users.updateError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  if (!editingUser.value) return
  if (passwordForm.new_password.length < 8) {
    toast.value = { message: t('users.passwordMinLength'), type: 'error' }
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    toast.value = { message: t('users.passwordMismatch'), type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.changePassword(editingUser.value.id, passwordForm.new_password)
    toast.value = { message: t('users.passwordChanged'), type: 'success' }
    resetPasswordForm()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('users.passwordError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.users.delete(deleteTarget.value.id)
    toast.value = { message: t('users.deleteSuccess'), type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('users.deleteError')
    toast.value = { message: msg, type: 'error' }
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
      :title="$t('users.deleteTitle')"
      :message="$t('users.deleteMessage', { username: deleteTarget?.username })"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ $t('users.count', { count: items.length }) }}</p>
      <button class="btn-primary" @click="showCreateForm = true; showEditForm = false; showPasswordForm = false">
        <Icon name="mdi:plus" class="h-4 w-4" /> {{ $t('users.addUser') }}
      </button>
    </div>

    <div v-if="showCreateForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">{{ $t('users.newUser') }}</h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">{{ $t('users.username') }}</label>
          <input v-model="createForm.username" type="text" class="form-input" :placeholder="$t('users.usernamePlaceholder')" />
          <p class="mt-1 text-xs text-slate-500">{{ $t('users.usernameHelp') }}</p>
        </div>
        <div>
          <label class="form-label">{{ $t('users.role') }}</label>
          <select v-model="createForm.role" class="form-select">
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }} — {{ r.description }}
            </option>
          </select>
          <p class="mt-1 text-xs text-slate-500">{{ $t('users.roleHelp') }}</p>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('users.password') }}</label>
        <input v-model="createForm.password" type="password" class="form-input" :placeholder="$t('users.passwordPlaceholder')" />
        <p class="mt-1 text-xs text-slate-500">{{ $t('users.passwordHelp') }}</p>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetCreateForm">{{ $t('common.cancel') }}</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleCreate">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ $t('users.createUser') }}
        </button>
      </div>
    </div>

    <div v-if="showEditForm && editingUser" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ $t('users.editUser', { username: editingUser.username }) }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">{{ $t('users.username') }}</label>
          <input v-model="editForm.username" type="text" class="form-input" />
          <p class="mt-1 text-xs text-slate-500">{{ $t('users.usernameHelp') }}</p>
        </div>
        <div>
          <label class="form-label">{{ $t('users.role') }}</label>
          <select v-model="editForm.role" class="form-select" :disabled="isSelf(editingUser)">
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
          <p v-if="isSelf(editingUser)" class="mt-1 text-xs text-amber-600">
            {{ $t('users.cannotChangeOwnRole') }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetEditForm">{{ $t('common.cancel') }}</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleUpdate">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ $t('users.saveChanges') }}
        </button>
      </div>
    </div>

    <div v-if="showPasswordForm && editingUser" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        {{ $t('users.changePasswordTitle', { username: editingUser.username }) }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">{{ $t('users.newPassword') }}</label>
          <input v-model="passwordForm.new_password" type="password" class="form-input" :placeholder="$t('users.newPasswordPlaceholder')" />
          <p class="mt-1 text-xs text-slate-500">{{ $t('users.newPasswordHelp') }}</p>
        </div>
        <div>
          <label class="form-label">{{ $t('users.confirmPassword') }}</label>
          <input v-model="passwordForm.confirm_password" type="password" class="form-input" :placeholder="$t('users.confirmPasswordPlaceholder')" />
          <p class="mt-1 text-xs text-slate-500">{{ $t('users.confirmPasswordHelp') }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetPasswordForm">{{ $t('common.cancel') }}</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleChangePassword">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          {{ $t('users.changePassword') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:account-group" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">{{ $t('users.noUsers') }}</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="user in items"
        :key="user.id"
        class="card flex items-center gap-4 !p-4"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Icon name="mdi:account" class="h-5 w-5 text-slate-600" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-slate-900 truncate">{{ user.username }}</p>
            <span v-if="isSelf(user)" class="text-xs text-slate-400">({{ $t('common.you') }})</span>
          </div>
          <div class="mt-1 flex items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              :class="roleBadgeClass(user.role)"
            >
              {{ roleLabel(user.role) }}
            </span>
            <span class="text-xs text-slate-400">
              Created {{ new Date(user.created_at).toLocaleDateString() }}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 gap-1">
          <button
            class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            :title="$t('common.edit')"
            @click="openEdit(user)"
          >
            <Icon name="mdi:pencil" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            :title="$t('users.changePassword')"
            @click="openPasswordChange(user)"
          >
            <Icon name="mdi:lock-reset" class="h-4 w-4" />
          </button>
          <button
            v-if="!isSelf(user)"
            class="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            :title="$t('common.delete')"
            @click="deleteTarget = user"
          >
            <Icon name="mdi:trash-can-outline" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
