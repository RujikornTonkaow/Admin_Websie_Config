const SELECTED_SITE_ID_KEY = 'admin_selected_site_id'

const normalizePath = (path: string): string => path.startsWith('/') ? path : `/${path}`

export const useSiteContext = () => {
  const selectedSiteId = useState<string | null>('selected_site_id', () => {
    if (import.meta.client) {
      return localStorage.getItem(SELECTED_SITE_ID_KEY)
    }
    return null
  })

  const setSelectedSiteId = (siteId: string | null) => {
    selectedSiteId.value = siteId

    if (!import.meta.client) return

    if (siteId) {
      localStorage.setItem(SELECTED_SITE_ID_KEY, siteId)
      return
    }

    localStorage.removeItem(SELECTED_SITE_ID_KEY)
  }

  const clearSelectedSite = () => {
    setSelectedSiteId(null)
  }

  const getSiteScopedAdminPath = (domainSegment: string, path: string): string => {
    const normalizedPath = normalizePath(path)

    if (!selectedSiteId.value) {
      throw new Error('No site selected')
    }

    return `/api/v1/admin/sites/${encodeURIComponent(selectedSiteId.value)}/${domainSegment}${normalizedPath}`
  }

  const getPortfolioAdminPath = (path: string): string => {
    return getSiteScopedAdminPath('portfolio', path)
  }

  return {
    selectedSiteId,
    setSelectedSiteId,
    clearSelectedSite,
    getSiteScopedAdminPath,
    getPortfolioAdminPath,
  }
}
