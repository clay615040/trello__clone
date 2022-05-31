<template>
  <div>
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('管理操作紀錄')}</h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
          <label for="txtAccount">{{ $t('主帳號 / 子帳號') }}</label>
          <input type="text" id="txtAccount" class="form-control"
                  v-model="account">
        </div>
        <div class="form-group col-12 col-md-3 px-2">
          <label for="selMenu">{{ $t('操作選單') }}</label>
          <select id="selMenu" class="form-control"
                  v-model="menuId" @change="CHANGE_MENU()">
            <option v-for="(value, key) in menuList" :key="key" :value="value.code" :selected="menuId">
                {{ $t(changeText(value.name)) }}
            </option>
          </select>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
          <label for="selSubMenu">{{ $t('操作子選單') }}</label>
          <select id="selSubMenu" class="form-control"
                  v-model="subMenuId">
            <option v-for="(value, key) in subMenuList" :key="key" :value="value.code" :selected="subMenuId">
                {{ $t(changeText(value.name)) }}
            </option>
          </select>
        </div>
      
        <div class="form-group col-12 col-md-3 px-2">
            <label for="txtTimePeriod">{{ $t('時間區間') }}</label>
            <span class="warn-text">*</span>
            <span class="warn-text" v-if="overTime">{{ overTimeText }}</span>
            <date-picker type="datetime" id="txtTimePeriod"
                valueType="format" lang="en" range v-model="datePeriod" 
                :format="dateFormat" :change="CHANGE_DATE()" 
                :not-before="dateBefore"
                :input-class="{ 'form-control': true, 'is-invalid': invalid.timePeriod }"
                width="100%">
              <i class="fa fa-clock-o" slot="calendar-icon" aria-hidden="true"/>
            </date-picker>
        </div>
        <div class="col-12 col-md px-2 d-flex align-items-end">
          <div class="form-group">           
            <b-button type="button" variant="primary" 
                      :disabled="loading" @click="QUERY_RECORD(true)">
                      {{ $t('搜尋') }}
            </b-button>
          </div>
        </div>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <widget class="mb-3" v-else>
      <div class="mb-2" v-if="resRecord.length > 0 && !loading">
        <div class="float-right">
          <label class="float-left pt-2 pr-3">{{ $t('資料筆數') }} : {{ countRecord_Format }}</label>
          <b-pagination v-model="pageNo" :total-rows="countRecord" :per-page="pageSize"
                        class="pagination" @input="CHANGE_PAGE_RECORD()">
          </b-pagination>
        </div>
      </div>
      <v-client-table name="tbRecord" :columns="colRecord" :options="optRecord" 
                      :data="resRecord" ref="tbRecord">
        <template slot="menu" slot-scope="props">
          <span>{{ $t(changeText(props.row.menu)) }}</span>
        </template>
        <template slot="sub_menu" slot-scope="props">
          <span>{{ $t(changeText(props.row.sub_menu)) }}</span>
        </template> 
        <template slot="action" slot-scope="props">
          <span>{{ $t(changeActionText(props.row.action)) }}</span>
        </template> 
        <template v-slot:child_row="props">
          <div><strong>{{ $t('請求內容') }} : </strong>
            <span v-if="props.row.request">
              <button type="button" class="btn btn-link border-0 py-0 px-2" @click="COPY_TEXT(props.row.request)" >
                <i class="fa fa-clone" aria-hidden="true"></i>
              </button>
              <json-view :data="JSON.parse(props.row.request)" rootKey="" :styles="{ arrowSize: '1px' }"/>
            </span>
          </div>
          <div><strong>{{ $t('回應內容') }} : </strong>
            <span v-if="props.row.response">
              <button type="button" class="btn btn-link border-0 py-0 px-2" @click="COPY_TEXT(props.row.response)" >
                <i class="fa fa-clone" aria-hidden="true"></i>
              </button>
              <json-view :data="JSON.parse(props.row.response)" rootKey="" :styles="{ arrowSize: '1px' }"/>
            </span>
          </div>
        </template>
      </v-client-table>
      <div v-if="resRecord.length > 0 && !loading">
        <div class="float-right mt-2">
          <b-pagination v-model="pageNo" :total-rows="countRecord" :per-page="pageSize"
                        class="pagination" @input="CHANGE_PAGE_RECORD()">
          </b-pagination>
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
import { MENU_LIST, ACTION_LIST } from '@/configs/site.js'
import { mapState, mapActions } from 'vuex'
import { JSONView } from 'vue-json-component'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import i18n from '../../locales'
import Method from '@/mixins/method'
import Message from '@/mixins/message'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'LoginRecord',
    
    components: { 
      'widget': Widget, 
      'date-picker': DatePicker,
      'json-view': JSONView,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: ['account', 'menu', 'sub_menu', 'action', 'create_date'],
        optRecord: {
          perPage: 50,
          perPageValues: [50],
          pagination: { show: false },
          texts: { 
            filterPlaceholder: i18n.t('篩選'),
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {            
            'account': () => i18n.t('主帳號 / 子帳號'),
            'menu': () => i18n.t('操作選單'),
            'sub_menu': () => i18n.t('操作子選單'),
            'action': () => i18n.t('操作'),
            'create_date': () => i18n.t('創建日期')
          },
        },
        pageNo: 1,
        pageSize: 50,
        account: '',
        menuId: 0,
        subMenuId: 0,
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showDetail: false,
        menuList: [],
        subMenuList: [],
        invalid: {
          'timePeriod': false
        },
        overTime: false,
        overTimeText: '',
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        loading: false,
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    mounted() {
      this.QUERY_MENU();

      let _dateFormat = 'YYYY-MM-DD HH:mm:ss';
      let _dateNow = new Date();  // '2020-10-20 23:00:00'
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600 * 1000 * 24 * 3);  // '2020-10-20 00:00:00'
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)];
    },
    
    destroyed() {
      this.RESET_STATE();
    },

    computed: {
      ...mapState('executeRecord', {          
        'countRecord': state => state.response.count_record,
        'pageRecord': state => state.response.page_record,
        'resRecord': state => state.response.record,
        'reqRecord': state => state.request,        
      }),

      ...mapState('menu', {
        'recvMenu': state => state.process.select,
        'listMenu': state => state.response.list,
      }),

      countRecord_Format() {        
        return Method.format_number(this.countRecord, 0);
      },
    },

    watch: {
      'progressValue'() {
        if(this.progressValue>=90) {
          this.progressValue = 90
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
          window.clearInterval(this.progressTime)
        }
      }
    },

    methods: {
      ...mapActions('auth', {
        'USER_LOGOUT': 'logoutUser'
      }),
      ...mapActions('executeRecord', {
        'REQUEST_RECORD': 'request_record',
        'RESET_STATE': 'reset_state',
      }),
      ...mapActions('menu', {
        'REQUEST_MENU': 'request_select'
      }),

      async QUERY_RECORD(isReload) {
        for(let item in this.invalid) {
          if(this.invalid[item]) return
        }

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        if(isReload) this.pageNo = 1

        let _para = {
          'isReload': isReload,
          'pageNo': this.pageNo,
          'pageSize': this.pageSize,
          'account': this.account,
          'menuId': this.menuId,
          'subMenuId': this.subMenuId,
          'startTime': this.datePeriod[0],
          'endTime': this.datePeriod[1]
        }

        let _err = await this.REQUEST_RECORD(_para);
          
        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err]);
        }

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },   
      CHANGE_DATE() {
        if(!this.datePeriod[0] || !this.datePeriod[1]) {
          this.invalid['timePeriod'] = true
        }
        else {
          this.invalid['timePeriod'] = false
        }
      },  

      async QUERY_MENU() {
        let _err = await this.REQUEST_MENU();

        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err]);
          return;
        }

        this.menuList = [{
          'code': 0,
          'name': 'All',
          'child': []
        }]
        
        this.listMenu.forEach(_item => {
          this.menuList.push({
            'code': _item.id,
            'name': _item.menu,
            'child': _item.children,
          })
        })
        
        this.menuId = this.menuList[0].code;
        this.CHANGE_MENU();
      },

      CHANGE_MENU() {
        this.subMenuList = [{
          'code': 0,
          'name': 'All',
        }];

        this.listMenu.forEach(_item => {
          if(_item.id == this.menuId) {
            _item.children.forEach(_child => {
              this.subMenuList.push({
                'code': _child.id,
                'name': _child.menu
              })
            })
          }
        })
        
        this.subMenuId = this.subMenuList[0].code;
      }, 

      CHANGE_PAGE_RECORD() {
        this.pageSize = this.reqRecord.page_size;
        this.account = this.reqRecord.account;        
        this.menuId = this.reqRecord.menu_id;
        this.subMenuId = this.reqRecord.subMenu_id;
        this.datePeriod[0] = this.reqRecord.date_period[0];
        this.datePeriod[1] = this.reqRecord.date_period[1];
        
        this.QUERY_RECORD(false);
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
        if(this.completed) this.completed = false;
        if(this.logout) this.USER_LOGOUT();
      },
      COPY_TEXT(text) {
        navigator.clipboard.writeText(text);
        this.SHOW_MESSAGE('9998', Message['9998']);
      },
      
      changeText(item) {
        return MENU_LIST.find(node => node.routerName === item)?.name ?? item
      },

      changeActionText(item) {
        return ACTION_LIST.find(node => node.code === item)?.name ?? item
      }
    },
    

};
</script>
