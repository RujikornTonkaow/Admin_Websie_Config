const VISITOR_ALLOWED_PATHS = ['/', '/contacts', '/login']
const ADMIN_ONLY_PATHS = ['/users']

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

  if (ADMIN_ONLY_PATHS.includes(to.path) && !isAdmin.value) {
    return navigateTo('/')
  }

  if (!isEditor.value && !VISITOR_ALLOWED_PATHS.includes(to.path)) {
    return navigateTo('/')
  }
})
