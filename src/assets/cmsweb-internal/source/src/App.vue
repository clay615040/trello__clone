<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  
  import { mapActions } from 'vuex';

  export default {
    name: 'App',
    created: function() {
      window.addEventListener('mouseover',this.MOUSE_ON);
    },
    destroyed: function() {
      window.removeEventListener('mouseover', this.MOUSE_ON);
    },
    methods: {
      ...mapActions('auth', {
        'USER_LOGOUT': 'logoutUser'
      }),

      MOUSE_ON() {
        if(this.$router.currentRoute.path.includes('worldMatch')) return;

        const _iat = sessionStorage.getItem('exec_time');
        const _now = new Date().getTime();

        if(!_iat) {
          this.USER_LOGOUT();
          return;
        }

        if(_now - _iat > 30 * 60 * 1000) this.USER_LOGOUT();
        else sessionStorage.setItem('exec_time', new Date().getTime());
      },
    }
  }

</script>

<style src="./styles/theme.scss" lang="scss"></style>
<style src="./styles/table.scss" lang="scss"></style>

<style>
  .VueTables__table.table tr th {
    font-size: x-small !important;
    color: white !important;
  }

  .VueTables__dropdown-pagination select {
    margin-left: 10px;
  }

  .VueTables__child-row-toggler {
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    margin: auto;
    text-align: center;
    font-weight: bold;
    font-size: large;
    cursor: pointer;
  }

  .VueTables__child-row-toggler--closed::before {
    content: "+";
  }

  .VueTables__child-row-toggler--open::before {    
    content: "-";
  }

  .pagination > li.active > a,
  .pagination > li > a:hover {
    background-color: #005792 !important;
    color: white !important;
    border-radius: 6px !important;
  }

  .VuePagination ul li.active a {
    background-color: #005792 !important;
    color: white !important;
    border-radius: 6px !important;
  }

  .warn-text {
    margin-left: 5px;
    color: red;
    font-weight: bold;
  }

  .warn-bg {
    background-color: #FFD2D2 !important;
  }

  .normal-bg {
    background-color: initial;
  }

  .long-text {
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>