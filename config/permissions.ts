import type { UserRole } from '~/types/auth'

export const roleLevels: Record<UserRole, number> = {
  visitor: 1,
  user_account: 2,
  admin: 3,
}

export const visitorAllowedPaths = ['/', '/contacts', '/login'] as const
export const adminOnlyPaths = ['/users'] as const

export const hasMinimumRole = (currentRole: UserRole, minimumRole: UserRole): boolean => {
  return roleLevels[currentRole] >= roleLevels[minimumRole]
}

export const canAccessAdminOnlyPath = (path: string, isAdmin: boolean): boolean => {
  return !adminOnlyPaths.includes(path as typeof adminOnlyPaths[number]) || isAdmin
}

export const canVisitorAccessPath = (path: string): boolean => {
  return visitorAllowedPaths.includes(path as typeof visitorAllowedPaths[number])
}
