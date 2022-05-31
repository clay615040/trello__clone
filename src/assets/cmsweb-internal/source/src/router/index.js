import Vue from 'vue'
import Router from 'vue-router'
import { routes } from './map'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes,
})

const checker = {
  isAuthenticated: () => {
    const _token = sessionStorage.getItem('token')
    const _permit = JSON.parse(sessionStorage.getItem('permit'))

    return (_token && _permit) ? true : false
  },

  isOpen: (page) => {
    let permit = JSON.parse(sessionStorage.getItem('permit'))
    let menu = []

    if(page.name === 'betRecord') return true

    for(let level1 in permit) {
      for(let level2 of permit[level1]?.child) {
        menu.push(level2.name)
        level2.child?.forEach(level3 => {
          menu.push(level3.name)
        })
      }
    }
    return menu.includes(page.name)
  }
}

router.beforeEach(async (to, from, next) => {
  if(!checker.isAuthenticated(to) && to.name !== 'Login') next({ name: 'Login' })
  if(!checker.isOpen(to) && to.name !== 'Login') next({ name: 'Login' })
  
  next()
})

export default router

