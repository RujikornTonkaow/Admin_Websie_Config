export type AdminModuleId = 'portfolio' | 'shop' | 'finance'

export interface AdminModule {
  id: AdminModuleId
  labelKey: string
  icon: string
  basePath: string
  apiNamespace: string
  enabled: boolean
}

export const adminModules: AdminModule[] = [
  {
    id: 'portfolio',
    labelKey: 'nav.adminPanel',
    icon: 'mdi:briefcase-account',
    basePath: '/',
    apiNamespace: '/api/v1/admin',
    enabled: true,
  },
  {
    id: 'shop',
    labelKey: 'modules.shop',
    icon: 'mdi:cart',
    basePath: '/shop',
    apiNamespace: '/api/v1/admin/shop',
    enabled: false,
  },
  {
    id: 'finance',
    labelKey: 'modules.finance',
    icon: 'mdi:cash-multiple',
    basePath: '/finance',
    apiNamespace: '/api/v1/admin/finance',
    enabled: false,
  },
]

export const portfolioModule = adminModules.find(module => module.id === 'portfolio')!
