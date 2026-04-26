import type { ApiEnvelope, UploadResponse } from '~/types/shared'

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl || 'http://localhost:8080'
  const { getAuthHeaders, logout, isMockMode } = useAuth()
  const { getPortfolioAdminPath } = useSiteContext()

  const handleApiError = (err: unknown): never => {
    if (err instanceof Error && 'statusCode' in err) {
      const status = (err as { statusCode: number }).statusCode
      if (status === 401) {
        logout()
        throw new Error('Session expired')
      }
      if (status === 403) {
        throw new Error('Insufficient permissions')
      }
    }
    throw err
  }

  const apiFetch = async <T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> => {
    try {
      const res = await $fetch<ApiEnvelope<T>>(`${apiBase}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers as Record<string, string> ?? {}),
        },
      })

      if (!res) return undefined as T
      if (res.error) throw new Error(res.error)

      return res.data as T
    } catch (err: unknown) {
      return handleApiError(err)
    }
  }

  const apiFetchWithMeta = async <T>(
    endpoint: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<{ data: T; meta?: Record<string, unknown> }> => {
    try {
      const res = await $fetch<ApiEnvelope<T>>(`${apiBase}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers as Record<string, string> ?? {}),
        },
      })

      if (res.error) throw new Error(res.error)
      return { data: res.data as T, meta: res.meta as Record<string, unknown> | undefined }
    } catch (err: unknown) {
      return handleApiError(err)
    }
  }

  const upload = async (file: File): Promise<UploadResponse> => {
    if (isMockMode.value) {
      return { url: URL.createObjectURL(file), filename: file.name }
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await $fetch<ApiEnvelope<UploadResponse>>(`${apiBase}${getPortfolioAdminPath('upload')}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    if (res.error) throw new Error(res.error)
    return res.data as UploadResponse
  }

  const getUploadUrl = (path: string): string => {
    if (!path) return ''
    if (path.startsWith('http') || path.startsWith('blob:')) return path
    return `${apiBase}${path}`
  }

  return {
    apiBase,
    apiFetch,
    apiFetchWithMeta,
    upload,
    getUploadUrl,
    isMockMode,
  }
}
