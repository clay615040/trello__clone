<template>
  <div>
    <widget v-if="!modeEditor" :title="`<h4><span class='fw-semi-bold'>${$t('通報群組 - 列表')}</span></h4>`" :fetchingData="procSelect" customHeader>
      <div class="mt-4">
        <div class="float-left">
          <b-button type="button" variant="primary" @click="CREATE_DATA()">
            {{$t('新增')}}
          </b-button>
        </div>
        <div class="float-right" v-if="resDataCount && !procSelect">
          <label class="pt-2">{{ $t('資料筆數') }} : {{ resDataCount }}</label>
        </div>
        <v-client-table :columns="colGroup" :options="optGroup" :data="resDataInfo">
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
        <b-form-group label-cols="4" label-cols-lg="2" label-for="selPipeline">
          <div slot="label">{{ $t('通訊軟體') }}<span class="warn-text">*</span></div>
          <b-form-select id="selPipeline" v-model="pipelineId" ref="pipelineId"
                          :class="{ 'is-invalid': invalid.pipelineId }">
            <option v-for="(item, key) in listPipeline" :key="key" :value="item.id" :selected="pipelineId">
              {{ item.name }}
            </option>
          </b-form-select>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtGroupName">
          <div slot="label">{{ $t('群組名稱') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtGroupName" v-model="groupName" ref="groupName"
                        :class="{ 'is-invalid': invalid.groupName }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtGroupCode">
          <div slot="label">{{ $t('群組代碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtGroupCode" v-model="groupCode" ref="groupCode"
                        :class="{ 'is-invalid': invalid.groupCode }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtGroupKey">
          <div slot="label">{{ $t('群組金鑰') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtGroupKey" v-model="groupKey" ref="groupKey"
                        :class="{ 'is-invalid': invalid.groupKey }"></b-form-input>
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
      <div v-if="modeMessage=='confirm'" class="text-center">
        <label>{{ message }}</label>
      </div>
      <template v-slot:modal-footer>
        <div v-if="modeMessage=='notice'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage=false">{{ $t('確認') }}</b-button>
        </div>
        <div v-if="modeMessage=='confirm'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="CONFIRM_ACTIVE(true)">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="CONFIRM_ACTIVE(false)">{{ $t('取消') }}</b-button>
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
  name: 'NotifyGroup',

  components: { 
    'widget': Widget,
  },

  data() {
    return {
      colGroup: ['pipeline_name', 'group_name', 'group_code', 'group_key', 'active', 'action'],
      optGroup: {
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
          'pipeline_name': () => i18n.t('通訊軟體'),
          'group_name': () => i18n.t('群組名稱'),
          'group_code': () => i18n.t('群組代碼'),
          'group_key': () => i18n.t('群組金鑰'),
          'active': () => i18n.t('啟用狀態'),
          'action': () => i18n.t('操作'),
        },
        cellClasses: {
        }
      },
      groupId: '',
      pipelineId: 0,
      groupName: '',
      groupCode: '',
      groupKey: '',
      active: 'enable',
      active_confirm: true,
      invalid: {
        'pipelineId': false,
        'groupName': false,
        'groupCode': false,
        'groupKey': false,
      },
      modeEditor: '',
      modeMessage: '',
      message: '',
      showMessage: false,
      completed: false,
      logout: false
    }
  },

  async mounted() {
    let _err;
  
    _err = await this.REQUEST_PIPELINE();
    if(_err) {
      this.SHOW_MESSAGE(_err, Message[_err]);
      return;
    }

    this.SELECT_DATA();
    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', this.goBack, false)
    } 
  },
  destroyed() {
    this.RESET_STATE();
  },
  
  computed: {
    ...mapState('notifyGroup', {
      'procSelect': state => state.process.select,
      'procModify': state => state.process.modify,
      'resDataCount': state => state.response.count,
      'resDataInfo': state => state.response.info,
      'listPipeline': state => state.response.pipeline,
    }),
    
    titleModify() {
      return (this.modeEditor == 'create') ? `<h4><span class='fw-semi-bold'>${i18n.t('通報群組 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('通報群組 - 修改')}</span></h4>`
    },
  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('notifyGroup', {
      'REQUEST_SELECT': 'request_select', 
      'REQUEST_CREATE': 'request_create',
      'REQUEST_UPDATE': 'request_update',
      'REQUEST_PIPELINE': 'request_pipeline',
      'RESET_STATE': 'reset_state',
    }),
    
    async SELECT_DATA() {
      let _err = await this.REQUEST_SELECT();
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err]);
      }
    },
    
    async CREATE_DATA() {
      history.pushState(null, null, document.URL)

      this.modeEditor = 'create'
      this.pipelineId = 0
      this.groupName = ''
      this.groupCode = ''
      this.groupKey = ''
      this.active = 'enable'
      this.active_confirm = false
    },

    async UPDATE_DATA(data) {
      history.pushState(null, null, document.URL)

      this.modeEditor = 'update'
      this.groupId = data.group_id
      this.pipelineId = data.pipeline_id
      this.groupName = data.group_name
      this.groupCode = data.group_code
      this.groupKey = data.group_key
      this.active = data.active
      this.active_confirm = this.active == 'enable'? false: true
    },

    async SUBMIT_MODIFY() {
      for(let item in this.invalid) {
        this.invalid[item] = !this.$refs[item].value
      }
      
      for(let item in this.invalid) { 
        if(this.invalid[item]) {
          let _message = Message[2001];

          this.SHOW_MESSAGE(null, _message);
          return;
        }
      }

      let _para, _err;

      switch(this.modeEditor) {
        case 'create':
          _para = {
            'pipelineId': this.pipelineId,
            'groupCode': this.groupCode,
            'groupName': this.groupName,
            'groupKey': this.groupKey,
            'active': this.active
          }            
          _err = await this.REQUEST_CREATE(_para);

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err]);
            return;
          }
            
          this.SHOW_MESSAGE(null, Message[1000]);
          this.completed = true;
          
          break;

        case 'update':
          _para = {
            'groupId': this.groupId,
            'pipelineId': this.pipelineId,
            'groupCode': this.groupCode,
            'groupName': this.groupName,
            'groupKey': this.groupKey,
            'active': this.active
          }            
          _err = await this.REQUEST_UPDATE(_para);

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err]);
            return;
          }
          
          this.SHOW_MESSAGE(null, Message[1000]);
          this.completed = true;
          break;
      }
    },

    CANCEL_MODIFY() {
      history.back()
      this.modeEditor = ''
    },

    CONFIRM_ACTIVE(confirm) {

      if(!confirm) this.active = 'enable';

      this.active_confirm = true;
      this.showMessage= false;
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
        this.modeEditor = '';
        this.completed = false;
      }

      if(this.logout) this.USER_LOGOUT();
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
          this.invalid[item] = false;
        }
      },
    },
    active: {
      handler: function(newValue, oldValue) {
        
        if(newValue == 'disable' && !this.active_confirm && this.modeEditor !== 'create') {
          this.message = i18n.t('通報綁定如有綁定此群組，則該通報也將一併停用，請確認是否繼續停用 ?');
          this.modeMessage = 'confirm';
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

  .rounded-pill {
    white-space:nowrap;
  }
</style>