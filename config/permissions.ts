import type { UserRole } from '~/types/auth'

export const roleLevels: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

export const viewerAllowedPaths = ['/', '/contacts', '/login'] as const
export const userManagementPaths = ['/users'] as const
export const superAdminOnlyPaths = ['/sites'] as const

export const hasMinimumRole = (currentRole: UserRole, minimumRole: UserRole): boolean => {
  return roleLevels[currentRole] >= roleLevels[minimumRole]
}

export const canAccessUserManagementPath = (path: string, canManageUsers: boolean): boolean => {
  return !userManagementPaths.includes(path as typeof userManagementPaths[number]) || canManageUsers
}

export const canAccessSuperAdminPath = (path: string, isSuperAdmin: boolean): boolean => {
  return !superAdminOnlyPaths.includes(path as typeof superAdminOnlyPaths[number]) || isSuperAdmin
}

export const canViewerAccessPath = (path: string): boolean => {
  return viewerAllowedPaths.includes(path as typeof viewerAllowedPaths[number])
}
