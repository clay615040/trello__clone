<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <b-navbar class="app-header d-print-none" :class="[navbarTypeClass, 'header-' + navbarColorScheme]">
    <b-nav>
      <b-nav-item id="v-step-0">
        <a class="d-md-down-none px-2" href="#" @click="toggleSidebarMethod">
          <i class='la la-bars la-lg' aria-hidden="true"/>
        </a>
        <a class="fs-lg d-lg-none" href="#" @click="switchSidebarMethod">
          <i class="la la-bars la-lg" aria-hidden="true"/>
        </a>
      </b-nav-item>
      <b-nav-item class="d-md-down-none">
        <a href="#" class="px-2" onclick="location.reload()">
          <i class="la la-refresh la-lg" aria-hidden="true"/>
        </a>
      </b-nav-item>
    </b-nav>
    <a  class="navbarBrand d-md-none">
      <i class="fa fa-circle text-primary mr-n-sm" aria-hidden="true"/>
      <i class="fa fa-circle text-danger" aria-hidden="true"/>
      &nbsp;
      Audere Gamer
      &nbsp;
      <i class="fa fa-circle text-danger mr-n-sm" aria-hidden="true"/>
      <i class="fa fa-circle text-primary" aria-hidden="true"/>
    </a>
    <b-nav class="ml-auto">
      <b-nav-item>
        <template>
          <span class="avatar rounded-circle thumb-sm float-left mr-2">
            <img v-if="user.avatar"
                class="rounded-circle"
                :src="user.avatar"
                alt="..."/>
            <span v-else><i class="fa fa-user-circle-o fa-2x" aria-hidden="true"></i></span>
          </span>
          <span class="font-weight-bold">{{ user }}</span>
        </template>
      </b-nav-item>
      <b-nav-item>
        <template>
          <span class="avatar rounded-circle float-left">
            <i class="fa fa-clock-o" aria-hidden="true"></i>
          </span>
          <span class="ml-n2 font-weight-bold">UTC ({{ timeZone }})</span>
        </template>
      </b-nav-item>
      <b-nav-item-dropdown id="v-step-1" class="settingsDropdown d-sm-down-none" no-caret right>
        <template slot="button-content">
          <i class="la la-globe px-2" aria-hidden="true"/>
        </template>
        <div v-for="(lang, index) in listLanguage" :key="index">
          <b-dropdown-item-button @click="changeLanguage(lang.code)">           
            <span v-if="lang.code != language" >{{ lang.name }}</span>
            <span v-else>{{ lang.name }}<i class="fa fa-check ml-3" aria-hidden="true"></i></span>
          </b-dropdown-item-button>
        </div>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown id="v-step-2" class="settingsDropdown d-sm-down-none" no-caret right>
        <template slot="button-content">
          <i class="la la-cog px-2" aria-hidden="true"/>
        </template>
        <b-dropdown-item-button @click="logoutUser">
          <i class="la la-sign-out" aria-hidden="true"/> {{$t('登出')}}
        </b-dropdown-item-button>
      </b-nav-item-dropdown>
    </b-nav>
  </b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import i18n from '@/locales'

export default {
  name: 'Header',

  data() {
    return {
      user: sessionStorage.getItem('user_name'),
      timeZone: sessionStorage.getItem('time_zone'),
      language: '',
    }
  },

  computed: {
    ...mapState('layout', [
      'sidebarClose',
      'sidebarStatic',
      'navbarType',
      'navbarColorScheme'
    ]),
    ...mapState('localeString', {
      'listLanguage': state => state.response.lang
    }),
    navbarTypeClass: function() {
      return "navbar-" + this.navbarType + "-type";
    },
  },  

  methods: {
    ...mapActions('layout', [
      'toggleSidebar',
      'switchSidebar',
      'changeSidebarActive',
    ]),
    ...mapActions('auth', ['logoutUser']),
    ...mapActions('localeString', {
      'REQUEST_LANGUAGE': 'request_language'
    }),
    switchSidebarMethod() {
      if(!this.sidebarClose) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      }
      else {
        this.switchSidebar(false);
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    toggleSidebarMethod() {
      if(this.sidebarStatic) {
        this.toggleSidebar();
        this.changeSidebarActive(null);
      }
      else {
        this.toggleSidebar();
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    changeLanguage(type) {
      sessionStorage.setItem('language', type)
      this.language = type;      
      i18n.locale = type;
    }
  },

  async mounted() {
    await this.REQUEST_LANGUAGE();
    let tempLanguage = sessionStorage.getItem('language') || (navigator.language || navigator.browserLanguage)

    let hasLanguage = this.listLanguage.some(item => {
      return item.code === tempLanguage
    })
    if(hasLanguage) {
      i18n.locale = tempLanguage
      sessionStorage.setItem('language', tempLanguage)
    } else {
      i18n.locale = 'zh-TW'
      sessionStorage.setItem('language', 'zh-TW')
    }
  },
};
</script>

<style src="./Header.scss" lang="scss"></style>
