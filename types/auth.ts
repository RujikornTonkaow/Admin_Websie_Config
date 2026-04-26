export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

export interface AdminUser {
  id: string
  username: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
}

export interface UpdateUserRequest {
  username: string
  role: UserRole
}

export interface ChangePasswordRequest {
  new_password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: LoginUser
}

export interface LoginUser {
  id: string
  username: string
  role: UserRole
}
