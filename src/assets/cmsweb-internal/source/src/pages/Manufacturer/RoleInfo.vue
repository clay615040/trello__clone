<template>
  <div>
    <widget v-if="!modeModify" :title="`<h4 class='fw-semi-bold'>${$t('角色 - 列表')}</h4>`" :fetchingData="procRoleSel" customHeader>
      <div class="mt-4">
        <div class="float-left">
          <b-button type="button" variant="primary" @click="CREATE_ROLE()">
            {{$t('新增')}}
          </b-button>
        </div>
        <div class="float-right" v-if="resRoleCount && !procRoleSel">
          <label class="pt-2">{{ $t('資料筆數') }} : {{ resRoleCount }}</label>
        </div>
        <v-client-table :columns="colRole" :options="optRole" :data="resRoleList">
            <template slot="active" slot-scope="props">
              <div v-if="props.row.active === 'disable'">
                <span class="table_disable">{{ $t(changeStateText(props.row.active)) }}</span>
              </div>
              <span v-else>{{ $t(changeStateText(props.row.active)) }}</span>
            </template>
            <template slot="action" slot-scope="props">
              <b-button type="button" variant="outline-info" class="btn-sm rounded-pill mr-2"
                @click="UPDATE_ROLE(props.row)">{{$t('編輯')}}
              </b-button>
              <b-button type="button" variant="outline-danger" class="btn-sm rounded-pill"
                @click="DELETE_ROLE(props.row)">{{$t('删除')}}
              </b-button>
            </template>
        </v-client-table>
        <div v-if="resRoleCount && !procRoleSel">
          <div class="float-right mt-2">
          </div>
        </div>
      </div>
    </widget>
    <widget v-if="modeModify" :title="titleModify" :fetchingData="procMenu || procPermit" customHeader>
      <div class="mt-4">
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtRoleName">
          <div slot="label">{{ $t('角色名稱') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtRoleName" v-model="roleName" ref="roleName"
                        :class="{ 'is-invalid': invalid.roleName }"></b-form-input>
        </b-form-group>
        <div>
          <b-form-group label-cols="4" label-cols-lg="2" :label="$t('權限')" label-for="selPermission">
            <div>
              <tree-select id="selPermission" v-model="permit" :multiple="true" :options="optPermit" 
                          value-format="object" value-consists-of="LEAF_PRIORITY" placeholder="0 options selected">
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
        <label>{{ $t(message) }} [ {{ roleName }} ]</label>
      </div>
      <div v-if="modeMessage=='active'" class="text-center">
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
        <div v-if="modeMessage=='active'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="CONFIRM_ACTIVE(true)">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="CONFIRM_ACTIVE(false)">{{ $t('取消') }}</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Treeselect from '@riophae/vue-treeselect'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Message from '@/mixins/message'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { STATE_LIST, MENU_LIST } from '@/configs/site.js'

export default {
    name: 'RoleInfo',

    components: { 
      'widget': Widget,
      'tree-select': Treeselect
    },
    
    data() {
      return {
        colRole: ['role_name', 'active', 'action'],
        optRole: {
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
            'role_name': () => i18n.t('角色名稱'),
            'active': () => i18n.t('啟用狀態'),
            'action': () => i18n.t('操作'),
          },
        },
        pageNo: 1,
        pageSize: 50,
        roleId: 0,
        roleName: '',
        active: 'enable',
        active_confirm: true,
        permit: [],
        invalid: {
          'roleName': false,
        },
        modeModify: '',
        modeMessage: '',
        message: '',
        showMessage: false,
        completed: false,
        logout: false
      }
    },

    mounted() {
      this.SELECT_ROLE()

      if (window.history && window.history.pushState) {
        window.addEventListener('popstate', this.goBack, false)
      } 
    },

    destroyed() {
      this.RESET_STATE();
    },

    computed: {
      ...mapState('role', {
        'procRoleSel': state => state.process.select,
        'procRoleMod': state => state.process.modify,
        'procRoleDel': state => state.process.delete,
        'resRoleCount': state => state.response.count,
        'resRoleList': state => state.response.list,
        'resRoleId': state => state.response.roleId,
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
        return (this.modeModify=='create') ? `<h4><span class='fw-semi-bold'>${i18n.t('角色 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('角色 - 修改')}</span></h4>`
      },

      optPermit() {
        let option = JSON.parse(JSON.stringify(this.listMenu));   //deep copy

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
      ...mapActions('role', {
        'REQUEST_ROLE_SEL': 'request_select',
        'REQUEST_ROLE_ADD': 'request_create',
        'REQUEST_ROLE_UPD': 'request_update',
        'REQUEST_ROLE_DEL': 'request_delete',
        'RESET_STATE': 'reset_state',
      }),
      ...mapActions('menu', {
        'REQUEST_MENU': 'request_select'
      }),
      ...mapActions('permission', {
        'REQUEST_PERMIT_SEL': 'request_select',
        'REQUEST_PERMIT_UPD': 'request_update'
      }),
      
      async SELECT_ROLE() {
        let _para = {
          'roleId': 0
        }

        let _err = await this.REQUEST_ROLE_SEL(_para)
          
        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
        }
      },
      
      async CREATE_ROLE() {
        history.pushState(null, null, document.URL)

        this.modeModify = 'create'
        this.roleId = 0
        this.roleName = ''
        this.active = 'enable'
        this.active_confirm = false
        this.permit = []
        
        let _err = await this.REQUEST_MENU()
  
        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
        }
      },

      async UPDATE_ROLE(data) {
        history.pushState(null, null, document.URL)

        this.modeModify = 'update'
        this.roleId = data.role_id
        this.roleName = data.role_name
        this.active = data.active
        this.active_confirm = this.active == 'enable' ? false : true

        let _para, _err        

        _err = await this.REQUEST_MENU()

        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
          return
        }

        _para = {          
          'userId': 0,
          'roleId': this.roleId,
          'isMain': 0,
        }

        _err = await this.REQUEST_PERMIT_SEL(_para)

        this.permit = this.listPermit

        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
        }
      },

      async DELETE_ROLE(data) {
        this.roleId = data.role_id
        this.roleName = data.role_name
        this.message = '子帳號如有綁定此角色，則該子帳號將被停用，請確認是否刪除?'
        this.modeMessage = 'confirm'
        this.showMessage = true
      },

      async SUBMIT_MODIFY() {
        for(let item in this.invalid) {
          this.invalid[item] = !this.$refs[item].value
        }

        for(let item in this.invalid) {
          if(this.invalid[item]) {
            this.message = '資料不完整 !'
            this.modeMessage = 'notice'
            this.showMessage = true
            return
          }
        }
        
        let _para, _err

        switch(this.modeModify) {
          case 'create':
            _para = {
              'roleName': this.roleName,
              'active': (this.active == '啟用') ? '1' : '0'
            }            
            _err = await this.REQUEST_ROLE_ADD(_para)

            _para = {             
              'userId': 0,
              'roleId': this.resRoleId,
              'menuId': this.permit,
              'isMain': 0,
            }            
            _err = await this.REQUEST_PERMIT_UPD(_para)

            if(_err) {
              this.SHOW_MESSAGE(_err, Message[_err])
              return
            }

            this.SHOW_MESSAGE(null, Message[1000])
            this.completed = true
            break

          case 'update':
            _para = {
              'roleId': this.roleId,
              'roleName': this.roleName,
              'active': (this.active == 'enable') ? '1': '0'
            }            
            _err = await this.REQUEST_ROLE_UPD(_para)
          
            _para = {              
              'userId': 0,
              'roleId': this.roleId,
              'menuId': this.permit,
              'isMain': 0,
            }
            _err = await this.REQUEST_PERMIT_UPD(_para)

            if(_err) {
              this.SHOW_MESSAGE(_err, Message[_err])
              return
            }

            this.SHOW_MESSAGE(null, Message[1000])
            this.completed = true
            break
        }
      },

      async SUBMIT_DELETE() {
        let _para, _err;

        _para = {
          'roleId': this.roleId,
        }

        _err = await this.REQUEST_ROLE_DEL(_para);

        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err]);
          return;
        }
        
        _para = {          
          'userId': 0,
          'roleId': this.roleId,
          'menuId': [],
          'isMain': 0
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
      },

      SET_INPUT_TYPE() {
        this.inputType.password = 'password'
      },

      CONFIRM_ACTIVE(confirm) {
        if(!confirm) this.active = 'enable';
        this.active_confirm = true;
        this.showMessage = false;
      },

      SHOW_MESSAGE(err, message) {
        this.message = message;
        this.modeMessage = 'notice';
        this.showMessage = true;

        if(err == 1002 || err == 1004 || err == 1005 || err == 1012) {
          this.logout = true;
        }
      },

      CLOSE_MESSAGE() {
        if(!this.active_confirm) this.active = 'enable';
        if(this.completed) {
          this.modeModify = '';
          this.completed = false;
        }
        if(this.logout) this.USER_LOGOUT();
      },

      changeText(item) {
        return MENU_LIST.find(node => node.routerName === item)?.name ?? item
      },

      changeStateText(item) {
        return STATE_LIST.find(node => node.code === item)?.name ?? item
      },

      goBack(){
        this.modeModify = ''
      }
    },
    watch: {
      modeModify: {
        handler: function() {
          for(let item in this.invalid) {
            this.invalid[item] = false;
          }
        },
      },   
      active: {
        handler: function(newValue, oldValue) {
          if(newValue == 'disable' && !this.active_confirm && this.modeModify !== 'create') {
            this.message = '子帳號如有綁定此角色，則該子帳號也將一併停用，請確認是否繼續停用 ?';
            this.modeMessage = 'active';
            this.showMessage = true;
          }
          if(this.active_confirm) this.active_confirm = false;
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
