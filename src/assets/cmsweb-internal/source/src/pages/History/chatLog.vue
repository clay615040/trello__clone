<template>
  <div class="chatLog">
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('對話紀錄')}</h4>`" customHeader>
      <div class="row mt-4 px-3">  
        <div class="form-group col-12 col-md-3 px-2">
          <label for="txtPlayerAccount">{{$t('會員帳號')}}</label>
          <input type="text" id="txtPlayerAccount" class="form-control" v-model="playerAccount">
        </div>      
        <div class="form-group col-12 col-md-3 px-2">
          <label for="selOperator">{{ $t('平台商') }}</label>
          <select id="selOperator" class="form-control" v-model="operatorId" @change="getGameList()" :class="{ 'is-invalid': invalid.operator }">
            <option v-for="(value, key) in operatorList" :key="key" :value="value.code">
                {{ value.name }}
            </option>
          </select>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
          <label for="selGameId">{{ $t('遊戲代碼') }}</label>
          <select id="selGameId" class="form-control" v-model="gameId">
            <option v-for="(value, key) in gameList" :key="key" :value="value.game_code">{{ value.game_name_lang + ' ' }}
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
              :format="'YYYY-MM-DD HH:mm:00'" :change="CHANGE_DATE()" 
              :not-before="dateBefore"
              :input-class="{ 'form-control': true, 'is-invalid': invalid.timePeriod }"
              width="100%">
          <i class="fa fa-clock-o" slot="calendar-icon" aria-hidden="true"/>
          </date-picker>
        </div>
        <div class="col-12 col-md px-2 d-flex align-items-end">
          <div class="form-group">           
            <b-button type="button" variant="primary" :disabled="loading" @click="search(true)"> {{ $t('搜尋') }}
            </b-button>
          </div>
        </div>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <widget class="mb-3" v-else>
      <div class="mb-2" v-if="recordData && recordData.length > 0">
        <div class="float-right">
          <label class="float-left pt-2 pr-3">{{ $t('資料筆數') }} : {{ countRecordFormat }}</label>
          <b-pagination v-model="pageNo" :total-rows="countRecord" :per-page="pageSize"
                        class="pagination" @input="search(false)">
          </b-pagination>
        </div>
      </div>
      <v-client-table name="tbRecord" :columns="colRecord" :options="optRecord" :data="recordData" ref="tbRecord">
        <template slot="CreateDate" slot-scope="props">
          <span>{{ dateFormat(props.row.CreateDate) }}</span>
        </template>
      </v-client-table>
      <div v-if="recordData.length > 0 && !loading">
        <div class="float-right mt-2" >
          <b-pagination v-model="pageNo" :total-rows="countRecord" :per-page="pageSize"
                        class="pagination" @input="search(false)">
          </b-pagination>
        </div>
      </div>
    </widget>

    <b-modal v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" body-bg-variant="white" size="xs" centered>
      <div v-if="modeMessage=='notice'" class="text-center">
        <label>{{ $t(message) }}</label>
      </div>

      <template v-slot:modal-footer>
        <div v-if="modeMessage=='notice'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage=false">{{ $t('確認') }}</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Message from '@/mixins/message'
import { getOperatorList, getGameList, getChatLogs, addVendorLog } from '@/services/service'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'chatLog',

    components: { 
      'widget': Widget, 
      'date-picker': DatePicker,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: ['CreateDate', 'MerchantId', 'GameType', 'Uid', 'NickName', 'Message'],
        optRecord: {
          perPage: 50,
          perPageValues: [50],
          pagination: { show: false },
          texts: { 
            filterPlaceholder: i18n.t('篩選'), 
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          columnsClasses: { 
            Message: 'messageClass'
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {
            CreateDate: () => i18n.t('發言時間'),
            MerchantId: () => i18n.t('平台商'),
            GameType: () => i18n.t('遊戲代碼'),
            Uid: () => i18n.t('會員帳號'),
            NickName: () => i18n.t('暱稱'),
            Message: () => i18n.t('發言內容'),
          },
          cellClasses: {}
        },
        pageNo: 1,
        pageSize: 50,
        operatorList: [],
        operatorId: '',
        gameList: [],
        gameId: '',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showDetail: false,
        showApiLog: false,
        showDesc: false,
        invalid: {
          'timePeriod': false
        },
        overTime: false,
        overTimeText: '',
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        apiData: [],
        recordData: [],
        loading: false,
        countRecord: 0,
        excelData: [],
        excelLoading: false,
        playerAccount: '',
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    computed: {
      countRecordFormat() {        
        return numberFormat(this.countRecord, 0)
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
  
      CHANGE_DATE() {
        if(!this.datePeriod[0] || !this.datePeriod[1]) {
          this.invalid['timePeriod'] = true
        }
        else {
          this.invalid['timePeriod'] = false
        }
      },    

      DATA_VALID(id) {
        switch(id) {
          case 'selVendorCode':
            if(!this.vendorCode) {
              this.invalid['vendorCode'] = true
            }
            else {
              this.invalid['vendorCode'] = false
            }
            break
          case 'txtTimePeriod':
            if(!this.datePeriod[0] || !this.datePeriod[1]) {
              this.invalid['timePeriod'] = true
            }
            else {
              this.invalid['timePeriod'] = false
            }
            break
        }
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
        if(this.completed) this.completed = false
        if(this.logout) this.USER_LOGOUT()
      },

      async search(isReload) {
        for(let item in this.invalid) {
          if(this.invalid[item]) return
        }

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        if(isReload) this.pageNo = 1

        this.init()
        await this.getChatLogs()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      }, 

      async getOperatorList() {
        const body = {
          data: {
            'vendor_id': sessionStorage.getItem('vendor_id'),
          }
        }
        try {
          let temp = await getOperatorList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          }
          this.operatorList = temp.result
          this.operatorList.unshift({ code: '', id: 'all', name: 'All'})
          this.operatorId = this.operatorList[0]?.code
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
            merchant_id: this.operatorId,                                  
          }
        }

        try {
          let temp = await getGameList(body)
          this.gameList = temp.result
          this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
          this.gameId = this.gameList[0]?.game_code
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },
      
      async getChatLogs() {
        const body = {
          data: {
            merchant_id: this.operatorId,
            vendor_id: sessionStorage.getItem('vendor_id'),
            uid: this.playerAccount,
            game_code: this.gameId,
            start_time: this.datePeriod[0],
            end_time: this.datePeriod[1],
            page_no: this.pageNo,
            page_size: this.pageSize,
          }
        }
        try {
          let temp = await getChatLogs(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {

            this.apiData = temp
            this.countRecord = temp.count
            this.recordData = temp.result
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }

        const body1 = {
          data: { 
            'account_id': parseInt(sessionStorage.getItem('user_id')),
            'menu_id': getMenuId(this.$route.path),
            'subMenu_id': getSubMenuId(this.$route.path),
            'action': 'select',
            'route': '/api/getChatLogs',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.apiData)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      dateFormat(data) {
        return moment(data).format('YYYY-MM-DD HH:mm:ss')
      },

      init() {
        this.apiData = []
        this.countRecord = 0
        this.recordData = []
      },
    },
    
    async mounted() {
      await this.getOperatorList()
      await this.getGameList()

      let _dateNow = new Date()
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600* 1000* 24* 3)
      this.datePeriod = [moment(_datePre).format('YYYY-MM-DD HH:mm:00'), moment(_dateNow).format('YYYY-MM-DD HH:mm:00')]
    },
}
</script>

<style lang="scss">
  .chatLog .table th,
  .chatLog .table td {
    vertical-align: inherit
  }

  .messageClass {
    max-width: 220px;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>