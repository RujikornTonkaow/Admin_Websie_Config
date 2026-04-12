import en from './locales/en.json'
import th from './locales/th.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    th,
  },
}))
