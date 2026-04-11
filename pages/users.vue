<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types/admin'

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

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access including user management' },
  { value: 'user_account', label: 'User', description: 'Content management, no user management' },
  { value: 'visitor', label: 'Visitor', description: 'Read-only access to messages' },
]

const roleBadgeClass = (role: UserRole): string => {
  const map: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-700',
    user_account: 'bg-blue-100 text-blue-700',
    visitor: 'bg-slate-100 text-slate-700',
  }
  return map[role] ?? map.visitor
}

const roleLabel = (role: UserRole): string =>
  roles.find(r => r.value === role)?.label ?? role

const isSelf = (user: AdminUser): boolean => user.id === currentUserId.value

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.users.list()
  } catch {
    toast.value = { message: 'Failed to load users', type: 'error' }
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
    toast.value = { message: 'Username and password are required', type: 'error' }
    return
  }
  if (createForm.password.length < 8) {
    toast.value = { message: 'Password must be at least 8 characters', type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.create(createForm)
    toast.value = { message: 'User created', type: 'success' }
    resetCreateForm()
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create user'
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleUpdate = async () => {
  if (!editingUser.value) return
  if (!editForm.username.trim()) {
    toast.value = { message: 'Username is required', type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.update(editingUser.value.id, editForm)
    toast.value = { message: 'User updated', type: 'success' }
    resetEditForm()
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update user'
    toast.value = { message: msg, type: 'error' }
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  if (!editingUser.value) return
  if (passwordForm.new_password.length < 8) {
    toast.value = { message: 'Password must be at least 8 characters', type: 'error' }
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    toast.value = { message: 'Passwords do not match', type: 'error' }
    return
  }

  saving.value = true
  try {
    await api.users.changePassword(editingUser.value.id, passwordForm.new_password)
    toast.value = { message: 'Password changed', type: 'success' }
    resetPasswordForm()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to change password'
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
    toast.value = { message: 'User deleted', type: 'success' }
    deleteTarget.value = null
    await loadData()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user'
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
      title="Delete User"
      :message="`Are you sure you want to delete user '${deleteTarget?.username}'? This action cannot be undone.`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ items.length }} user(s)</p>
      <button class="btn-primary" @click="showCreateForm = true; showEditForm = false; showPasswordForm = false">
        <Icon name="mdi:plus" class="h-4 w-4" /> Add User
      </button>
    </div>

    <!-- Create Form -->
    <div v-if="showCreateForm" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">New User</h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">Username</label>
          <input v-model="createForm.username" type="text" class="form-input" placeholder="Enter username" />
        </div>
        <div>
          <label class="form-label">Role</label>
          <select v-model="createForm.role" class="form-select">
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }} — {{ r.description }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label class="form-label">Password</label>
        <input v-model="createForm.password" type="password" class="form-input" placeholder="Minimum 8 characters" />
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetCreateForm">Cancel</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleCreate">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          Create User
        </button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="showEditForm && editingUser" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        Edit User — {{ editingUser.username }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">Username</label>
          <input v-model="editForm.username" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">Role</label>
          <select v-model="editForm.role" class="form-select" :disabled="isSelf(editingUser)">
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
          <p v-if="isSelf(editingUser)" class="mt-1 text-xs text-amber-600">
            You cannot change your own role
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetEditForm">Cancel</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleUpdate">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          Save Changes
        </button>
      </div>
    </div>

    <!-- Password Change Form -->
    <div v-if="showPasswordForm && editingUser" class="card space-y-4">
      <h3 class="text-base font-semibold text-slate-900">
        Change Password — {{ editingUser.username }}
      </h3>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label">New Password</label>
          <input v-model="passwordForm.new_password" type="password" class="form-input" placeholder="Minimum 8 characters" />
        </div>
        <div>
          <label class="form-label">Confirm Password</label>
          <input v-model="passwordForm.confirm_password" type="password" class="form-input" placeholder="Re-enter password" />
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="resetPasswordForm">Cancel</button>
        <button type="button" class="btn-primary" :disabled="saving" @click="handleChangePassword">
          <Icon v-if="saving" name="mdi:loading" class="h-4 w-4 animate-spin" />
          Change Password
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="mdi:loading" class="h-8 w-8 animate-spin text-indigo-600" />
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="card py-12 text-center">
      <Icon name="mdi:account-group" class="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p class="text-sm text-slate-500">No users found</p>
    </div>

    <!-- User List -->
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
            <span v-if="isSelf(user)" class="text-xs text-slate-400">(you)</span>
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
            title="Edit user"
            @click="openEdit(user)"
          >
            <Icon name="mdi:pencil" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Change password"
            @click="openPasswordChange(user)"
          >
            <Icon name="mdi:lock-reset" class="h-4 w-4" />
          </button>
          <button
            v-if="!isSelf(user)"
            class="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            title="Delete user"
            @click="deleteTarget = user"
          >
            <Icon name="mdi:trash-can-outline" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
