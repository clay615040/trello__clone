<template>
  <div class="roundRecord">
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('押注紀錄 (局)')}</h4>`" customHeader>
      <div class="row mt-4 px-3">        
        <div class="form-group col-12 col-md-4 px-2">
            <label for="txtRoundId">{{$t('系統局號')}}</label>
            <input type="text" id="txtRoundId" class="form-control"
                    v-model="roundId">
        </div>
        <div class="form-group col-12 col-md-4 px-2">
            <label for="txtRoundString">{{$t('遊戲局號')}}</label>
            <input type="text" id="txtRoundString" class="form-control"
                    v-model="roundString">
        </div>
      </div>
      <div class="row px-3">        
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
              <option v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId"> {{ value.game_name_lang + ' ' }}
                <span v-if="value.game_name_lang!=='All'">({{ value.game_code }})</span>
              </option>
            </select>
        </div>
        <div class="form-group col-12 col-md-5 px-2">
            <label for="txtTimePeriod">{{$t('時間區間')}}</label>
            <span class="warn-text">*</span>
            <span class="warn-text" v-if="overTime">{{ $t('不能超過 90 天') }}</span>
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
                      :disabled="loading" @click="search(true)">
                      {{ $t('搜尋') }}
            </b-button>
          </div>
        </div>
      </div>
    </widget>

    <widget class="mt-5 mb-4" v-if="recordData.length > 0 && !loading" title="<h5><span class='fw-semi-bold'>Summary</span></h5>" customHeader>
      <div class="table-resposive mt-4">
        <table class="table" aria-hidden="true">
          <thead>
            <tr>
              <th class="hidden-sm-down">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in summary" :key="index">
              <td>{{ row.merchant_id }}</td>
              <td>{{ row.currency }}</td>
              <td class="numberRight">{{ row.total_bet }}</td>
              <td class="numberRight">{{ row.total_win }}</td>
              <td class="numberRight">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight">{{ row.service_fee }}</td>
                <td class="numberRight">{{ row.jackpot }}</td>
              </template>
              <td class="numberRight" v-else-if="vendorCode === 'audere'">{{ row.tax_amount }}</td>
              <td class="numberRight">{{ row.rtp }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 refundSummary" v-if="refundSummary && refundSummary.length>0">
        <span class='fw-semi-bold'>{{$t('退款概況')}}</span>
        <i class="fa fa-question-circle-o refundSummaryIcon" aria-hidden="true" :title="$t('僅含於此後台人工手動產生的全退注單')"></i>
      </div>

      <div class="table-resposive" v-if="refundSummary && refundSummary.length>0">
        <table class="table" aria-hidden="true">
          <thead>
            <tr>
              <th class="hidden-sm-down">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in refundSummary" :key="index">
              <td>{{ row.merchant_id }}</td>
              <td>{{ row.currency }}</td>
              <td class="numberRight">{{ row.total_bet }}</td>
              <td class="numberRight">{{ row.total_win }}</td>
              <td class="numberRight">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight">{{ row.service_fee }}</td>
                <td class="numberRight">{{ row.jackpot }}</td>
              </template>
              <td class="numberRight" v-else-if="vendorCode === 'audere'">{{ row.tax_amount }}</td>
              <td class="numberRight">{{ row.rtp }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 refundSummary" v-if="adjustSummary && adjustSummary.length>0">
        <span class='fw-semi-bold'>{{$t('派彩金額調整之差額統計')}}</span>
        <i class="fa fa-question-circle-o refundSummaryIcon" aria-hidden="true" :title="$t('差額') + '=' + $t('調整前') + '-' + $t('調整後')"></i>
      </div>

      <div class="table-resposive" v-if="adjustSummary && adjustSummary.length>0">
        <table class="table" aria-hidden="true">
          <thead>
            <tr>
              <th class="hidden-sm-down">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in adjustSummary" :key="index">
              <td>{{ row.merchant_id }}</td>
              <td>{{ row.currency }}</td>
              <td class="numberRight">{{ '0.00' }}</td>
              <td class="numberRight">{{ row.total_win }}</td>
              <td class="numberRight">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight">{{ '0.00' }}</td>
                <td class="numberRight">{{ '0.00' }}</td>
              </template>
              <td class="numberRight" v-else-if="vendorCode === 'audere'">{{ '0.00' }}</td>
              <td class="numberRight">{{ row.rtp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <widget class="mb-3" v-else>
      <div class="mb-2" v-if="recordData && recordData.length > 0">
        <div class="float-left">
          <b-button type="button" variant="outline-primary" @click="EXPORT_RECORD()">
            <span v-if="!excelLoading">{{ $t('匯出') }}</span>
            <i v-else class="fa fa-spinner fa-spin fa-fw" aria-hidden="true"/>
          </b-button>
        </div>
        <div class="float-right">
          <label class="float-left pt-2 pr-3">{{ $t('資料筆數') }} : {{ countRecordFormat }}</label>
          <b-pagination v-model="pageNo" :total-rows="countRecord" :per-page="pageSize"
                        class="pagination" @input="search(false)">
          </b-pagination>
        </div>
      </div>
      <v-client-table name="tbRecord" :columns="colRecord" :options="optRecord" :data="recordData" ref="tbRecord">
        <template slot="round_id" slot-scope="props">
          <button v-if="vendorCode=='chess'" type="button" class="btn btn-link p-0 border-0 text-left" @click="getTransactionLog(props.row)">{{ props.row.round_id }}</button>
          <span v-else>{{ props.row.round_id }}</span>
        </template>
        <template slot="total_bet" slot-scope="props">
          <span v-if="props.row.old_total_bet">{{ `${props.row.total_bet}(${props.row.old_total_bet})` }}</span>
          <span v-else>{{props.row.total_bet}}</span>
        </template>
        <template slot="total_win" slot-scope="props">
          <span v-if="props.row.old_total_win">{{ `${props.row.total_win}(${props.row.old_total_win})` }}</span>
          <span v-else>{{props.row.total_win}}</span>
        </template>
        <template slot="win_lose" slot-scope="props">
          <span v-if="props.row.old_win_lose">{{ `${props.row.win_lose}(${props.row.old_win_lose})` }}</span>
          <span v-else>{{props.row.win_lose}}</span>
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

    <b-modal v-model="showApiLog" :title="$t('Log')" body-bg-variant="white" size="xl">
      <widget :fetchingData="transactionLogLoading" class="mb-0 p-0">
        <v-client-table :columns="colApiLog" :options="optApiLog" :data="transactionLogData">
        </v-client-table>
      </widget>
      <template v-slot:modal-footer>
        <b-button variant="outline-secondary" class="btn-sm" @click="showApiLog=false">{{ $t('關閉') }}</b-button>
      </template>
    </b-modal>

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

import { mapActions } from 'vuex'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Message from '@/mixins/message'
import XLSX from 'xlsx'
import { getOperatorList, getGameList, roundRecord, transactionLog, addVendorLog } from '@/services/service'
import { numberFormat, objNumberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'RoundRecord',

    components: { 
      'widget': Widget, 
      'date-picker': DatePicker,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: [],
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
            id: 'width-100', total_bet: 'numberRight', total_win: 'numberRight', win_lose: 'numberRight', jackpot: 'numberRight', 
            bonus: 'numberRight', total_tax: 'numberRight', service_fee: 'numberRight'
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {},
          cellClasses: {
            win_lose: [
              {
                  class: 'text-danger',
                  condition: row => parseFloat(row.win_lose) < 0
              }
            ]
          }
        },
        colApiLog: ['user_id', 'vendor_id', 'round_id', 'transaction_id', 'req_api', 'req_data', 'res_data'],
        optApiLog: {
          perPage: 50,
          perPageValues: [50],
          pagination: { show: false },
          texts: {
            filterPlaceholder: i18n.t('篩選'), 
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          columnsClasses: { id: 'width-100' },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {
            'user_id': () => i18n.t('使用者 ID'),
            'vendor_id': () => i18n.t('遊戲商編號'),
            'round_id': () => i18n.t('系統局號'),
            'transaction_id': () => i18n.t('交易序號'),
            'req_api': () => i18n.t('請求 API'),
            'req_data': () => i18n.t('請求內容'),
            'res_data': () => i18n.t('回應內容')
          }
        },

        pageNo: 1,
        pageSize: 50,
        merchantId: '',
        roundId: '',
        roundString: '',
        vendorCode: sessionStorage.getItem('vendor_code'),
        gameId: '',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
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
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        apiData: [],
        recordData: [],
        summary: [],
        refundSummary: [],
        adjustSummary: [],
        loading: false,
        countRecord: 0,
        transactionLogData: [],
        transactionLogLoading: false,
        dataState: {
          old_total_bet: false,
          old_total_win: false,
          old_win_lose: false,
        },
        excelData: [],
        excelLoading: false,
        operatorList: [],
        gameList: [],
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

      async EXPORT_RECORD() {
        this.excelLoading = true

        await this.getExcelData()

        let headSummary = this.setExcelSummaryData()
        let headRecord = this.setExcelListData()

        let summary = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(summary, [headSummary[0]])
        XLSX.utils.sheet_add_json(summary, this.summary, { header: headSummary[1], origin: 'A2', skipHeader: true }) 

        let record = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(record, [headRecord[0]])
        XLSX.utils.sheet_add_json(record, this.excelData, { origin: 'A2', skipHeader: true })

        let workbook, fileName

        fileName = 'RoundRecord_Data_'+ moment(new Date()).format('YYYYMMDD') +'.xlsx'
        workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, summary, 'Summary')
        XLSX.utils.book_append_sheet(workbook, record, 'list')
        XLSX.writeFile(workbook, fileName)

        this.excelLoading = false
      },

      async getExcelData() {
        this.excelData = []
        const body = {
          data: {
            vendor_code: this.vendorCode,
            round_id: this.roundId,
            round_string: this.roundString,          
            game_id: this.gameId,
            start_time: this.datePeriod[0],
            end_time: this.datePeriod[1],
            page_no: this.pageNo,
            page_size: 50,
            is_reload: false,          
            merchant_id: this.merchantId,
            is_export: true,
          }
        }
        try {
          let temp = await roundRecord(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.excelData = temp.result.map(node => ({
              round_id: node?.round_id,
              round_string: node?.round_string,
              bet_time: node?.bet_time,
              merchant_id: node?.merchant_id,
              vendor_code: sessionStorage?.getItem('vendor_code'),
              game_id: node?.game_id,
              currency: node?.currency,
              total_bet: numberFormat(node?.total_bet, 2),
              old_total_bet: numberFormat(node?.old_total_bet, 2),
              total_win: numberFormat(node?.total_win, 2),
              old_total_win: numberFormat(node?.old_total_win, 2),
              win_lose: numberFormat(node?.win_lose, 2),
              old_win_lose: numberFormat(node?.old_win_lose, 2),
              service_fee: numberFormat(node?.service_fee, 2),
              total_tax: numberFormat(node?.total_tax, 2),
              jackpot: numberFormat(node?.jackpot, 2),
              bonus: numberFormat(node?.bonus, 2),
            }))
          }
        } catch(e) {
          this.excelLoading = false
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      setExcelSummaryData() {
        let headSummary = [[],[]]
        
        // 一定會有的excel欄位 [0]header  [1]讓套件分辨資料對應的key
        let tempSummaryHeadList = [
          [
            i18n.t('平台商'), i18n.t('幣別'), i18n.t('投注'), i18n.t('贏分'), i18n.t('輸贏'), 
            i18n.t('RTP')
          ],
          [
            'merchant_id', 'currency', 'total_bet', 'total_win', 'win_lose', 
            'rtp'
          ],
        ]

        // 依照帳號 組成excel實際出現欄位
        for(let i=0; i<tempSummaryHeadList[0].length; i++) {
          headSummary[0].push(tempSummaryHeadList[0][i])
          headSummary[1].push(tempSummaryHeadList[1][i])
          if(i===4 && this.vendorCode === 'chess') {
            headSummary[0].push(i18n.t('服務費'))
            headSummary[0].push(i18n.t('彩金'))
            headSummary[1].push(i18n.t('service_fee'))
            headSummary[1].push(i18n.t('jackpot'))
          } else if(i===4 && this.vendorCode === 'audere') {
            headSummary[0].push(i18n.t('稅金'))
            headSummary[1].push(i18n.t('tax_amount'))
          }
        }

        // 刪掉不需要的excel資料
        this.summary.forEach(item => {
          if(this.vendorCode === 'audere') {
            delete item['service_fee']
            delete item['jackpot']
          } else if(this.vendorCode === 'chess') delete item['tax_amount']
        }) 

        return headSummary
      },

      setExcelListData() {
        let headRecord = [[],[]]

        // 一定會有的excel欄位 [0]header  [1]讓套件分辨資料對應的key
        let tempHeadList = [
          [
            i18n.t('系統局號'), i18n.t('遊戲局號'), i18n.t('投注時間'), i18n.t('平台商'), i18n.t('遊戲商'), 
            i18n.t('遊戲代碼'), i18n.t('幣別'), i18n.t('總投注'), i18n.t('總贏分'), i18n.t('總輸贏'), 
            i18n.t('額外獎金')
          ],
          [
            'round_id', 'round_string', 'bet_time', 'merchant_id', 'vendor_code', 
            'game_id', 'currency', 'total_bet', 'total_win', 'win_lose', 
            'bonus'
          ]
        ]

        // 依照帳號 組成excel實際出現欄位
        for(let i=0; i<tempHeadList[0].length; i++) {
          headRecord[0].push(tempHeadList[0][i])
          headRecord[1].push(tempHeadList[1][i])
          if(i===7 && this.dataState?.old_total_bet) {
            headRecord[0].push(i18n.t('總投注(調整前)'))
            headRecord[1].push('old_total_bet')
          }
          if(i===8 && this.dataState?.old_total_win) {
            headRecord[0].push(i18n.t('總贏分(調整前)'))
            headRecord[1].push('old_total_win')
          }
          if(i===9 && this.dataState?.old_win_lose) {
            headRecord[0].push(i18n.t('總輸贏(調整前)'))
            headRecord[1].push('old_win_lose')
          }
          if(i===9 && this.vendorCode === 'audere') {
            headRecord[0].push(i18n.t('總稅金'))
            headRecord[1].push('tax_amount')
          }
          else if(i===9 && this.vendorCode === 'chess') {
            headRecord[0].push(i18n.t('服務費'))
            headRecord[0].push(i18n.t('彩金'))
            headRecord[1].push('service_fee')
            headRecord[1].push('jackpot')
          }
        }

        // 刪掉不需要的excel資料
        this.excelData.forEach(item => { 
          // 視訊不顯示 服務費 彩金
          if(this.vendorCode === 'audere') {
            delete item['service_fee']
            delete item['jackpot']
          } 
          else if(this.vendorCode === 'chess') delete item['total_tax']
          if(!this.dataState?.old_total_bet) delete item['old_total_bet']
          if(!this.dataState?.old_total_win) delete item['old_total_win']
          if(!this.dataState?.old_win_lose) delete item['old_win_lose']
          delete item['bet_status']
          delete item['Bet_status']
        }) 

        return headRecord
      },

      CHANGE_COLUMN_RECORD() {
        this.colRecord = [
          'round_id', 'round_string', 'bet_time', 'merchant_id', 'game_id', 
          'currency', 'total_bet', 'total_win', 'win_lose',
        ]

        this.optRecord.headings = {              
          round_id: () => i18n.t('系統局號'),
          round_string: () => i18n.t('遊戲局號'),
          bet_time: () => i18n.t('投注時間'),
          merchant_id: () => i18n.t('平台商'),
          game_id: () => i18n.t('遊戲代碼'),
          currency: () => i18n.t('幣別'),
          total_bet: () => this.dataState?.old_total_bet ? i18n.t('總投注(調整前)') : i18n.t('總投注'),
          total_win: () => this.dataState?.old_total_win ?  i18n.t('總贏分(調整前)') : i18n.t('總贏分'),
          win_lose: () => this.dataState?.old_win_lose ? i18n.t('總輸贏(調整前)') : i18n.t('總輸贏'),                           
        }

        let vendor_code = sessionStorage.getItem('vendor_code')

        if(vendor_code === 'audere') {
          this.colRecord.push('total_tax', 'bonus')

          this.optRecord.headings = { ...this.optRecord.headings,               
            total_tax: () => i18n.t('總稅金'),
            bonus: () => i18n.t('額外獎金')
          }
        } else {
          this.colRecord.push('service_fee', 'jackpot', 'bonus')

          this.optRecord.headings = { ...this.optRecord.headings,                           
            service_fee: () => i18n.t('服務費'),
            jackpot: () => i18n.t('彩金'),
            bonus: () => i18n.t('額外獎金')
          }
        }
      },    
      
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

        let _diffTime = new Date(this.datePeriod[1]) - new Date(this.datePeriod[0])
        
        if(_diffTime > 3600 * 1000 * 24 * 92) {
          this.overTime = true
          this.loading = false
          return
        }

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        this.overTime = false 

        this.init()
        if(isReload) this.pageNo = 1
        await this.getRoundRecord(isReload)
        this.CHANGE_COLUMN_RECORD()
        this.formatData()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      }, 
      
      async getRoundRecord(isReload) {
        const body = {
          data: {
            'vendor_code': this.vendorCode,
            'round_id': this.roundId,
            'round_string': this.roundString,          
            'game_id': this.gameId,
            'start_time': this.datePeriod[0],
            'end_time': this.datePeriod[1],
            'page_no': this.pageNo,
            'page_size': this.pageSize,
            'is_reload': isReload,          
            'merchant_id': this.merchantId,
          }
        }
        try {
          let temp = await roundRecord(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.apiData = temp
            this.countRecord = temp.total_count
            this.recordData = temp?.result
            this.summary = temp?.summary
            this.refundSummary = temp?.refund_summary
            this.adjustSummary = temp?.refund_adjust_summary

            if(this.adjustSummary?.length>0) {
              this.adjustSummary[0].total_win = numberFormat(parseInt(this.adjustSummary[0]?.old_total_win) - parseInt(this.adjustSummary[0]?.total_win), 2)
              this.adjustSummary[0].win_lose = numberFormat(parseInt(this.adjustSummary[0]?.old_win_lose) - parseInt(this.adjustSummary[0]?.win_lose), 2)
            }

            // 判斷是否出現調整前的值 總贏分 總輸贏 總投注
            for(let item of this.recordData) {
              if(item?.['old_total_bet'] && typeof item?.['old_total_bet'] === 'number') this.dataState.old_total_bet = true
              if(item?.['old_total_win'] && typeof item?.['old_total_win'] === 'number') this.dataState.old_total_win = true
              if(item?.['old_win_lose'] && typeof item?.['old_win_lose'] === 'number') this.dataState.old_win_lose = true
            }
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
            'route': '/api/roundRecord',
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

      async getTransactionLog(data) {
        this.transactionLogData = ''
        this.transactionLogLoading = true

        const body = {
          data: {
            'merchant_id': data.merchant_id,
            'round_id': data.round_id,
          }
        }
        
        try {
          let temp = await transactionLog(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.transactionLogData = temp?.result
            this.showApiLog = true
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
        this.transactionLogLoading = false
      },

      init() {
        this.apiData = []
        this.countRecord = []
        this.recordData = []
        this.summary = []
        this.refundSummary = []
        this.adjustSummary = []
        this.dataState = {
          old_total_bet: false,
          old_total_win: false,
          old_win_lose: false,
        }
        this.excelData = []
      },

      formatData() {
        // 不做numberFormat的key 陣列
        let exception = { round_id: -1, round_string: -1 } 

        objNumberFormat(this.summary, exception)
        objNumberFormat(this.refundSummary, exception)
        objNumberFormat(this.adjustSummary, exception)
        objNumberFormat(this.recordData, exception)
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
            game_type: parseInt(sessionStorage.getItem('vendor_id'))===5 ? 6 : undefined                       
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
      this.CHANGE_COLUMN_RECORD()

      let _dateFormat = 'YYYY-MM-DD HH:mm:00'
      let _dateNow = new Date()
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600* 1000* 24* 3)
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)]
    },
}
</script>

<style lang="scss">
  .numberRight {
    text-align: end;
  }

  .roundRecord .table-resposive th,
  .roundRecord .table-resposive td {
    &:nth-last-child(1) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(2) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(3) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
    &:nth-last-child(4) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
    &:nth-last-child(5) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
    &:nth-last-child(6) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
    &:nth-last-child(7) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
  }

  .roundRecord .table th,
  .roundRecord .table td {
    vertical-align: inherit;
  }

  .refundSummary {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    span {
      font-size: 1.25rem;
    }
  }

  .refundSummaryIcon {
    margin-left: 4px;
    font-size: 20px;
    cursor: pointer;
  }
</style>