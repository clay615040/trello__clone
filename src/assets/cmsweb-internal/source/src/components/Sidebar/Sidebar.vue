<template>
  <div class="sidebar-wrapper">
    <nav :class="{sidebar: true, sidebarStatic, sidebarOpened}"
        @mouseenter="sidebarMouseEnter"
        @mouseleave="sidebarMouseLeave">
      <header class="logo">
        <router-link to="/dashboard/analytics">
          <span class="primary-word">Audere Gamer</span>
        </router-link>
      </header>
      <ul class="nav">
        <NavLink v-for="menu in sideBarMenu" :key="menu.key"
          :activeItem="activeItem"
          :header="menu.name"
          :link="menu.link"
          :iconName="menu.icon"
          :index="menu.name"
          :childrenLinks="menu.child"
          :isHeader="true">
        </NavLink>
      </ul>
    </nav>
  </div>

  
  
</template>

<script>
import { mapState, mapActions } from 'vuex'
import NavLink from './NavLink/NavLink'

export default {
  name: 'Sidebar',
  components: { NavLink },

  methods: {
    ...mapActions('layout', ['changeSidebarActive', 'switchSidebar', 'toggleSidebar', 'getPermission']),
    setActiveByRoute() {
      const paths = this.$route.fullPath.split('/')
      paths.pop()
      this.changeSidebarActive(paths.join('/'))
    },
    sidebarMouseEnter() {
      if (!this.sidebarStatic) {
        this.switchSidebar(false)
        this.setActiveByRoute()
      }
    },
    sidebarMouseLeave() {
      if (!this.sidebarStatic) {
        this.switchSidebar(true)
        this.changeSidebarActive(null)
      }
    }
  },
  created() {
    this.getPermission()
    this.setActiveByRoute()
  },
  computed: {
    ...mapState('layout', {
      sidebarStatic: state => state.sidebarStatic,
      sidebarOpened: state => state.sidebarClose,
      activeItem: state => state.sidebarActiveElement,        
      sideBarMenu: state => state.sideBarMenu      
    })    
  },  
}
</script>

<style src="./Sidebar.scss" lang="scss" scoped/>
