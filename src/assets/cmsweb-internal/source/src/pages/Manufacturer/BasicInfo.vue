<template>
  <div>
    <b-row>
      <b-col xs='12' lg='12'>
        <widget :title="`<h5>${$t('遊戲商')}</h5>`" customHeader :fetchingData="procSelect">
          <div class="mt-4"></div>
          
          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtVendorName">
            <div slot="label">{{ $t('遊戲商名稱') }}<span class="warn-text">*</span></div>
            <b-form-input id="txtVendorName" type="text" ref="vendorName"
                          v-model="vendorName"
                          :class="{ 'is-invalid': invalid.operatorName }"/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtVendorCode">
            <div slot="label">{{ $t('遊戲商代碼') }}</div>
            <b-form-input id="txtVendorCode" type="text" ref="vendorCode"
                          v-model="vendorCode" readonly
                          :class="{ 'is-invalid': invalid.operatorName }"/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="selTimeZone">
            <div slot="label">{{ $t('時區') }}</div>
            <select id="selTimeZone" class="form-control" v-model="timeZone">
              <option v-for="(value, key) in listTimeZone" :key="key" :value="value.code" :selected="timeZone">
                  {{ value.desc }}
              </option>
            </select>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtAccount">
            <div slot="label">{{ $t('商戶號') }}</div>
            <b-form-input id="txtAccount" type="text" ref="account" 
                          v-model="account" readonly/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtPassword">
            <div slot="label">{{ $t('密碼') }}<span class="warn-text">*</span></div>
            <b-form-input id="txtPassword" type="password" ref="password" v-model="password" 
                          :placeholder="$t('請輸入至少6個字元，且至少包含一個大寫字母、一個小寫字母、一個數字及一個特殊符號。')"
                          :class="{ 'is-invalid': invalid.password }"/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtPasswordCfm">
            <div slot="label">{{ $t('確認密碼') }}<span class="warn-text">*</span></div>
            <b-form-input id="txtPasswordCfm" type="password" ref="passwordCfm" v-model="passwordCfm" 
                          :placeholder="$t('請再輸入一次密碼 !')"
                          :class="{ 'is-invalid': invalid.passwordCfm }"/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtHashKey">
            <div slot="label">{{ $t('加密金鑰') }}</div>
            <b-form-input id="txtHashKey" type="text" ref="hashKey" 
                          :value="hashKey" readonly/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtActive">
            <div slot="label">{{ $t('啟用狀態') }}</div>
            <b-form-input id="txtActive" type="text" ref="active" 
                          :value="$t(changeStateText(active))" readonly/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtRecordInterval">
            <div slot="label">{{ $t('帳務同步時間(分鐘)') }}</div>
            <b-form-input id="txtRecordInterval" type="text" ref="recordInterval" 
                          :value="recordInterval" readonly/>
          </b-form-group>

          <b-form-group horizontal :label-cols="2" label-breakpoint="md" label-for="txtCreateDate" class="mb-4">
            <div slot="label">{{ $t('創建日期') }}</div>
            <b-form-input id="txtCreateDate" type="text" ref="createDate" 
                          :value="createDate" readonly/>
          </b-form-group>
          
          <b-button type="button" variant="primary" class="mr-2" @click="UPDATE_INFO()">
            {{ $t('儲存') }}
          </b-button>
          <div class="mb-2"></div>
          
        </widget>
      </b-col>
    </b-row>

    <b-modal v-model="showMessage" :title="$t('訊息')"
              body-bg-variant="white" size="xs" centered>

      <div v-if="modeMessage=='notice'" class="text-center">
        <label>{{ $t(message) }}</label>
      </div>
      <div v-if="modeMessage=='confirm'" class="text-center">
        <label>{{ $t(message) }} [ {{ account }} ]</label>
      </div>
      
      <template v-slot:modal-footer>
        <div v-if="modeMessage=='notice'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage=false">{{ $t('確認') }}</b-button>
        </div>
        <div v-if="modeMessage=='confirm'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="SUBMIT_DELETE()">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="showMessage=false">{{ $t('取消') }}</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import MD5 from 'js-md5'
import Widget from '@/components/Widget/Widget'
import Message from '@/mixins/message'
import i18n from '@/locales'

export default {
  name: 'BasicInfo',
  components: { 
      'widget': Widget, 
  },

  data() {
    return {

      account: '',
      password: '',
      passwordCfm: '',
      passwordOld: '',
      vendorCode: '',
      vendorName: '',
      timeZone: '',
      hashKey: '',
      recordInterval: '',
      active: '',
      createDate: '',

      invalid: {
        'password': false,
        'passwordCfm': false,
      },

      modeMessage: '',
      message: '',
      showMessage: false,
      completed: false,
      logout: false
    };
  },

  mounted() {
    this.REQUEST_TIMEZONE();
    this.SELECT_INFO();
  },

  computed: {
    ...mapState('basicInfo', {
      'procSelect': state => state.process.select,
      'procUpdate': state => state.process.update,
      'resSelect': state => state.response.select,
      'resUpdate': state => state.response.update,
      'listTimeZone': state => state.timezone,
    }),
  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('basicInfo', {
      'REQUEST_SELECT': 'request_select', 
      'REQUEST_UPDATE': 'request_update',
      'REQUEST_TIMEZONE': 'request_timezone',
    }),

    async SELECT_INFO() {
      let _err = await this.REQUEST_SELECT()
        
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      let _info = this.resSelect
      this.account = _info.account
      this.password = _info.password
      this.passwordCfm = _info.password
      this.passwordOld = _info.password
      this.vendorName = _info.vendor_name
      this.vendorCode = _info.vendor_code
      this.timeZone = _info.time_zone
      this.hashKey = _info.hash_key
      this.recordInterval = _info.record_interval
      this.active = (_info.active) ? 'enable' : 'disable'
      this.createDate = _info.create_date
    },   

    async UPDATE_INFO() {
      for(let item in this.invalid) {
          this.invalid[item] = !this.$refs[item].value
      }
      
      for(let item in this.invalid) { 
        if(this.invalid[item]) {
          let _message

          if(item == 'passwordCfm') _message = 'password_again'
          else _message = Message[2001]

          this.SHOW_MESSAGE(null, _message)
          return
        }
      }

      let _password

      if(this.password != this.passwordOld) {
        let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])(?=.{6,})/
        let match = regex.test(this.password)

        if(!match) {
          this.SHOW_MESSAGE(null, Message[2003])
          return
        }

        if(this.password != this.passwordCfm) {
          this.invalid['password'] = true
          this.invalid['passwordCfm'] = true
          this.SHOW_MESSAGE(null, Message[2002])
          return
        }

        _password = MD5(this.password + '698856a')
      }
      else {
        _password = this.passwordOld
      }

      let _para = {
        'vendorName': this.vendorName,
        'password': _password,
        'timeZone': this.timeZone,
      }

      let _err = await this.REQUEST_UPDATE(_para)
        
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      this.SHOW_MESSAGE(null, Message[1000])
      this.completed = true
    },

    SHOW_MESSAGE(err, message) {
      this.message = message
      this.modeMessage = 'notice'
      this.showMessage = true
    },

    changeStateText(state) {
      return state === 'enable' ? i18n.t('啟用') : i18n.t('停用')
    }
  },
}
</script>

