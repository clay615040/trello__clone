<template>
  <div>
    <widget v-if="!modeEditor" :title="`<h4><span class='fw-semi-bold'>${$t('白名單 - 列表')}</span></h4>`" :fetchingData="procSelect" customHeader>
      <div class="mt-4">
        <div class="float-left">
          <b-button type="button" variant="primary" @click="CREATE_DATA()">
            {{$t('新增')}}
          </b-button>
        </div>
        <div class="float-right" v-if="resDataCount && !procSelect">
          <label class="pt-2">{{ $t('資料筆數') }} : {{ resDataCount }}</label>
        </div>
        <v-client-table :columns="colList" :options="optList" :data="resDataInfo">
          <template slot="active" slot-scope="props">
            <div v-if="props.row.active === 'disable'">
              <span class="table_disable">{{ $t(changeStateText(props.row.active)) }}</span>
            </div>
            <span v-else>{{ $t(changeStateText(props.row.active)) }}</span>
          </template>
          <template slot="action" slot-scope="props">
            <b-button type="button" variant="outline-info" class="btn-sm rounded-pill mr-2"
              @click="UPDATE_DATA(props.row)">{{ $t('編輯') }}
            </b-button>
          </template>
        </v-client-table>
      </div>
    </widget>
    <widget v-if="modeEditor" :title="titleModify" customHeader>
      <div class="mt-4">
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtIpAddress">
          <div slot="label">{{ $t('IP 位址') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtIpAddress" v-model="ipAddress" ref="ipAddress"
                        :class="{ 'is-invalid': invalid.ipAddress }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('啟用狀態')" label-for="selActive">
          <b-form-select id="selActive" v-model="active">
            <option value="enable">{{ $t('啟用') }}</option>
            <option value="disable">{{ $t('停用') }}</option>
          </b-form-select>
        </b-form-group>
        <div class="mt-5">
          <b-button type="button" variant="primary" class="mr-2" @click="SUBMIT_MODIFY()">
            {{ $t('儲存') }}
          </b-button>
          <b-button type="button" variant="default" @click="CANCEL_MODIFY()">
            {{ $t('返回') }}
          </b-button>
        </div>
      </div>
    </widget>
    <b-modal v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" 
              body-bg-variant="white" size="xs" centered>
      <div v-if="modeMessage=='notice'" class="text-center">
        <label>{{ $t(message) }}</label>
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
import { mapState, mapActions } from 'vuex'
import Widget from '@/components/Widget/Widget'
import i18n from '../../locales'
import Message from '@/mixins/message'
import { STATE_LIST } from '@/configs/site.js'

export default {
  name: 'WhiteList',

  components: { 
    'widget': Widget,
  },
  
  data() {
    return {
      colList: ['ip_address', 'active', 'action'],
      optList: {
        perPage: 10,
        perPageValues: [10, 20, 50],
        alwaysShowPerPageSelect: true,
        pagination: { show: true },
        texts: { filter: '', count: '', limit: '', page: '' },
        filterable: false,
        columnsClasses: { id: 'width-100' },
        skin: 'table table-striped table-hover',
        sortable: [],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
        },
        headings: {
          'ip_address': () => i18n.t('IP 位址'),
          'active': () => i18n.t('啟用狀態'),
          'action': () => i18n.t('操作'),
        },
      },
      listId: '',        
      ipAddress: '',
      active: 'enable',
      invalid: {
        'ipAddress': false,
      },
      modeEditor: '',
      modeMessage: '',
      message: '',
      showMessage: false,
      completed: false,
      logout: false
    }
  },

  mounted() {      
    this.SELECT_DATA()

    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', this.goBack, false)
    }  
  },

  destroyed() {
    this.RESET_STATE();
  },
  
  computed: {
    ...mapState('whiteList', {
      'procSelect': state => state.process.select,
      'procModify': state => state.process.modify,
      'resDataCount': state => state.response.count,
      'resDataInfo': state => state.response.info,
    }),
    
    titleModify() {
      return (this.modeEditor == 'create') ? `<h4><span class='fw-semi-bold'>${i18n.t('白名單 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('白名單 - 修改')}</span></h4>`
    },

  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('whiteList', {
      'REQUEST_SELECT': 'request_select', 
      'REQUEST_CREATE': 'request_create',
      'REQUEST_UPDATE': 'request_update',
      'RESET_STATE': 'reset_state',
    }),

    async SELECT_DATA() {
      let _err = await this.REQUEST_SELECT()

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }
    },
    
    async CREATE_DATA() {
      history.pushState(null, null, document.URL)

      this.modeEditor = 'create'
      this.ipAddress = ''            
      this.active = 'enable'
    },

    async UPDATE_DATA(data) {
      history.pushState(null, null, document.URL)

      this.modeEditor = 'update'       
      this.listId = data.list_id
      this.ipAddress = data.ip_address
      this.active = data.active        
    },

    async SUBMIT_MODIFY() {
      for(let item in this.invalid) {
        this.invalid[item] = !this.$refs[item].value;
      }
      
      for(let item in this.invalid) { 
        if(this.invalid[item]) {
          let _message = Message[2001]

          this.SHOW_MESSAGE(null, _message)
          return
        }
      }

      let regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
      let match = regex.test(this.ipAddress)

      if(!match) {
        this.invalid['ipAddress'] = true
        this.SHOW_MESSAGE(null, Message[2004])
        return
      }

      let _para, _err

      switch(this.modeEditor) {
        case 'create':
          _para = {              
            'ipAddress': this.ipAddress,
            'active': this.active
          }            
          _err = await this.REQUEST_CREATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }
            
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break

        case 'update':
          _para = {              
            'listId': this.listId,
            'ipAddress': this.ipAddress,
            'active': this.active
          }            
          _err = await this.REQUEST_UPDATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }
          
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break
      }
    },

    CANCEL_MODIFY() {
      history.back()
      this.modeEditor = ''
    },

    SHOW_MESSAGE(err, message) {
      this.message = message
      this.modeMessage = 'notice'
      this.showMessage = true

      if(err == 1002 || err == 1004 || err == 1005 || err == 1012) {
        this.logout = true;
      }
    },

    CLOSE_MESSAGE() {
      if(this.completed) {
        this.modeEditor = ''
        this.completed = false
      }

      if(this.logout) this.USER_LOGOUT()
    },

    changeStateText(item) {
      return STATE_LIST.find(node => node.code === item)?.name ?? item
    },

    goBack(){
      this.modeEditor = ''
    }
  },
  
  watch: {
    modeEditor: {
      handler: function() {
        for(let item in this.invalid) {
          this.invalid[item] = false
        }
      },
    },     
  },

  beforeRouteLeave(to, from, next) {
    window.removeEventListener('popstate', this.goBack, false)
    next()
  },
}
</script>

<style lang="scss">
  .table_disable{
    display: inline-block;
    color: #29323a;
    background-color: #d7dfe6;
    padding: 4px 12px;
    font-weight: 600;
    font-size: 14px;
    line-height: 19px;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .5rem;
  }
</style>