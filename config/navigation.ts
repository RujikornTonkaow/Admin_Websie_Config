import type { SidebarLink } from '~/types/admin'

export interface NavigationLinkConfig extends Omit<SidebarLink, 'label'> {
  labelKey: string
  moduleId: 'portfolio' | 'core'
}

export const navigationLinks: NavigationLinkConfig[] = [
  { labelKey: 'nav.dashboard', to: '/', icon: 'mdi:view-dashboard', moduleId: 'core' },
  { labelKey: 'nav.siteSettings', to: '/site-settings', icon: 'mdi:cog', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.hero', to: '/hero', icon: 'mdi:star-circle', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.about', to: '/about', icon: 'mdi:account-details', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.skills', to: '/skills', icon: 'mdi:code-braces', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.projects', to: '/projects', icon: 'mdi:folder-multiple', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.experience', to: '/experiences', icon: 'mdi:briefcase', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.socialLinks', to: '/social-links', icon: 'mdi:link-variant', minRole: 'user_account', moduleId: 'portfolio' },
  { labelKey: 'nav.messages', to: '/contacts', icon: 'mdi:email', moduleId: 'portfolio' },
  { labelKey: 'nav.users', to: '/users', icon: 'mdi:account-group', minRole: 'admin', moduleId: 'core' },
]
