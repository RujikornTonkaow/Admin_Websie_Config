export interface ApiEnvelope<T = unknown> {
  data?: T
  error?: string
  meta?: Record<string, unknown>
}

export interface UploadResponse {
  url: string
  filename: string
}

export interface ReorderRequest {
  ids: string[]
}

export interface NavItem {
  label: string
  href: string
}
