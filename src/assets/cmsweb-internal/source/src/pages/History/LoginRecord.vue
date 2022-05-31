<template>
  <div>
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('遊戲登錄紀錄')}</h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
          <label for="selOperator">{{ $t('平台商') }}</label>
          <select id="selOperator" class="form-control"
                  v-model="merchantId" @change="getGameList()"
                  :class="{ 'is-invalid': invalid.operator }">
            <option v-for="(value, key) in operatorList" :key="key" :value="value.code" :selected="merchantId">
                {{ value.name }}
            </option>
          </select>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
            <label for="selGameId">{{ $t('遊戲代碼') }}</label>
            <select id="selGameId" class="form-control" v-model="gameId">
              <option v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId">{{ value.game_name_lang }}
                <span v-if="value.game_name_lang!=='All'">({{ value.game_code }})</span>
              </option>
            </select>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
            <label for="txtTimePeriod">{{$t('時間區間')}}</label>
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
        <template v-slot:child_row="props">
          <div class="row m-0"><strong>{{ $t('User Token') }} :</strong>
            <span v-if="props.row.user_token">
            <button type="button" class="btn btn-link border-0 py-0 px-2" @click="COPY_TEXT(props.row.user_token)" >
              <i class="fa fa-clone" aria-hidden="true"></i>
            </button>
            </span>
          </div>
          <div class="row m-0"><strong>{{ $t('Session Token') }} :</strong>
            <span v-if="props.row.session_token">
              <button type="button" class="btn btn-link border-0 py-0 px-2" @click="COPY_TEXT(props.row.session_token)">
                <i class="fa fa-clone" aria-hidden="true"></i>
              </button>
            </span>
          </div>
          <div><strong>{{ $t('Licensee ID') }} : </strong>{{ props.row.licensee_id }}</div>
          <div><strong>{{ $t('Configuration ID') }} : </strong>{{ props.row.configuration_id }}</div>
          <div><strong>{{ $t('資源包') }} : </strong>{{ props.row.bundle_sdk }}</div>
          <div><strong>{{ $t('會員等級') }} : </strong>{{ props.row.vip }}</div>
          <div><strong>{{ $t('幣別') }} : </strong>{{ props.row.currency }}</div>          
        </template>        
      </v-client-table>
      <div v-if="resRecord.length > 0 && !loading">
        <div class="float-right mt-2" >
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

import { mapState, mapActions } from 'vuex'
import { JSONView } from 'vue-json-component'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Method from '@/mixins/method'
import Message from '@/mixins/message'
import { getOperatorList, getGameList } from '@/services/service'
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
        colRecord: ['merchant_id', 'vendor_name', 'game_id', 'language', 'launch_from', 'create_date'],
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
            'merchant_id': () => i18n.t('平台商'),
            'vendor_name': () => i18n.t('遊戲商'),
            'game_id': () => i18n.t('遊戲代碼'),
            'language': () => i18n.t('語系'),
            'launch_from': () => i18n.t('來源裝置'),
            'create_date': () => i18n.t('創建日期')
          },
          cellClasses: {
            winLose: [
              {
                  class: 'text-danger',
                  condition: row => row.winLose < 0
              }
            ]
          }
        },
        pageNo: 1,
        pageSize: 50,
        merchantId: '',
        vendorCode: sessionStorage.getItem('vendor_code'),
        gameId: '',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showDetail: false,
        invalid: {
          'timePeriod': false
        },
        overTime: false,
        overTimeText: '',
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        operatorList: [],
        gameList: [],
        loading: false,
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },
    computed: {
      ...mapState('loginRecord', {          
        'countRecord': state => state.response.count_record,
        'pageRecord': state => state.response.page_record,
        'resRecord': state => state.response.record,
        'reqRecord': state => state.request.record,        
      }),

      countRecord_Format() {        
        return Method.format_number(this.countRecord, 0);
      },
    },
    watch: {
      '$i18n.locale'() {
        this.getGameList()
      },
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
      ...mapActions('loginRecord', {
        'REQUEST_RECORD': 'request_record',
        'RESET_STATE': 'reset_state',
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
          'merchantId': this.merchantId,
          'vendorCode': this.vendorCode,          
          'gameId': this.gameId,
          'startDate': this.datePeriod[0],
          'endDate': this.datePeriod[1]
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
          this.invalid['timePeriod'] = true;
        }
        else {
          this.invalid['timePeriod'] = false;
        }
      },

      CHANGE_PAGE_RECORD() {
        this.pageSize = this.reqRecord.page_size;
        this.merchantId = this.reqRecord.merchant_id;
        this.vendorCode = this.reqRecord.vendor_code;
        this.gameId = this.reqRecord.game_id;
        this.datePeriod[0] = this.reqRecord.date_period[0];
        this.datePeriod[1] = this.reqRecord.date_period[1];
        
        this.QUERY_RECORD(false);
      },

      DATA_VALID(id) {
        switch(id) {
          case 'selOperator':
            if(!this.merchantId) {
              this.invalid['operator'] = true;
            }
            else {
              this.invalid['operator'] = false;
            }
            break;
          case 'txtTimePeriod':
            if(!this.datePeriod[0] || !this.datePeriod[1]) {
              this.invalid['timePeriod'] = true;
            }
            else {
              this.invalid['timePeriod'] = false;
            }
            break;
        }
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
      
      async getOperatorList() {
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),                                  
          }
        }

        try {
          let temp = await getOperatorList(body)
          this.operatorList = temp.result
          this.operatorList.unshift({ code: '', id: '', name: 'All'})
          this.merchantId = this.operatorList?.[0]?.code
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getGameList() {
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),                                  
            language: sessionStorage.getItem('language'),
            is_all: false,
            merchant_id: this.merchantId,                                  
          }
        }

        try {
          let temp = await getGameList(body)
          this.gameList = temp.result
          this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
          this.gameId = this.gameList?.[0]?.game_code
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },
    },
    async mounted() {
      await this.getOperatorList()
      await this.getGameList()

      let _dateFormat = 'YYYY-MM-DD HH:mm:00';
      let _dateNow = new Date();  // '2020-10-20 23:00:00'
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600* 1000* 24* 3);  // '2020-10-20 00:00:00'
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)];
    },
    destroyed() {
      this.RESET_STATE();
    }
}
</script>


