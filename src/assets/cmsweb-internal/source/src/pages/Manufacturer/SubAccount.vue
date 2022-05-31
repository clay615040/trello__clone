<template>
  <div class="subAccount">
    <widget v-if="!modeModify" :title="`<h4><span class='fw-semi-bold'>${$t('子帳號 - 列表')}</span></h4>`" :fetchingData="procAccountSel" customHeader>
      <div class="mt-4">
        <div class="float-left topGroup">
          <b-button type="button" variant="primary" @click="CREATE_ACCOUNT()">
            {{$t('新增')}}
          </b-button>
          <div class="searchGroup">
            <img src="./image/icon-search.svg" class="searchIcon" alt="searchIcon">
            <input type="text" class="searchInput" v-model="searchText">
          </div>
        </div>
        <div class="float-right" v-if="searchTableData && !procAccountSel">
          <label class="pt-2">{{ $t('資料筆數') }} : {{searchTableData.length}}</label>
        </div>
        
        <v-client-table ref="table" :columns="colAccount" :options="optAccount" :data="searchTableData">
            <template slot="active" slot-scope="props">
              <div v-if="props.row.active === 'disable'">
                <span class="table_disable">{{ $t(changeStateText(props.row.active)) }}</span>
              </div>
              <span v-else>{{ $t(changeStateText(props.row.active)) }}</span>
            </template>
            <template slot="action" slot-scope="props">
              <b-button type="button" variant="outline-info" class="btn-sm rounded-pill mr-2"
                @click="UPDATE_ACCOUNT(props.row)">{{$t('編輯')}}
              </b-button>
              <b-button type="button" variant="outline-danger" class="btn-sm rounded-pill"
                @click="DELETE_ACCOUNT(props.row)">{{$t('删除')}}
              </b-button>
            </template>
        </v-client-table>
      </div>
    </widget>

    <widget v-if="modeModify" :title="titleModify" customHeader :fetchingData="procRole || procMenu || procPermit">
      <div class="mt-4">
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtAccount">
          <div slot="label">{{ $t('帳號') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtAccount" v-model="account" ref="account" 
                        :disabled="modeModify=='update'" 
                        :class="{ 'is-invalid': invalid.account }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtPassword">
          <div slot="label">{{ $t('密碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtPassword" :type="inputType.password" v-model="password" ref="password" 
                        :placeholder="$t('請輸入至少6個字元，且至少包含一個大寫字母、一個小寫字母、一個數字及一個特殊符號。')"
                        @keydown="SET_INPUT_TYPE()"
                        :class="{ 'is-invalid': invalid.password }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtPasswordCfm">
          <div slot="label">{{ $t('確認密碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtPasswordCfm" :type="inputType.password" v-model="passwordCfm" ref="passwordCfm"
                        :placeholder="$t('請再輸入一次密碼 !')"
                        @keydown="SET_INPUT_TYPE()"
                        :class="{ 'is-invalid': invalid.passwordCfm }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('使用者名稱')" label-for="txtUsername">
          <b-form-input id="txtUsername" v-model="userName"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('角色')" label-for="selRole">
          <b-form-select id="selRole" v-model="roleId">
            <option v-for="(item, key) in optRole" :key="key" :value="item.role_id" :selected="roleId">
              {{ item.role_name }}
            </option>
          </b-form-select>
        </b-form-group>
        <div v-if="roleId=='0'">
          <b-form-group label-cols="4" label-cols-lg="2" :label="$t('權限')" label-for="selPermit">
            <div>
              <tree-select id="selPermit" v-model="permit" :multiple="true" :options="optPermit" 
                          value-format="object" value-consists-of="LEAF_PRIORITY" placeholder="0 options selected"
                          :limit="0" :limitText="(count) =>` ${count} options selected`">
              </tree-select>
            </div>
          </b-form-group>
        </div>
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
import { mapState, mapActions } from 'vuex'
import Treeselect from '@riophae/vue-treeselect'
import MD5 from 'js-md5'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Message from '@/mixins/message'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { STATE_LIST, MENU_LIST } from '@/configs/site.js'

export default {
  name: 'SubAccount',
  
  components: { 
    'widget': Widget,
    'tree-select': Treeselect
  },
  
  data() {
    return {
      colAccount: ['user_name', 'role_name', 'account', 'active', 'action'],
      optAccount: {
        perPage: '10',
        perPageValues: ['10', '20', '50'],
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
          'user_name': () => i18n.t('使用者名稱'),
          'role_name': () => i18n.t('角色'),
          'account': () => i18n.t('帳號'),
          'active': () => i18n.t('啟用狀態'),
          'action': () => i18n.t('操作'),
        },
      },
      pageNo: 1,
      pageSize: 50,
      userId: 0,
      account: '',
      password: '',
      passwordCfm: '',
      passwordOld: '',
      userName: '',
      roleId: '',
      permit: [],
      active: 'enable',
      invalid: {
        'account': false,
        'password': false,
        'passwordCfm': false,
      },
      inputType: {
        'password': 'text'
      },
      modeModify: '',
      modeMessage: '',
      message: '',
      showMessage: false,
      completed: false,
      logout: false,
      tempPerPage: '10',
      tablePage: 1,
      searchText: '',
    }
  },
  mounted() {
    this.SELECT_ACCOUNT()

    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', this.goBack, false)
    }  
  },
  destroyed() {
    this.RESET_STATE();
  },
  
  computed: {
    ...mapState('subAccount', {
      'procAccountSel': state => state.process.select,
      'procAccountMod': state => state.process.modify,
      'procAccountDel': state => state.process.delete,
      'resAccountList': state => state.response.list,
      'resAccountUserId': state => state.response.userId,
    }),
    ...mapState('role', {
      'procRole': state => state.process.select, 
      'listRole': state => state.response.list, 
    }),
    ...mapState('menu', {
      'procMenu': state => state.process.select,
      'listMenu': state => state.response.list,
    }),
    ...mapState('permission', {
      'procPermit': state => state.process.select,
      'listPermit': state => state.response.list,
    }),

    titleModify() {
      return (this.modeModify == 'create') ? `<h4><span class='fw-semi-bold'>${i18n.t('子帳號 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('子帳號 - 修改')}</span></h4>`
    },

    searchTableData() {
      let temp = this.searchText.toLowerCase()
      this.$nextTick(() => {
        this.$refs.table.setPage(1)
      })
      if(this.searchText !== '') {
        return this.resAccountList.filter(node => 
          node.user_name?.toLowerCase().includes(temp) ||
          node.role_name?.toLowerCase().includes(temp) || 
          node.account?.toLowerCase().includes(temp) || 
          node.active?.toString()?.toLowerCase().includes(temp)
        )
      }
      else return this.resAccountList
    },

    optRole() {
      let option = JSON.parse(JSON.stringify(this.listRole));   //deep copy
      let sortOption = [];

      sortOption.push({
        'role_id': 0,
        'role_name': 'N/A',
      })

      option.map(item => {
        sortOption.push(item);
      })

      return sortOption;
    },

    optPermit() {
      let option = JSON.parse(JSON.stringify(this.listMenu))   //deep copy

      option.forEach(_main => {
        _main.label = i18n.t(this.changeText(_main.menu))

        _main.children.forEach(_sub1 => {
          _sub1.label = i18n.t(this.changeText(_sub1.menu))

          if(_sub1.children) {
            _sub1.children.forEach(_sub2 => {
              _sub2.label = i18n.t(this.changeText(_sub2.menu))
            })
          }
        })
      })
      
      return option
    },

  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('subAccount', {
      'REQUEST_ACCOUNT_SEL': 'request_select', 
      'REQUEST_ACCOUNT_ADD': 'request_create',
      'REQUEST_ACCOUNT_UPD': 'request_update',
      'REQUEST_ACCOUNT_DEL': 'request_delete',
      'RESET_STATE': 'reset_state',
    }),
    ...mapActions('role', {
      'REQUEST_ROLE_SEL': 'request_select'
    }),
    ...mapActions('menu', {
      'REQUEST_MENU': 'request_select'
    }),
    ...mapActions('permission', {
      'REQUEST_PERMIT_SEL': 'request_select',
      'REQUEST_PERMIT_UPD': 'request_update'
    }),
    
    async SELECT_ACCOUNT() {
      let _err = await this.REQUEST_ACCOUNT_SEL()

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }
    },
    
    async CREATE_ACCOUNT() {
      history.pushState(null, null, document.URL)

      this.tablePage = this.$refs.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs.table?.$children?.[0]?.limit
      
      this.modeModify = 'create'
      this.userId = 0
      this.account = ''
      this.password = ''
      this.passwordCfm = ''
      this.userName = ''
      this.roleId = 0
      this.permit = []
      this.inputType.password = 'text'
      let _para, _err

      _para = {
        'roleId': 0
      }

      _err = await this.REQUEST_ROLE_SEL(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      _err = await this.REQUEST_MENU()

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }
    },

    async UPDATE_ACCOUNT(data) {
      history.pushState(null, null, document.URL)

      this.tablePage = this.$refs.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs.table?.$children?.[0]?.limit

      this.modeModify = 'update'
      this.userId = data.user_id
      this.account = data.account
      this.password = data.password
      this.passwordCfm = data.password
      this.passwordOld = data.password
      this.userName = data.user_name
      this.roleId = data.role_id
      this.active = data.active
      this.inputType.password = 'password'
      let _para, _err

      _para = {
        'roleId': 0
      }

      _err = await this.REQUEST_ROLE_SEL(_para)
      
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      _err = await this.REQUEST_MENU()
      
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }
        
      _para = {          
        'userId': this.userId,
        'roleId': this.roleId,
        'isMain': 0,
      }
      
      _err = await this.REQUEST_PERMIT_SEL(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      if(this.roleId > 0) this.permit = []
      else this.permit = this.listPermit
    },

    async DELETE_ACCOUNT(data) {
      this.userId = data.user_id
      this.account = data.account
      this.message = '刪除帳號?'
      this.modeMessage = 'confirm'
      this.showMessage = true
    },

    async SUBMIT_MODIFY() {
      for(let item in this.invalid) {
        this.invalid[item] = !this.$refs[item].value

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

        if(!regex.test(this.password)) {
          this.invalid['password'] = true
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

      if(this.roleId != 0) this.permit = []    //當有指定角色時, 清空個人權限

      let _para

      switch(this.modeModify) {
        case 'create':
          await this.addAccount(_password)

          _para = {              
            'userId': this.resAccountUserId,
            'roleId': this.roleId,
            'menuId': this.permit,
            'isMain': 0
          }

          await this.requestPermitUpd(_para)
            
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break

        case 'update':
          await this.requestAccountUpd(_password)      

          _para = {              
            'userId': this.userId,
            'roleId': this.roleId,
            'menuId': this.permit,
            'isMain': 0
          }
          await this.requestPermitUpd(_para)
          
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break
      }
    },

    async addAccount(password) {
      let _para = {
        'account': this.account,
        'password': password,
        'userName': this.userName,
        'roleId': this.roleId,
        'active': (this.active == 'enable') ? '1' : '0'
      }            
      let _err = await this.REQUEST_ACCOUNT_ADD(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }
    },

    async requestPermitUpd(para) {
      let _err = await this.REQUEST_PERMIT_UPD(para)
      
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }
    },

    async requestAccountUpd(password) {
      let _para = {
        'userId': this.userId,
        'password': password,
        'userName': this.userName,
        'roleId': this.roleId,
        'active': (this.active == 'enable') ? '1' : '0'
      }            
      let _err = await this.REQUEST_ACCOUNT_UPD(_para)       

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }  
    },

    async SUBMIT_DELETE() {
      let _para, _err

      _para = {
        'userId': this.userId
      }
      _err = await this.REQUEST_ACCOUNT_DEL(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }
      
      _para = {          
        'userId': this.userId,
        'roleId': 0,
        'menuId': [],
        'isMain': 0,
      }        
      _err = await this.REQUEST_PERMIT_UPD(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      this.SHOW_MESSAGE(null, Message[1000])
      this.completed = true
    },

    CANCEL_MODIFY() {
      history.back()
      this.modeModify = ''

      this.$nextTick(function () {
        this.$refs.table.setLimit(this.tempPerPage)
        this.$refs.table.setPage(this.tablePage)
      })
    },

    SET_INPUT_TYPE() {
      this.inputType.password = 'password'
    },

    SHOW_MESSAGE(err, message) {
      this.message = message
      this.modeMessage = 'notice'
      this.showMessage = true

      if(err == 1002 || err == 1004 || err == 1005 || err == 1012) {
        this.logout = true
      }
    },

    CLOSE_MESSAGE() {
      if(this.completed) {
        this.modeModify = ''
        this.completed = false
        this.$nextTick(() => {
          this.$refs.table.setLimit(this.tempPerPage)
          this.$refs.table.setPage(this.tablePage)
        })
      }

      if(this.logout) this.USER_LOGOUT()
    },

    changeText(item) {
      return MENU_LIST.find(node => node.routerName === item)?.name ?? item
    },

    changeStateText(item) {
      return STATE_LIST.find(node => node.code === item)?.name ?? item
    },

    goBack(){
      this.modeModify = ''

      this.$nextTick(function () {
        this.$refs.table.setLimit(this.tempPerPage)
        this.$refs.table.setPage(this.tablePage)
      })
    }
  },
  
  watch: {
    modeModify: {
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

  .subAccount .topGroup {
    display: flex;
    align-items: center;
  }

  .subAccount .searchGroup {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 8px;
    padding: 0 6px;
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
  }

  .searchIcon {
    font-size: 20px;
    margin-right: 6px;
  }

  .subAccount .searchInput {
    height: 31.5px;
    border: 0;
    font-size: 14px;

    &:focus {
      border: 0;
      outline: none;
    }
  }

</style>