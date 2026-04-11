import type { LoginRequest, LoginResponse, ApiEnvelope } from '~/types/admin'

const TOKEN_KEY = 'admin_token'
const MOCK_TOKEN = 'mock-demo-token'
const MOCK_MODE_KEY = 'admin_mock_mode'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl
  const token = useState<string | null>('auth_token', () => {
    if (import.meta.client) {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  })

  const isMockMode = useState<boolean>('mock_mode', () => {
    if (import.meta.client) {
      return localStorage.getItem(MOCK_MODE_KEY) === 'true'
    }
    return false
  })

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const res = await $fetch<ApiEnvelope<LoginResponse>>(`${apiBase}/api/v1/admin/auth/login`, {
        method: 'POST',
        body: credentials,
      })

      if (res.error) {
        throw new Error(res.error)
      }

      const jwt = res.data?.token
      if (!jwt) {
        throw new Error('No token received')
      }

      token.value = jwt
      isMockMode.value = false
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, jwt)
        localStorage.removeItem(MOCK_MODE_KEY)
      }
    } catch (err: unknown) {
      const isNetworkError = err instanceof TypeError
        || (err instanceof Error && err.message.includes('fetch'))

      if (isNetworkError) {
        throw new Error('Cannot connect to backend. Use "Demo Mode" to preview the UI.')
      }
      throw err
    }
  }

  const loginDemo = () => {
    token.value = MOCK_TOKEN
    isMockMode.value = true
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, MOCK_TOKEN)
      localStorage.setItem(MOCK_MODE_KEY, 'true')
    }
  }

  const logout = () => {
    token.value = null
    isMockMode.value = false
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(MOCK_MODE_KEY)
    }
    navigateTo('/login')
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (!token.value || isMockMode.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  }

  return {
    token,
    isAuthenticated,
    isMockMode,
    login,
    loginDemo,
    logout,
    getAuthHeaders,
  }
}
