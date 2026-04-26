<script setup lang="ts">
import type { AdminUser, UserRole } from '~/types/admin'
import type { ManagedSite, UserMembership } from '~/types/site'

type MembershipForm = Record<string, { enabled: boolean }>

const { t } = useI18n()
const api = useAdminApi()
const { currentUserId, isSuperAdmin } = useAuth()

const items = ref<AdminUser[]>([])
const sites = ref<ManagedSite[]>([])
const membershipsByUser = ref<Record<string, UserMembership[]>>({})
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
  role: 'editor' as UserRole,
  memberships: {} as MembershipForm,
})

const editForm = reactive({
  username: '',
  role: 'editor' as UserRole,
  memberships: {} as MembershipForm,
})

const passwordForm = reactive({
  new_password: '',
  confirm_password: '',
})

const deleteTarget = ref<AdminUser | null>(null)
const deleting = ref(false)

const roles = computed<{ value: UserRole; label: string; description: string }[]>(() => {
  const allRoles = [
    { value: 'super_admin' as UserRole, label: t('roles.superAdmin'), description: t('users.roleDescriptions.superAdmin') },
    { value: 'admin' as UserRole, label: t('roles.admin'), description: t('users.roleDescriptions.admin') },
    { value: 'editor' as UserRole, label: t('roles.editor'), description: t('users.roleDescriptions.editor') },
    { value: 'viewer' as UserRole, label: t('roles.viewer'), description: t('users.roleDescriptions.viewer') },
  ]

  return isSuperAdmin.value ? allRoles : allRoles.filter(role => role.value !== 'super_admin')
})

const roleBadgeClass = (role: UserRole): string => {
  const map: Record<UserRole, string> = {
    super_admin: 'bg-red-100 text-red-700',
    admin: 'bg-blue-100 text-blue-700',
    editor: 'bg-violet-100 text-violet-700',
    viewer: 'bg-slate-100 text-slate-700',
  }
  return map[role] ?? map.viewer
}

const roleLabel = (role: UserRole): string =>
  roles.value.find(r => r.value === role)?.label ?? role

const isSelf = (user: AdminUser): boolean => user.id === currentUserId.value

const buildMembershipForm = (memberships: UserMembership[] = []): MembershipForm => {
  const form: MembershipForm = {}
  for (const site of sites.value) {
    const membership = memberships.find(item => item.site_id === site.id)
    form[site.id] = {
      enabled: !!membership,
    }
  }
  return form
}

const membershipPayload = (form: MembershipForm) => ({
  memberships: Object.entries(form)
    .filter(([, value]) => value.enabled)
    .map(([siteId]) => ({ site_id: siteId })),
})

const userSiteNames = (user: AdminUser): string => {
  const memberships = membershipsByUser.value[user.id] ?? []
  if (memberships.length === 0) return t('users.noSiteAccess')

  return memberships
    .map((membership) => {
      const site = sites.value.find(item => item.id === membership.site_id)
      return site?.name ?? membership.site_id
    })
    .join(', ')
}

const loadData = async () => {
  loading.value = true
  try {
    const [users, managedSites] = await Promise.all([
      api.users.list(),
      api.sites.list(),
    ])
    items.value = users
    sites.value = managedSites

    const entries = await Promise.all(
      users.map(async user => [user.id, await api.users.listMemberships(user.id)] as const),
    )
    membershipsByUser.value = Object.fromEntries(entries)
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('users.loadError')
    toast.value = { message: msg, type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    username: '',
    password: '',
    role: 'editor' as UserRole,
    memberships: buildMembershipForm(),
  })
  showCreateForm.value = false
}

const openCreate = () => {
  Object.assign(createForm, {
    username: '',
    password: '',
    role: 'editor' as UserRole,
    memberships: buildMembershipForm(),
  })
  showCreateForm.value = true
  showEditForm.value = false
  showPasswordForm.value = false
}

const openEdit = async (user: AdminUser) => {
  editingUser.value = user
  const memberships = membershipsByUser.value[user.id] ?? await api.users.listMemberships(user.id)
  membershipsByUser.value[user.id] = memberships
  Object.assign(editForm, {
    username: user.username,
    role: user.role,
    memberships: buildMembershipForm(memberships),
  })
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
    const user = await api.users.create({
      username: createForm.username,
      password: createForm.password,
      role: createForm.role,
    })
    if (user.role !== 'super_admin') {
      await api.users.updateMemberships(user.id, membershipPayload(createForm.memberships))
    }
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
    await api.users.update(editingUser.value.id, {
      username: editForm.username,
      role: editForm.role,
    })
    if (editForm.role !== 'super_admin') {
      const memberships = await api.users.updateMemberships(editingUser.value.id, membershipPayload(editForm.memberships))
      membershipsByUser.value[editingUser.value.id] = memberships
    }
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
  <div class="mx-auto max-w-5xl space-y-6">
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
      <button class="btn-primary" @click="openCreate">
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

      <div v-if="createForm.role !== 'super_admin'" class="space-y-3 rounded-xl border border-slate-200 p-4">
        <h4 class="text-sm font-semibold text-slate-800">{{ $t('users.siteAccess') }}</h4>
        <div v-for="site in sites" :key="site.id" class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <input v-model="createForm.memberships[site.id].enabled" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-sky-500">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">{{ site.name }}</p>
            <p class="text-xs text-slate-500">{{ site.type }} · {{ site.domains.join(', ') }}</p>
          </div>
        </div>
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

      <div v-if="editForm.role !== 'super_admin'" class="space-y-3 rounded-xl border border-slate-200 p-4">
        <h4 class="text-sm font-semibold text-slate-800">{{ $t('users.siteAccess') }}</h4>
        <div v-for="site in sites" :key="site.id" class="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <input v-model="editForm.memberships[site.id].enabled" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-sky-500" :disabled="editingUser.role === 'super_admin'">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">{{ site.name }}</p>
            <p class="text-xs text-slate-500">{{ site.type }} · {{ site.domains.join(', ') }}</p>
          </div>
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
            <span v-if="user.role === 'super_admin'" class="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">{{ $t('roles.superAdmin') }}</span>
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              :class="roleBadgeClass(user.role)"
            >
              {{ roleLabel(user.role) }}
            </span>
            <span class="text-xs text-slate-400">
              {{ userSiteNames(user) }}
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
