import { canAccessAdminOnlyPath, canVisitorAccessPath } from '~/config/permissions'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isAdmin, isEditor } = useAuth()

  if (to.path === '/login') {
    if (isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (!canAccessAdminOnlyPath(to.path, isAdmin.value)) {
    return navigateTo('/')
  }

  if (!isEditor.value && !canVisitorAccessPath(to.path)) {
    return navigateTo('/')
  }
})
