<template>
  <div class="auth-page">
    <b-container>
      <h5 class="auth-logo">
        <i class="fa fa-circle text-primary" aria-hidden="true"></i>
        AUDERE GAMER
        <i class="fa fa-circle text-danger" aria-hidden="true"></i>
      </h5>
      <Widget class="widget-auth mx-auto" :title="`<h3 class=mt-0>${$t('登入 CMS 系統')}</h3>`" customHeader>
          
        <form class="mt-5" @submit.prevent="login">
          <b-alert class="alert-sm" variant="danger" :show="!!errorMessage">
            {{ $t(errorMessage) }}
          </b-alert>
          <div class="form-group">
            <input class="form-control no-border" ref="username" required type="text" name="username" :placeholder="$t('帳號')" />
          </div>
          <div class="form-group">
            <input class="form-control no-border" ref="password" required type="password" name="password" :placeholder="$t('密碼')" />
          </div>
          <b-button type="submit" size="sm" class="auth-btn mb-3" variant="info" :disabled="isFetching">
            {{isFetching ? $t('登入中') : $t('登入')}}
          </b-button>
          
        </form>
      
      </Widget>
    </b-container>
    <footer class="auth-footer">
      2020 &copy; Audere Gamer Co., Ltd.
      <div class="version">{{version}}</div>
    </footer>
  </div>
</template>

<script>
  import {mapState, mapActions} from 'vuex';
  import Widget from '@/components/Widget/Widget';
  import config from '../../config';

  export default {
    name: 'Login',
    components: { Widget },
    data() {
      return {
        version: ''
      }
    },
    computed: {
      ...mapState('auth', {
        isFetching: state => state.isFetching,
        errorMessage: state => state.errorMessage,
      }),
    },
    methods: {
      ...mapActions('auth', ['loginUser', 'receiveToken', 'receiveLogin']),
      login() {
        const username = this.$refs.username.value;
        const password = this.$refs.password.value;

        let _para = {
          'account': username,
          'password': password
        }

        if (username.length !== 0 && password.length !== 0) {
          this.loginUser(_para);
        }
      },
    },
    created() {
      const token = sessionStorage.getItem('token')
      if(token) this.receiveLogin()
    },
    mounted() {
      const creds = config.auth;
      this.$refs.username.value = creds.username;
      this.$refs.password.value = creds.password;

      this.version = process.env.VUE_APP_VERSION === 'undefined' ? '' : process.env.VUE_APP_VERSION
    }
  };
</script>

<style lang="scss">
  .auth-footer {
    .version {
      font-size: 10px;
    }
  }
</style>
