import type { UserRole } from './auth'

export * from './auth'
export * from './portfolio'
export * from './shared'

export interface SidebarLink {
  label: string
  to: string
  icon: string
  minRole?: UserRole
}
