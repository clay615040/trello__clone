import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from './message'

Vue.use(VueI18n)

const defaultLocale = sessionStorage.getItem('language') || 'zh-tw'
document.documentElement.lang = defaultLocale

const i18n = new VueI18n({
  messages, // set locale messages,
  // 偵測瀏覽器語系
  locale: defaultLocale,
  fallbackLocale: 'zh-tw', // set fallback locale
  silentTranslationWarn: true,
});

export default i18n
