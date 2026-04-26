import type { AdminUser, CreateUserRequest, UpdateUserRequest, UserRole } from '~/types/auth'
import type { CreateSiteRequest, ManagedSite, UpdateSiteRequest, UpdateUserMembershipsRequest, UserMembership } from '~/types/site'

export const useAdminApi = () => {
  const portfolioApi = usePortfolioApi()
  const { apiFetch, upload, getUploadUrl, isMockMode } = useApiClient()

  const users = {
    list: (): Promise<AdminUser[]> =>
      isMockMode.value
        ? Promise.resolve([
            { id: 'mock-admin', username: 'admin', role: 'super_admin' as UserRole, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ])
        : apiFetch('/api/v1/admin/users'),
    getById: (id: string): Promise<AdminUser> =>
      isMockMode.value
        ? Promise.resolve({ id, username: 'admin', role: 'super_admin' as UserRole, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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
    listMemberships: (id: string): Promise<UserMembership[]> =>
      isMockMode.value ? Promise.resolve([]) : apiFetch(`/api/v1/admin/users/${id}/memberships`),
    updateMemberships: (id: string, data: UpdateUserMembershipsRequest): Promise<UserMembership[]> =>
      isMockMode.value ? Promise.resolve(data.memberships.map((membership, index) => ({
        id: `mock-membership-${index}`,
        site_id: membership.site_id,
        user_id: id,
      }))) : apiFetch(`/api/v1/admin/users/${id}/memberships`, { method: 'PUT', body: data }),
  }

  const sites = {
    list: (): Promise<ManagedSite[]> =>
      isMockMode.value
        ? Promise.resolve([
            {
              id: 'mock-site-id',
              name: 'Demo Portfolio',
              slug: 'demo-portfolio',
              type: 'portfolio',
              domains: ['localhost:3000'],
              member_role: 'owner',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
        : apiFetch('/api/v1/admin/sites'),
    create: (data: CreateSiteRequest): Promise<ManagedSite> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, member_role: 'owner', created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        : apiFetch('/api/v1/admin/sites', { method: 'POST', body: data }),
    update: (id: string, data: UpdateSiteRequest): Promise<ManagedSite> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id, type: 'portfolio', member_role: 'owner', created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        : apiFetch(`/api/v1/admin/sites/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/sites/${id}`, { method: 'DELETE' }),
  }

  return {
    ...portfolioApi,
    users,
    sites,
    upload,
    getUploadUrl,
  }
}
