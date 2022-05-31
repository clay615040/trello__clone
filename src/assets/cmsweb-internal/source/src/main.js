// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueTouch from 'vue-touch'
import Trend from 'vuetrend'
import { ClientTable, ServerTable } from 'vue-tables-2'
import VueTextareaAutosize from 'vue-textarea-autosize'
import mavonEditor from 'mavon-editor'
import { VueMaskDirective } from 'v-mask'
import VeeValidate from 'vee-validate'
import VueFormWizard from 'vue-form-wizard'
import axios from 'axios'
import Toasted from 'vue-toasted'
import VCalendar from 'v-calendar'
import VueApexCharts from 'vue-apexcharts'
import HighchartsVue from "highcharts-vue"
import bFormSlider from 'vue-bootstrap-slider'

import store from './store'
import router from './router'
import App from './App'
import layoutMixin from './mixins/layout'

import config from './config'
import Widget from './components/Widget/Widget'

import i18n from './locales'

axios.defaults.baseURL = config.baseURLApi
axios.defaults.headers.common['Content-Type'] = "application/json"
axios.defaults.timeout = 680 * 1000

const token = sessionStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = "Bearer " + token
}

Vue.use(BootstrapVue)
Vue.use(VCalendar, {
  firstDayOfWeek: 2
})
Vue.use(VueTouch)
Vue.use(Trend)
Vue.component('Widget', Widget)
Vue.use(bFormSlider)
Vue.use(ClientTable, { theme: 'bootstrap4' })
Vue.use(ServerTable, { theme: 'bootstrap4' })
Vue.use(VueTextareaAutosize)
Vue.use(mavonEditor)
Vue.component('apexchart', VueApexCharts)
Vue.use(HighchartsVue)
Vue.directive('mask', VueMaskDirective)
Vue.use(VeeValidate, { fieldsBagName: 'fieldsbag' })
Vue.use(VueFormWizard)
Vue.mixin(layoutMixin)
Vue.use(Toasted, {duration: 10000})

Vue.config.debug = false
Vue.config.devtools = process.env.NODE_ENV === 'STAGE' ? true : false
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  watch: {
    '$i18n.locale' (lang) {
      document.documentElement.lang = lang
    },
  },
  i18n,
  el: '#app',
  store,
  router,
  render: h => h(App),
}).$mount(App)
