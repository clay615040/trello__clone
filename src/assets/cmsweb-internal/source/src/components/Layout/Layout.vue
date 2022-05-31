<template>
<div :class="[{root: true, sidebarClose, sidebarStatic}, 'sing-dashboard', 'sidebar-' + sidebarColorName, 'sidebar-' + sidebarType]">
  <Sidebar />
  <div class="wrap">
    <Header />
    <v-touch class="content" @swipe="handleSwipe" :swipe-options="{direction: 'horizontal'}">
      <breadcrumb-history :exclude="['chat']"></breadcrumb-history>
      <transition name="router-animation">
        <router-view />
      </transition>
      <footer class="contentFooter">
        Copyright © 2020 - Audere Gamer CMS.
        <div class="version">{{version}}</div>
      </footer>
    </v-touch>
  </div>

</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapActions } = createNamespacedHelpers('layout');

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import BreadcrumbHistory from '@/components/BreadcrumbHistory/BreadcrumbHistory';

export default {
  name: 'Layout',
  components: { Sidebar, Header, BreadcrumbHistory },
  data() {
    return {
        version: ''
    }
  },
  methods: {
    ...mapActions(['switchSidebar', 'handleSwipe', 'changeSidebarActive', 'toggleSidebar', 'toggleHelper', 'applyTourStep']),
    setActiveByRoute() {
      const paths = this.$route.fullPath.split('/')  
      paths.pop() 
      this.changeSidebarActive(paths.join('/'))
    },
    handleWindowResize() {
      const width = window.innerWidth

      if (width <= 768 && this.sidebarStatic) {  //width <= 1200 && this.sidebarStatic
        this.toggleSidebar()
        this.changeSidebarActive(null)
      }

      if (width > 768 && !this.sidebarStatic) {  //width > 1200 && !this.sidebarStatic
        this.toggleSidebar()
        this.setActiveByRoute()
      }
    },
  },

  computed: {
    ...mapState(["sidebarClose", "sidebarStatic", "sidebarColorName", "sidebarType", "helperOpened", "tourInstance"]),
  },

  created() {
    const staticSidebar = JSON.parse(sessionStorage.getItem('sidebarStatic'))

    if (staticSidebar) {
      this.$store.state.layout.sidebarStatic = true
    } 

    this.handleWindowResize()
    window.addEventListener('resize', this.handleWindowResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleWindowResize)
  },
  mounted() {
    this.version = process.env.VUE_APP_VERSION === 'undefined' ? '' : process.env.VUE_APP_VERSION
  }
}
</script>

<style src="./Layout.scss" lang="scss" />
