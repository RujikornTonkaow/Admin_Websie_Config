import type {
  ApiEnvelope,
  SiteSettings,
  Hero,
  About,
  Skill,
  Project,
  Experience,
  SocialLink,
  ContactMessage,
  UploadResponse,
  ReorderRequest,
} from '~/types/admin'
import {
  mockSiteSettings,
  mockHero,
  mockAbout,
  mockSkills,
  mockProjects,
  mockExperiences,
  mockSocialLinks,
  mockContacts,
} from '~/composables/useMockData'

export const useAdminApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl
  const { getAuthHeaders, logout, isMockMode } = useAuth()

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

      if (res.error) {
        throw new Error(res.error)
      }

      return res.data as T
    } catch (err: unknown) {
      if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 401) {
        logout()
        throw new Error('Session expired')
      }
      throw err
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
      if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 401) {
        logout()
        throw new Error('Session expired')
      }
      throw err
    }
  }

  const siteSettings = {
    get: (): Promise<SiteSettings> =>
      isMockMode.value ? Promise.resolve({ ...mockSiteSettings }) : apiFetch('/api/v1/admin/site-settings'),
    update: (data: Partial<SiteSettings>): Promise<SiteSettings> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSiteSettings, ...data })
        : apiFetch('/api/v1/admin/site-settings', { method: 'PUT', body: data }),
  }

  const hero = {
    get: (): Promise<Hero> =>
      isMockMode.value ? Promise.resolve({ ...mockHero }) : apiFetch('/api/v1/admin/hero'),
    update: (data: Partial<Hero>): Promise<Hero> =>
      isMockMode.value
        ? Promise.resolve({ ...mockHero, ...data })
        : apiFetch('/api/v1/admin/hero', { method: 'PUT', body: data }),
  }

  const about = {
    get: (): Promise<About> =>
      isMockMode.value ? Promise.resolve({ ...mockAbout }) : apiFetch('/api/v1/admin/about'),
    update: (data: Partial<About>): Promise<About> =>
      isMockMode.value
        ? Promise.resolve({ ...mockAbout, ...data })
        : apiFetch('/api/v1/admin/about', { method: 'PUT', body: data }),
  }

  const skills = {
    list: (): Promise<Skill[]> =>
      isMockMode.value ? Promise.resolve([...mockSkills]) : apiFetch('/api/v1/admin/skills'),
    create: (data: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Skill)
        : apiFetch('/api/v1/admin/skills', { method: 'POST', body: data }),
    update: (id: string, data: Partial<Skill>): Promise<Skill> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSkills[0], ...data, id } as Skill)
        : apiFetch(`/api/v1/admin/skills/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/skills/${id}`, { method: 'DELETE' }),
  }

  const projects = {
    list: (): Promise<Project[]> =>
      isMockMode.value ? Promise.resolve([...mockProjects]) : apiFetch('/api/v1/admin/projects'),
    create: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Project)
        : apiFetch('/api/v1/admin/projects', { method: 'POST', body: data }),
    update: (id: string, data: Partial<Project>): Promise<Project> =>
      isMockMode.value
        ? Promise.resolve({ ...mockProjects[0], ...data, id } as Project)
        : apiFetch(`/api/v1/admin/projects/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/projects/${id}`, { method: 'DELETE' }),
    reorder: (ids: string[]): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch('/api/v1/admin/projects/reorder', { method: 'PUT', body: { ids } as ReorderRequest }),
  }

  const experiences = {
    list: (): Promise<Experience[]> =>
      isMockMode.value ? Promise.resolve([...mockExperiences]) : apiFetch('/api/v1/admin/experiences'),
    create: (data: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Experience)
        : apiFetch('/api/v1/admin/experiences', { method: 'POST', body: data }),
    update: (id: string, data: Partial<Experience>): Promise<Experience> =>
      isMockMode.value
        ? Promise.resolve({ ...mockExperiences[0], ...data, id } as Experience)
        : apiFetch(`/api/v1/admin/experiences/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/experiences/${id}`, { method: 'DELETE' }),
    reorder: (ids: string[]): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch('/api/v1/admin/experiences/reorder', { method: 'PUT', body: { ids } as ReorderRequest }),
  }

  const socialLinks = {
    list: (): Promise<SocialLink[]> =>
      isMockMode.value ? Promise.resolve([...mockSocialLinks]) : apiFetch('/api/v1/admin/social-links'),
    create: (data: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<SocialLink> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as SocialLink)
        : apiFetch('/api/v1/admin/social-links', { method: 'POST', body: data }),
    update: (id: string, data: Partial<SocialLink>): Promise<SocialLink> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSocialLinks[0], ...data, id } as SocialLink)
        : apiFetch(`/api/v1/admin/social-links/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/social-links/${id}`, { method: 'DELETE' }),
  }

  const contacts = {
    list: async (): Promise<{ items: ContactMessage[]; unreadCount: number }> => {
      if (isMockMode.value) {
        const unread = mockContacts.filter(c => !c.is_read).length
        return { items: [...mockContacts], unreadCount: unread }
      }
      const res = await apiFetchWithMeta<ContactMessage[]>('/api/v1/admin/contacts')
      const unreadCount = (res.meta?.unread_count as number) ?? 0
      return { items: res.data, unreadCount }
    },
    getById: (id: string): Promise<ContactMessage> =>
      isMockMode.value
        ? Promise.resolve(mockContacts.find(c => c.id === id) ?? mockContacts[0])
        : apiFetch(`/api/v1/admin/contacts/${id}`),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(`/api/v1/admin/contacts/${id}`, { method: 'DELETE' }),
  }

  const upload = async (file: File): Promise<UploadResponse> => {
    if (isMockMode.value) {
      return { url: URL.createObjectURL(file), filename: file.name }
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await $fetch<ApiEnvelope<UploadResponse>>(`${apiBase}/api/v1/admin/upload`, {
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
    siteSettings,
    hero,
    about,
    skills,
    projects,
    experiences,
    socialLinks,
    contacts,
    upload,
    getUploadUrl,
  }
}
