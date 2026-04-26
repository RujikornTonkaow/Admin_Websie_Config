import { canAccessSuperAdminPath, canAccessUserManagementPath, canViewerAccessPath } from '~/config/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, canManageUsers, isEditor, isSuperAdmin } = useAuth()

  if (to.path === '/login') {
    if (isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (!canAccessUserManagementPath(to.path, canManageUsers.value)) {
    return navigateTo('/')
  }

  if (!canAccessSuperAdminPath(to.path, isSuperAdmin.value)) {
    return navigateTo('/')
  }

  if (!isEditor.value && !canViewerAccessPath(to.path)) {
    return navigateTo('/')
  }
})
