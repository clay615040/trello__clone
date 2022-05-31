<template>
  <div class="reportMonthly">
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('輸贏報表 (月)')}</h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
            <label for="txtYear">{{ $t('年份') }}</label>
            <span class="warn-text">*</span>
            <date-picker id="txtYear" type="year"
                v-model="dateYear" valueType="format"
                :format="dateFormat" :change="CHANGE_DATE()"                
                :input-class="{ 'form-control': true, 'is-invalid': invalid.dateYear }"
                :placeholder='defaultChangeText'
                width="100%">
            <i class="fa fa-clock-o" slot="calendar-icon" aria-hidden="true"/>
            </date-picker>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
            <label for="selOperator">{{ $t('平台商') }}</label>
            <select id="selOperator" class="form-control"
                    v-model="merchantId" @change="getGameList()"
                    :class="{ 'is-invalid': invalid.operator }">
              <option v-for="(value, key) in operatorList" :key="key" :value="value.code">{{ value.name }}
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
        <div class="form-group col-12 col-md px-2 d-flex align-items-end">
          <b-button type="button" variant="primary" :disabled="loading" @click="search()">
                    {{ $t('搜尋') }}
          </b-button>
        </div>
      </div>
    </widget>

    <widget class="mb-4" v-if="!loading && summary && summary.length > 0 || refundSummary && refundSummary.length > 0" title="<h5><span class='fw-semi-bold'>Summary</span></h5>" customHeader>
      <div class="table-resposive mt-4">
        <table class="table" aria-hidden="true">
          <thead>
            <tr>
              <th class="hidden-sm-down summarymMerchantId">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down summarymCurrency">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight summarymBet">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight summarymWin">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight summarymWinLose">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight summarymServiceFee">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight summarymJackpot">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight summarymRtp">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in summary" :key="index">
              <td class="summarymMerchantId">{{ row.merchant_id }}</td>
              <td class="summarymCurrency">{{ row.currency }}</td>
              <td class="numberRight summarymBet">{{ row.total_bet }}</td>
              <td class="numberRight summarymWin">{{ row.total_win }}</td>
              <td class="numberRight summarymWinLose">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight summarymServiceFee">{{ row.service_fee }}</td>
                <td class="numberRight summarymJackpot">{{ row.jackpot }}</td>
              </template>
              <td class="numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ row.tax_amount }}</td>
              <td class="numberRight summarymRtp">{{ row.rtp }}</td>
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
              <th class="hidden-sm-down summarymMerchantId">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down summarymCurrency">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight summarymBet">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight summarymWin">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight summarymWinLose">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight summarymServiceFee">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight summarymJackpot">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight summarymRtp">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in refundSummary" :key="index">
              <td class="summarymMerchantId">{{ row.merchant_id }}</td>
              <td class="summarymCurrency">{{ row.currency }}</td>
              <td class="numberRight summarymBet">{{ row.total_bet }}</td>
              <td class="numberRight summarymWin">{{ row.total_win }}</td>
              <td class="numberRight summarymWinLose">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight summarymServiceFee">{{ row.service_fee }}</td>
                <td class="numberRight summarymJackpot">{{ row.jackpot }}</td>
              </template>
              <td class="numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ row.tax_amount }}</td>
              <td class="numberRight summarymRtp">{{ row.rtp }}</td>
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
              <th class="hidden-sm-down summarymMerchantId">{{ $t('平台商') }}</th>
              <th class="hidden-sm-down summarymCurrency">{{ $t('幣別') }}</th>
              <th class="hidden-sm-down numberRight summarymBet">{{ $t('投注') }}</th>
              <th class="hidden-sm-down numberRight summarymWin">{{ $t('贏分') }}</th>
              <th class="hidden-sm-down numberRight summarymWinLose">{{ $t('輸贏') }}</th>
              <template v-if="vendorCode === 'chess'">
                <th class="hidden-sm-down numberRight summarymServiceFee">{{ $t('服務費') }}</th>
                <th class="hidden-sm-down numberRight summarymJackpot">{{ $t('彩金') }}</th>
              </template>
              <th class="hidden-sm-down numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ $t('稅金') }}</th>
              <th class="hidden-sm-down numberRight summarymRtp">{{ $t('RTP') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in adjustSummary" :key="index">
              <td class="summarymMerchantId">{{ row.merchant_id }}</td>
              <td class="summarymCurrency">{{ row.currency }}</td>
              <td class="numberRight summarymBet">{{ '0.00' }}</td>
              <td class="numberRight summarymWin">{{ row.total_win }}</td>
              <td class="numberRight summarymWinLose">{{ row.win_lose }}</td>
              <template v-if="vendorCode==='chess'">
                <td class="numberRight summarymServiceFee">{{ '0.00' }}</td>
                <td class="numberRight summarymJackpot">{{ '0.00' }}</td>
              </template>
              <td class="numberRight summarymTax" v-else-if="vendorCode === 'audere'">{{ '0.00' }}</td>
              <td class="numberRight summarymRtp">{{ row.rtp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <template v-else>
      <div class="mb-4 px-0" xs="12" v-if="chartData &&chartData.length >= 1">
        <line-chart :data="chartData" chartHeight="500" />
      </div>

      <widget class="mb-4" :fetchingData="loading">
        <div class="mb-2" v-if="recordData.length > 0">        
          <b-button type="button" variant="outline-primary" @click="EXPORT_REPORT()" :disabled="procExport">
            <span v-if="!procExport">{{ $t('匯出') }}</span>
            <span v-else><i class="fa fa-spinner fa-spin fa-fw" aria-hidden="true"/></span>
          </b-button>
        </div>

        <!-- 輸贏報表 table -->
        <v-client-table name="tbReport" :columns="colReport" :options="optReport" :data="recordData" ref="tbReport">
          <template v-if="hasDetail" v-slot:child_row="props">
            <v-client-table v-if="props.row.date !== 'Total'" name="tbReport" :columns="colReport_child" :options="optReport" :data="props.row.detail" ref="tbReport">
            </v-client-table>
          </template>       
        </v-client-table>

        <!-- 已退款成功 title table -->
        <div class="mt-4 refundRecordData" v-if="refundRecordData && refundRecordData.length>0" @click="refundRecordDataHiden = !refundRecordDataHiden">
          <i v-if="refundRecordDataHiden" class="fa fa-caret-down arrowIcon" aria-hidden="true"></i>
          <i v-else class="fa fa-caret-up arrowIcon" aria-hidden="true"></i>
          <span class='fw-semi-bold'>{{$t('已退款成功')}}</span>
          <i class="fa fa-question-circle-o refundRecordDataIcon" aria-hidden="true" :title="$t('僅含於此後台人工手動產生的全退注單')"></i>
        </div>

        <v-client-table v-if="refundRecordDataHiden && refundRecordData && refundRecordData.length>0" name="tbReport" :columns="colReportTwo" :options="optReport" :data="refundRecordData" ref="tbReport">
          <template v-if="hasDetail" v-slot:child_row="props">
            <v-client-table v-if="props.row.date !== 'Total'" name="tbReport" :columns="colReportChildTwo" :options="optReport" :data="props.row.detail" ref="tbReport">
            </v-client-table>
          </template>       
        </v-client-table>
        
        <!-- 已調整派彩金額 title table -->
        <div class="mt-4 refundRecordData" v-if="adjustRecordData && adjustRecordData.length>0" @click="adjustRecordDataHiden = !adjustRecordDataHiden">
          <i v-if="adjustRecordDataHiden" class="fa fa-caret-down arrowIcon" aria-hidden="true"></i>
          <i v-else class="fa fa-caret-up arrowIcon" aria-hidden="true"></i>
          <span class='fw-semi-bold'>{{$t('已調整派彩金額')}}</span>
        </div>
        <v-client-table v-if="adjustRecordDataHiden && adjustRecordData && adjustRecordData.length>0" name="tbReport" :columns="colReportTwo" :options="adjustOptReport" :data="adjustRecordData" ref="tbReport">
          <template slot="total_win" slot-scope="props">
              <span>{{ `${props.row.total_win}(${props.row.old_total_win})` }}</span>
            </template>  
            <template slot="win_lose" slot-scope="props">
              <span>{{ `${props.row.win_lose}(${props.row.old_win_lose})` }}</span>
            </template>
          <template v-if="hasDetail" v-slot:child_row="props"> 
            <v-client-table v-if="props.row.date !== 'Total'" name="tbReport" :columns="colReportChildTwo" :options="adjustOptReport" :data="props.row.detail" ref="tbReport">
              <template slot="total_win" slot-scope="props">
                <span>{{ `${props.row.total_win}(${props.row.old_total_win})` }}</span>
              </template>  
              <template slot="win_lose" slot-scope="props">
                <span>{{ `${props.row.win_lose}(${props.row.old_win_lose})` }}</span>
              </template>     
            </v-client-table>
          </template>       
        </v-client-table>
      </widget> 
    </template>

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
import moment from 'moment'
import { mapActions } from 'vuex'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import LineChart from '@/pages/Dashboard/components/MainChart/LineChart'
import i18n from '@/locales'
import Message from '@/mixins/message'
import XLSX from 'xlsx'
import { getOperatorList, getGameList, getMonthlyReport, addVendorLog } from '@/services/service'
import { numberFormat, objNumberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'MonthlyReport',
    
    components: { 
      'widget': Widget,
      'line-chart': LineChart,
      'date-picker': DatePicker,
      'excel': XLSX,
      VueCircleProgress,
    },

    data() {
      return {
        colReport: [],
        colReport_child: [],
        optReport: {
          perPage: 500,
          perPageValues: [50],
          pagination: { show: false },
          texts: { 
            filterPlaceholder: i18n.t('篩選'),
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          columnsClasses: {
            space: 'spaceTable',
            date: 'dateTable', 
            merchant_id: 'merchantIdTable', 
            game_code: 'gameCodeTable', 
            currency: 'currencyTable', 
            total_round: 'totalRoundTable',
            total_count: 'totalCountTable', 
            total_bet: 'totalBetTable', 
            total_win: 'totalWinTable', 
            win_lose: 'winLoseTable', 
            tax_amount: 'taxAmountTable', 
            service_fee: 'serviceFeeTable',  
            jackpot: 'jackpotTable', 
            rtp: 'rtpTable', 
            total_people: 'totalPeopleTable',
            average_round_per_people: 'peopleAverageRound',
            average_bet_per_round: 'roundAverageBet'
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          headings: {          
          },          
          cellClasses: {
            date: [
              {
                class:'totalText',
                condition: row => row.date === 'Total'
              }
            ]
          },
          uniqueKey: 'date',
        },
        adjustOptReport: {
          perPage: 500,
          perPageValues: [50],
          pagination: { show: false },
          texts: { 
            filterPlaceholder: i18n.t('篩選'),
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          columnsClasses: {
            date: 'dateTable', 
            merchant_id: 'merchantIdTable', 
            game_code: 'gameCodeTable', 
            currency: 'currencyTable', 
            total_count: 'totalCountTable', 
            total_bet: 'totalBetTable', 
            total_win: 'totalWinTable', 
            win_lose: 'winLoseTable', 
            tax_amount: 'taxAmountTable', 
            service_fee: 'serviceFeeTable',  
            jackpot: 'jackpotTable', 
            rtp: 'rtpTable',
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          headings: {},          
          cellClasses: {
            date: [
              {
                class:'totalText',
                condition: row => row.date === 'Total'
              }
            ]
          },
          uniqueKey: 'date',
        },
        vendorCode: sessionStorage.getItem('vendor_code'),
        dateYear: '',
        dateFormat: 'YYYY',
        procExport: false,
        hasDetail: false,
        invalid: {
          'dateYear': false
        },        
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        chartData: [],
        tempChartLabels: [
          '', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
              'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 
              'Nov', 'Dec',
        ],
        defaultChangeText: i18n.t('請選擇'),
        operatorList: [],
        gameList: [],
        merchantId: '',
        gameId: '',
        loading: false,
        recordData: [],
        summary: [],
        refundRecordData: [],
        refundSummary: [],
        adjustRecordData: [],
        adjustSummary: [],
        apiData: [],
        refundRecordDataHiden: true,
        adjustRecordDataHiden: true,
        excelData: [],
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    methods: {
      ...mapActions('auth', {
        'USER_LOGOUT': 'logoutUser'
      }),
      async search() {
        for(let item in this.invalid) {
          if(this.invalid[item]) return
        }

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        if(!this.merchantId || !this.gameId) this.hasDetail = true
        else this.hasDetail = false

        this.init()
        await this.getMonthlyReport()
        this.changeTableHeader()
        this.setChartData()
        this.dataFormat()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },     

      async EXPORT_REPORT() {
        this.procExport = true

        let headSummary = this.setExcelSummaryData()
        let headRecord = this.setExcelListData()

        let summary = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(summary, [headSummary[0]])
        XLSX.utils.sheet_add_json(summary, this.summary, { header: headSummary[1], origin: 'A2', skipHeader: true })
        
        let report = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(report, [headRecord[0]])
        XLSX.utils.sheet_add_json(report, this.excelData, { header: headRecord[1], origin: 'A2', skipHeader: true }) 
        
        let workbook, fileName

        fileName = i18n.t('輸贏報表 (月)') + '_' + moment(this.dateYear).format('YYYY') + '_' + process.env.NODE_ENV +'.xlsx'
        workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, summary, 'summary')        
        XLSX.utils.book_append_sheet(workbook, report, 'list')        
        XLSX.writeFile(workbook, fileName)
        
        this.procExport = false
      },    

      CHANGE_DATE() {
        if(!this.dateYear) {
          this.invalid['dateYear'] = true
        }
        else {
          this.invalid['dateYear'] = false
        }
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
          case 'txtYear':
            if(!this.dateYear) {
              this.invalid['dateYear'] = true;
            }
            else {
              this.invalid['dateYear'] = false;
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
        if(this.completed) this.completed = false
        if(this.logout) this.USER_LOGOUT()
      },

      setChartData() {
        let _colorIndex = 0
        let _colorList = ['#005792', '#FF69B4', '#FDA700', '#002B49', '#FF0000', '#00FFFF', '#00FF7F', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#000000', '#808080', '#008000', '#800000', '#000080', '#808000', '#800080', '#c0c0c0', '#ffff', '#008080']
        let _group = []

        if(!this.merchantId || !this.gameId) {
          this.recordData.forEach(_item => {
            _item.detail.forEach(_node => {
              let temp = false
              for (let i = 0; i <= _group.length; i++) {
                if(_group[i]?.merchant_id === _node?.merchant_id && _group[i]?.game_code === _node?.game_code) {
                  return
                }
                else temp = true
              }
              
              if(temp) {
                _group.push({
                  'merchant_id': _node.merchant_id,
                  'game_code': _node.game_code
                })
              }
            })
          })

          _group.forEach(_info => {
            let _totalBet = {
              'type': 'spline',
              'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總投注'),
              'data': null,
              'color': _colorList[_colorIndex]
            }

            let _dataBet = []
            this.chartData.push(_totalBet)

            let _winLose = {
              'type': 'spline',
              'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總輸贏'),
              'data': null,
              'color': _colorList[_colorIndex + 1]
            }

            let _dataWin = []
            this.chartData.push(_winLose)

            this.recordData.forEach(_item => {
              _item.detail.forEach(_node => {
                if(_node.date != 'Total' &&
                _node.merchant_id == _info.merchant_id && 
                _node.game_code == _info.game_code) {
                  _dataBet.push([Date.parse(_item?.date), parseInt(_node.total_bet)])
                  _dataWin.push([Date.parse(_item?.date), parseInt(_node.win_lose)])
                }
              })
            })        
            
            _totalBet['data'] = _dataBet
            _winLose['data'] = _dataWin

            _colorIndex += 2
          })
        } else {
          this.recordData.forEach(_item => {
            let temp = false
            for (let i = 0; i <= _group.length; i++) {
              if(_group[i]?.merchant_id === _item?.merchant_id && _group[i]?.game_code === _item?.game_code) {
                return
              }
              else temp = true
            }
            
            if(temp) {
              _group.push({
                'merchant_id': _item.merchant_id,
                'game_code': _item.game_code
              })
            }
          })

          _group.forEach(_info => {
            let _totalBet = {
              'type': 'spline',
              'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總投注'),
              'data': null,
              'color': _colorList[_colorIndex]
            }

            let _dataBet = []
            this.chartData.push(_totalBet)

            let _winLose = {
              'type': 'spline',
              'name': _info.merchant_id +' '+ _info.game_code +' '+ i18n.t('總輸贏'),
              'data': null,
              'color': _colorList[_colorIndex + 1]
            }

            let _dataWin = []
            this.chartData.push(_winLose)

            this.recordData.forEach(_item => {
              if(_item.date != 'Total' && 
                _item.merchant_id == _info.merchant_id &&
                _item.game_code == _info.game_code) {
                _dataBet.push([Date.parse(_item?.date), parseInt(_item.total_bet)])
                _dataWin.push([Date.parse(_item?.date), parseInt(_item.win_lose)])
              }
            })        
            
            _totalBet['data'] = _dataBet
            _winLose['data'] = _dataWin

            _colorIndex += 2
          })

          if(this.chartData?.[0]?.data?.length === 0) this.chartData = []
        }
      },

      init() {
        this.apiData = []
        this.summary = []
        this.refundSummary = []
        this.adjustSummary = []
        this.recordData = []
        this.refundRecordData = []
        this.adjustRecordData = []
        this.chartData = []
        this.excelData = []
      },

      async getOperatorList() {
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),                                  
          }
        }
        try {
          let temp = await getOperatorList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.operatorList = temp?.result
            this.operatorList.unshift({ code: '', id: '', name: 'All'})
            this.merchantId = this.operatorList?.[0]?.code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getGameList() {
        let tempType = undefined
        if(parseInt(sessionStorage.getItem('vendor_id'))===5) {
          tempType = 6
        } else if(parseInt(sessionStorage.getItem('vendor_id'))===1) {
          tempType = 8
        }
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),
            language: sessionStorage.getItem('language'),
            is_all: false,
            merchant_id: this.merchantId,   
            game_type: tempType,               
          }
        }
        try {
          let temp = await getGameList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.gameList = temp?.result
            this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
            this.gameId = this.gameList?.[0]?.game_code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getMonthlyReport() {
        const body = {
          data: {
            merchant_id: this.merchantId,  
            vendor_code: this.vendorCode,
            game_id: this.gameId,
            start_date: moment(this.dateYear).clone().startOf('year').format('YYYY-MM-DD'),
            end_date: moment(this.dateYear).clone().endOf('year').format('YYYY-MM-DD'),
          }
        }
        try {
          let temp = await getMonthlyReport(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.apiData = temp
            this.recordData = temp?.result
            this.summary = temp?.summary
            this.refundRecordData = temp?.refund_result
            this.refundSummary = temp?.refund_summary
            this.adjustRecordData = temp?.refund_adjust_result
            this.adjustSummary = temp?.refund_adjust_summary
            if(this.adjustSummary?.[0]?.total_win) this.adjustSummary[0].total_win = numberFormat(parseInt(this.adjustSummary[0]?.old_total_win) - parseInt(this.adjustSummary[0]?.total_win), 2)
            if(this.adjustSummary?.[0]?.win_lose) this.adjustSummary[0].win_lose = numberFormat(parseInt(this.adjustSummary[0]?.old_win_lose) - parseInt(this.adjustSummary[0]?.win_lose), 2)
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
            'route': '/api/monthlyReport',
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

      dataFormat() {
        let temp = {
          total_round: 0, 
          total_count: 0,
          total_people: 0,
        }
        objNumberFormat(this.summary)
        objNumberFormat(this.refundSummary)
        objNumberFormat(this.adjustSummary)
        objNumberFormat(this.recordData, temp)
        objNumberFormat(this.refundRecordData, temp)
        objNumberFormat(this.adjustRecordData, temp)
      },

      changeTableHeader() {
        switch(sessionStorage.getItem('vendor_code')) {
          case 'audere':
            this.colReport = [
              'date', 'merchant_id', 'game_code', 'currency', 'total_round', 
              'total_count', 'total_bet', 'total_win', 'win_lose', 'tax_amount', 
              'rtp', 'total_people', 'average_round_per_people', 'average_bet_per_round'
            ]
            this.colReport_child = [
              'space', 'date', 'merchant_id', 'game_code', 'currency', 
              'total_round', 'total_count', 'total_bet', 'total_win', 'win_lose', 
              'tax_amount', 'rtp', 'total_people', 'average_round_per_people', 'average_bet_per_round'
            ]

            this.colReportTwo = [
              'date', 'merchant_id', 'game_code', 'currency', 'total_count', 
              'total_bet', 'total_win', 'win_lose', 'tax_amount', 'rtp'
            ]
            this.colReportChildTwo = [
              'space', 'date', 'merchant_id', 'game_code', 'currency', 
              'total_count', 'total_bet', 'total_win', 'win_lose', 'tax_amount', 
              'rtp'
            ]

            this.optReport.headings = {              
              date: () => i18n.t('月份'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              currency: () => i18n.t('幣別'),
              total_round: () => i18n.t('總局數'),
              total_count: () => i18n.t('總注單數'),
              total_bet: () => i18n.t('總投注'),            
              total_win: () => i18n.t('總贏分'), 
              win_lose: () => i18n.t('總輸贏'),          
              tax_amount: () => i18n.t('總稅金'),
              rtp: () => i18n.t('RTP (%)'),
              total_people: () => i18n.t('會員數'),
              average_round_per_people: () => i18n.t('平均局數(每人)'),
              average_bet_per_round: () => i18n.t('平均投注額(每局)')
            }      
            this.adjustOptReport.headings = {              
              date: () => i18n.t('月份'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              currency: () => i18n.t('幣別'),
              total_count: () => i18n.t('總注單數'),
              total_bet: () => i18n.t('總投注'),            
              total_win: () => i18n.t('總贏分(調整前)'), 
              win_lose: () => i18n.t('總輸贏(調整前)'),          
              tax_amount: () => i18n.t('總稅金'),
              rtp: () => i18n.t('RTP (%)')
            }
            break

          case 'chess':
            this.colReport = [
              'date', 'merchant_id', 'game_code', 'currency', 'total_round', 
              'total_count', 'total_bet', 'total_win', 'win_lose', 'service_fee', 
              'jackpot', 'rtp', 'total_people', 'average_round_per_people', 'average_bet_per_round'
            ]
            this.colReport_child = [
              'space', 'date', 'merchant_id', 'game_code', 'currency', 
              'total_round', 'total_count', 'total_bet', 'total_win', 'win_lose', 
              'service_fee', 'jackpot', 'rtp', 'total_people', 'average_round_per_people', 'average_bet_per_round'
            ]

            this.colReportTwo = [
              'date', 'merchant_id', 'game_code', 'currency', 'total_count', 
              'total_bet', 'total_win', 'win_lose', 'service_fee', 'jackpot',
              'rtp'
            ]
            this.colReportChildTwo = [
              'space', 'date', 'merchant_id', 'game_code', 'currency', 
              'total_count', 'total_bet', 'total_win', 'win_lose', 'service_fee', 
              'jackpot', 'rtp'
            ]
            
            this.optReport.headings = {              
              date: () => i18n.t('月份'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              currency: () => i18n.t('幣別'),
              total_round: () => i18n.t('總局數'),
              total_count: () => i18n.t('總注單數'),
              total_bet: () => i18n.t('總投注'),            
              total_win: () => i18n.t('總贏分'), 
              win_lose: () => i18n.t('總輸贏'),          
              service_fee: () => i18n.t('服務費'),
              jackpot: () => i18n.t('彩金'),
              rtp: () => i18n.t('RTP (%)'),
              total_people: () => i18n.t('會員數'),
              average_round_per_people: () => i18n.t('平均局數(每人)'),
              average_bet_per_round: () => i18n.t('平均投注額(每局)'),
            }
            this.adjustOptReport.headings = {              
              date: () => i18n.t('月份'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              currency: () => i18n.t('幣別'),
              total_count: () => i18n.t('總注單數'),
              total_bet: () => i18n.t('總投注'),            
              total_win: () => i18n.t('總贏分(調整前)'), 
              win_lose: () => i18n.t('總輸贏(調整前)'),         
              service_fee: () => i18n.t('服務費'),
              jackpot: () => i18n.t('彩金'),
              rtp: () => i18n.t('RTP (%)')
            }
            break        
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

        // 把detail資料加到外層 讓excel匯出
        for(let item of this.recordData) {
          this.excelData.push(item)
          for (let j = 0; j < item?.detail?.length; j++) {
            this.excelData.push(item?.detail?.[j])
          }
        }

        let tempHeadList = [
          [
            i18n.t('月份'), i18n.t('平台商'), i18n.t('遊戲代碼'), i18n.t('幣別'), i18n.t('總局數'),  
            i18n.t('總注單數'), i18n.t('總投注'), i18n.t('總贏分'), i18n.t('總輸贏'), i18n.t('RTP'),
            i18n.t('會員數'), i18n.t('平均局數(每人)'), i18n.t('平均投注額(每局)'),
          ],
          [
            'date', 'merchant_id', 'game_code', 'currency', 'total_round', 
            'total_count', 'total_bet', 'total_win', 'win_lose', 'rtp',
            'total_people', 'average_round_per_people', 'average_bet_per_round'
          ]
        ]

        for(let i=0; i<tempHeadList[0].length; i++) {
          headRecord[0].push(tempHeadList[0][i])
          headRecord[1].push(tempHeadList[1][i])
          if(i===8) {
            if(this.vendorCode === 'chess') {
              headRecord[0].push(i18n.t('服務費'))
              headRecord[0].push(i18n.t('彩金'))
              headRecord[1].push('service_fee')
              headRecord[1].push('jackpot')
            } else {
              headRecord[0].push(i18n.t('總稅金'))
              headRecord[1].push('tax_amount')
            }
          }
        }

        this.excelData.forEach(item => { 
          // 視訊不顯示 服務費 彩金
          if(this.vendorCode === 'audere') {
            delete item['service_fee']
            delete item['jackpot']
          } 
          else if(this.vendorCode === 'chess') delete item['tax_amount']
          delete item['bet_status']
          delete item['Bet_status']
        }) 

        return headRecord
      }
    },

    watch: {
      '$i18n.locale'() {
        this.chartData = []
        this.setChartData()
        this.defaultChangeText = i18n.t('請選擇')
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

    async mounted() {
      await this.getOperatorList()
      await this.getGameList()
      this.changeTableHeader()
      this.dateYear = moment().format(this.dateFormat)
    },
}
</script>

<style lang="scss">
  .reportMonthly .VueTables__sort-icon::before {
    display: none;
  }

  .reportMonthly tr:first-child td:first-child {  
    pointer-events: none;
  }

  .reportMonthly .VueTables__child-row {
    > td:first-child {
      padding: 0;
    }
    thead {
      display: none;
    }
    .table-responsive {
      margin: 0;
    }
  }
  .reportMonthly tr:first-child .VueTables__child-row-toggler  {
    display: none;
  }
  
  .reportMonthly .table-hover tbody tr:hover {
    background-color: white;
  }

  .reportMonthly .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .totalText {
    color: #005792;
    font-weight: 300;
  }

  .numberRight {
    text-align: end;
  }

  .refundSummary,
  .refundRecordData {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    span {
      font-size: 1.25rem;
    }
  }

  .refundRecordData span {
      cursor: pointer;
      color: #005792;
  }

  .refundSummaryIcon,
  .refundRecordDataIcon {
    margin-left: 4px;
    font-size: 20px;
    cursor: pointer;
  }

  .arrowIcon {
    margin-right: 4px;
    font-size: 24px;
    line-height: 29px;
    color: #005792;
    cursor: pointer;
  }

  .refundRecordData {
    margin-bottom: 4px;
  }

  ///Summary class
  .summarymMerchantId {
    width: 14%;
  }

  .summarymCurrency {
    width: 7%;
  }

  .summarymBet {
    width: 14%;
  }

  .summarymWin {
    width: 14%;
  }

  .summarymWinLose {
    width: 14%;
  }

  .summarymServiceFee {
    width: 14%;
  }

  .summarymJackpot {
    width: 14%;
  }

  .summarymTax {
    width: 14%;
  }

  .summarymRtp {
    width: 9%;
  }

  // table class
  .spaceTable {
    width: 43px;
    min-width: 43px;
    max-width: 43px;
  }

  .dateTable {
    width: 110px;
    min-width: 110px;
    max-width: 110px;
    line-height: 22px;
  }

  .merchantIdTable {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    line-height: 22px;
  }

  .gameCodeTable {
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    line-height: 22px;
  }

  .currencyTable {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    line-height: 22px;
  }

  .totalRoundTable {
    text-align: end;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
    line-height: 22px;
  }

  .totalCountTable {
    text-align: end;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
    line-height: 22px;
  }

  .totalBetTable {
    text-align: end;
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    line-height: 22px;
  }

  .totalWinTable {
    text-align: end;
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    line-height: 22px;
  }

  .winLoseTable {
    text-align: end;
    width: 190px;
    min-width: 190px;
    max-width: 190px;
    line-height: 22px;
  }

  .taxAmountTable {
    text-align: end;
    width: 190px;
    min-width: 190px;
    max-width: 190px;
    line-height: 22px;
  }

  .serviceFeeTable {
    text-align: end;
    width: 190px;
    min-width: 190px;
    max-width: 190px;
    line-height: 22px;
  }

  .jackpotTable {
    text-align: end;
    width: 170px;
    min-width: 170px;
    max-width: 170px;
    line-height: 22px;
  }

  .rtpTable {
    text-align: end;
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    line-height: 22px;
  }

  .totalPeopleTable {
    text-align: end;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
    line-height: 22px;
  }

  .peopleAverageRound {
    text-align: end;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
    line-height: 22px;
  }

  .roundAverageBet {
    text-align: end;
    width: 130px;
    min-width: 130px;
    max-width: 130px;
    line-height: 22px;
  }
</style>