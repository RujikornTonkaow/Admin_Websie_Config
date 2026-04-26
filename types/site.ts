export type SiteMemberRole = 'owner' | 'editor' | 'viewer'
export type SiteType = 'portfolio' | 'shop' | 'finance'

export interface ManagedSite {
  id: string
  name: string
  slug: string
  type: SiteType
  domains: string[]
  member_role?: SiteMemberRole
  created_at: string
  updated_at: string
}

export interface CreateSiteRequest {
  name: string
  slug: string
  type: SiteType
  domains: string[]
}

export interface UpdateSiteRequest {
  name: string
  slug: string
  domains: string[]
}

export interface UserMembership {
  id: string
  site_id: string
  user_id: string
}

export interface UserMembershipAssignment {
  site_id: string
}

export interface UpdateUserMembershipsRequest {
  memberships: UserMembershipAssignment[]
}
