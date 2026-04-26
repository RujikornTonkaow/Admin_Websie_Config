import { useSiteContext } from '~/composables/useSiteContext'
import type {
  About,
  ContactMessage,
  Experience,
  Hero,
  Project,
  SiteSettings,
  Skill,
  SocialLink,
} from '~/types/portfolio'
import type { ReorderRequest } from '~/types/shared'
import {
  mockAbout,
  mockContacts,
  mockExperiences,
  mockHero,
  mockProjects,
  mockSiteSettings,
  mockSkills,
  mockSocialLinks,
} from '~/composables/useMockData'

export const usePortfolioApi = () => {
  const { apiFetch, apiFetchWithMeta, isMockMode } = useApiClient()
  const { getPortfolioAdminPath } = useSiteContext()
  const endpoint = (path: string): string => getPortfolioAdminPath(path)

  const siteSettings = {
    get: (): Promise<SiteSettings> =>
      isMockMode.value ? Promise.resolve({ ...mockSiteSettings }) : apiFetch(endpoint('site-settings')),
    update: (data: Partial<SiteSettings>): Promise<SiteSettings> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSiteSettings, ...data })
        : apiFetch(endpoint('site-settings'), { method: 'PUT', body: data }),
  }

  const hero = {
    get: (): Promise<Hero> =>
      isMockMode.value ? Promise.resolve({ ...mockHero }) : apiFetch(endpoint('hero')),
    update: (data: Partial<Hero>): Promise<Hero> =>
      isMockMode.value
        ? Promise.resolve({ ...mockHero, ...data })
        : apiFetch(endpoint('hero'), { method: 'PUT', body: data }),
  }

  const about = {
    get: (): Promise<About> =>
      isMockMode.value ? Promise.resolve({ ...mockAbout }) : apiFetch(endpoint('about')),
    update: (data: Partial<About>): Promise<About> =>
      isMockMode.value
        ? Promise.resolve({ ...mockAbout, ...data })
        : apiFetch(endpoint('about'), { method: 'PUT', body: data }),
  }

  const skills = {
    list: (): Promise<Skill[]> =>
      isMockMode.value ? Promise.resolve([...mockSkills]) : apiFetch(endpoint('skills')),
    create: (data: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Skill)
        : apiFetch(endpoint('skills'), { method: 'POST', body: data }),
    update: (id: string, data: Partial<Skill>): Promise<Skill> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSkills[0], ...data, id } as Skill)
        : apiFetch(endpoint(`skills/${id}`), { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint(`skills/${id}`), { method: 'DELETE' }),
  }

  const projects = {
    list: (): Promise<Project[]> =>
      isMockMode.value ? Promise.resolve([...mockProjects]) : apiFetch(endpoint('projects')),
    create: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Project)
        : apiFetch(endpoint('projects'), { method: 'POST', body: data }),
    update: (id: string, data: Partial<Project>): Promise<Project> =>
      isMockMode.value
        ? Promise.resolve({ ...mockProjects[0], ...data, id } as Project)
        : apiFetch(endpoint(`projects/${id}`), { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint(`projects/${id}`), { method: 'DELETE' }),
    reorder: (ids: string[]): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint('projects/reorder'), { method: 'PUT', body: { ids } as ReorderRequest }),
  }

  const experiences = {
    list: (): Promise<Experience[]> =>
      isMockMode.value ? Promise.resolve([...mockExperiences]) : apiFetch(endpoint('experiences')),
    create: (data: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Experience)
        : apiFetch(endpoint('experiences'), { method: 'POST', body: data }),
    update: (id: string, data: Partial<Experience>): Promise<Experience> =>
      isMockMode.value
        ? Promise.resolve({ ...mockExperiences[0], ...data, id } as Experience)
        : apiFetch(endpoint(`experiences/${id}`), { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint(`experiences/${id}`), { method: 'DELETE' }),
    reorder: (ids: string[]): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint('experiences/reorder'), { method: 'PUT', body: { ids } as ReorderRequest }),
  }

  const socialLinks = {
    list: (): Promise<SocialLink[]> =>
      isMockMode.value ? Promise.resolve([...mockSocialLinks]) : apiFetch(endpoint('social-links')),
    create: (data: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<SocialLink> =>
      isMockMode.value
        ? Promise.resolve({ ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as SocialLink)
        : apiFetch(endpoint('social-links'), { method: 'POST', body: data }),
    update: (id: string, data: Partial<SocialLink>): Promise<SocialLink> =>
      isMockMode.value
        ? Promise.resolve({ ...mockSocialLinks[0], ...data, id } as SocialLink)
        : apiFetch(endpoint(`social-links/${id}`), { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint(`social-links/${id}`), { method: 'DELETE' }),
  }

  const contacts = {
    list: async (): Promise<{ items: ContactMessage[]; unreadCount: number }> => {
      if (isMockMode.value) {
        const unread = mockContacts.filter(contact => !contact.is_read).length
        return { items: [...mockContacts], unreadCount: unread }
      }
      const res = await apiFetchWithMeta<ContactMessage[]>(endpoint('contacts'))
      const unreadCount = (res.meta?.unread_count as number) ?? 0
      return { items: res.data, unreadCount }
    },
    getById: (id: string): Promise<ContactMessage> =>
      isMockMode.value
        ? Promise.resolve(mockContacts.find(contact => contact.id === id) ?? mockContacts[0])
        : apiFetch(endpoint(`contacts/${id}`)),
    delete: (id: string): Promise<void> =>
      isMockMode.value ? Promise.resolve() : apiFetch(endpoint(`contacts/${id}`), { method: 'DELETE' }),
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
  }
}
