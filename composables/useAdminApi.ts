import type { AdminUser, CreateUserRequest, UpdateUserRequest, UserRole } from '~/types/auth'

export const useAdminApi = () => {
  const portfolioApi = usePortfolioApi()
  const { apiFetch, upload, getUploadUrl, isMockMode } = useApiClient()

  const users = {
    list: (): Promise<AdminUser[]> =>
      isMockMode.value
        ? Promise.resolve([
            { id: 'mock-admin', username: 'admin', role: 'admin' as UserRole, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ])
        : apiFetch('/api/v1/admin/users'),
    getById: (id: string): Promise<AdminUser> =>
      isMockMode.value
        ? Promise.resolve({ id, username: 'admin', role: 'admin' as UserRole, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        : apiFetch(`/api/v1/admin/users/${id}`),
    create: (data: CreateUserRequest): Promise<AdminUser> =>
      isMockMode.value
        ? Promise.resolve({ id: `mock-${Date.now()}`, username: data.username, role: data.role, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        : apiFetch('/api/v1/admin/users', { method: 'POST', body: data }),
    update: (id: string, data: UpdateUserRequest): Promise<AdminUser> =>
      isMockMode.value
        ? Promise.resolve({ id, username: data.username, role: data.role, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        : apiFetch(`/api/v1/admin/users/${id}`, { method: 'PUT', body: data }),
    changePassword: (id: string, newPassword: string): Promise<void> =>
      isMockMode.value
        ? Promise.resolve()
        : apiFetch(`/api/v1/admin/users/${id}/password`, { method: 'PUT', body: { new_password: newPassword } }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' }),
  }

  return {
    ...portfolioApi,
    users,
    upload,
    getUploadUrl,
  }
}
