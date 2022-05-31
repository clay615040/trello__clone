<template lang="pug">
  .monthlyBoardGameRevenue
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('開桌營收報表 (月)')}</h4>`" customHeader :fetchingData="false")
      .row.mt-4.px-3
        .form-group.col-12.col-md-3.px-2
          label(for="txtYear") {{ $t('年份') }}
          span.warn-text *
          date-picker#txtYear(
            type="year" v-model="dateYear" valueType="format"
            :format="dateFormat" :change="CHANGE_DATE()"                
            :input-class="{ 'form-control': true, 'is-invalid': invalid.dateYear }"
            :placeholder='defaultChangeText'
            width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")
        .form-group.col-12.col-md-3.px-2
          label(for="selVendorCode") {{ $t('平台商') }}
          select#selVendorCode.form-control(v-model="merchantId" @change="getGameList()")
            option(v-for="(value, key) in operatorList" :key="key" :value="value.code") {{ value.name }}
        .form-group.col-12.col-md-3.px-2
          label(for="selGameCode") {{ $t('遊戲代碼') }}
          select#selGameCode.form-control(v-model="gameCode")
            option(v-for="(value, key) in gameList" :key="key" :value="value.game_code") {{ value.game_name_lang + ' ' }}
              span(v-if="value.game_name_lang!=='All'") ({{ value.game_code }})
        .form-group.col-12.col-md.px-2.d-flex.align-items-end
          b-button(type="button" variant="primary" :disabled="false" @click="search()") {{ $t('搜尋') }}

    widget.mt-5.mb-4(v-if="summary && summary.length>0" title="<h5><span class='fw-semi-bold'>Summary</span></h5>" customHeader)
      .table-resposive.mt-4
        table.table
          thead
            tr
              th.hidden-sm-down {{ $t('平台商') }}
              th.hidden-sm-down {{ $t('幣別') }}
              th.hidden-sm-down.numberRight {{ $t('開桌成功筆數') }}
              th.hidden-sm-down.numberRight {{ $t('扣點成功筆數') }}
              th.hidden-sm-down.numberRight {{ $t('總扣點') }}

          tbody
            tr(v-for="(row, index) in summary" :key="index")
              td {{ row.merchant_id }}
              td {{ row.currency }}
              td.numberRight {{ row.success_create_count }}
              td.numberRight {{ row.success_cost_count }}
              td.numberRight {{ row.total_cost_money }}

    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    template(v-else)
      .mt-3.mb-n4.px-0(xs="12" v-if="chartData && chartData.length > 0")
        line-chart(:data="chartData" chartHeight="500")

      widget.mb-3
        .mb-2(v-if="recordData && recordData.length>1")     
          b-button(type="button" variant="outline-primary" @click="EXPORT_REPORT()" :disabled="procExport")
            span(v-if="!procExport") {{ $t('匯出') }}
            span(v-else)
              i.fa.fa-spinner.fa-spin.fa-fw

        v-client-table(name="tbReport" :columns="colReport" :options="optReport" :data="recordData" ref="tbReport")
          template(v-if="hasDetail" v-slot:child_row="props")
            v-client-table(name="tbReport" :columns="colReport_child" :options="optReport" :data="props.row.detail" ref="tbReport")

    b-modal(v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" body-bg-variant="white" size="xs" centered)
      .text-center(v-if="modeMessage=='notice'")
        label {{ $t(message) }}
      .text-center(v-if="modeMessage=='confirm'")
        label {{ $t(message) }} [ {{ account }} ]
      template(v-slot:modal-footer)
        div(v-if="modeMessage=='notice'")
          b-button.btn-sm(variant="outline-primary" @click="showMessage=false") {{ $t('確認') }}
        div(v-if="modeMessage=='confirm'")
          b-button.btn-sm.mr-2(variant="outline-primary" @click="SUBMIT_DELETE()") {{ $t('確認') }}
          b-button.btn-sm(variant="outline-secondary" @click="showMessage=false") {{ $t('取消') }}
</template>

<script>
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import LineChart from '@/pages/Dashboard/components/MainChart/LineChart'
import i18n from '@/locales'
import Message from '@/mixins/message'
import XLSX from 'xlsx'
import { getOperatorList, getGameList, getBoardGameRevenue, addVendorLog } from '@/services/service'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'MonthlyBoardGameRevenue',
    
    components: { 
      'widget': Widget,
      'line-chart': LineChart,
      'date-picker': DatePicker,
      'excel': XLSX,
      VueCircleProgress,
    },

    data() {
      return {
        colReport: [
          'create_time', 'merchant_id', 'game_code', 'currency', 'success_create_count', 'success_cost_count', 'total_cost_money'
        ],
        colReport_child: [
          'space', 'space', 'merchant_id', 'game_code', 'currency', 'success_create_count', 'success_cost_count', 'total_cost_money'
        ],
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
            id: 'width-100', success_create_count: 'numberRight', success_cost_count: 'numberRight', total_cost_money: 'numberRight'
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {
            'create_time': () => i18n.t('月份'),
            'merchant_id': () => i18n.t('平台商'),
            'game_code': () => i18n.t('遊戲代碼'),
            'currency': () => i18n.t('幣別'),
            'success_create_count': () => i18n.t('開桌成功筆數'),
            'success_cost_count': () => i18n.t('扣點成功筆數'),                    
            'total_cost_money': () => i18n.t('總扣點'),                    
          },          
          cellClasses: {
            create_time: [
              {
                class:'totalText',
                condition: row => row.create_time === 'Total'
              }
            ]
          },
          uniqueKey: 'create_time',
        },
        merchantId: '',
        vendorCode: sessionStorage.getItem('vendor_code'),
        gameCode: '',
        dateYear: '',
        dateFormat: 'YYYY',
        procExport: false,
        hasDetail: true,
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
              'Nov', 'Dec'
        ],
        defaultChangeText: i18n.t('請選擇'),
        operatorList: [],
        gameList: [],
        recordData: [],
        summary: [],
        loading: false,
        res: [],
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    methods: {
      async EXPORT_REPORT() {
        this.procExport = true

        let summaryHeadName = [
          i18n.t('平台商'), i18n.t('遊戲商'), i18n.t('幣別'), i18n.t('開桌成功筆數'), i18n.t('扣點成功筆數'), i18n.t('總扣點')
        ]

        let headName = [
          i18n.t('日期'), i18n.t('平台商'), i18n.t('遊戲代碼'), i18n.t('幣別'),
          i18n.t('開桌成功筆數'), i18n.t('扣點成功筆數'), i18n.t('總扣點')
        ]

        let temp = []
        for(let item of this.recordData) {
          temp.push(item)
          for (let j = 0; j < item?.detail?.length; j++) {
            temp.push(item?.detail?.[j])
          }
        }

        var csvData = temp.map(node => ({
          create_time: node?.create_time, 
          merchant_id: node?.merchant_id,
          game_code: node?.game_code, 
          currency: node?.currency,
          success_create_count: node?.success_create_count, 
          success_cost_count: node?.success_cost_count, 
          total_cost_money: node?.total_cost_money, 
        }))

        let summary = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(summary, [summaryHeadName])
        XLSX.utils.sheet_add_json(summary, this.summary, { origin: 'A2', skipHeader: true }) 

        let record = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(record, [headName])
        XLSX.utils.sheet_add_json(record, csvData, { origin: 'A2', skipHeader: true })       
      
        let fileName = i18n.t('開桌營收報表 (月)') + '_' + moment(this.dateYear).format('YYYY') + '_' + process.env.NODE_ENV +'.xlsx'
        let workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, summary, 'summary')        
        XLSX.utils.book_append_sheet(workbook, record, 'list')        
        XLSX.writeFile(workbook, fileName)

        this.procExport = false
      },   

      CHANGE_DATE() {
        if(!this.dateYear) {
          this.invalid['dateYear'] = true;
        }
        else {
          this.invalid['dateYear'] = false;
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
      },
      
      setchartData() {
        let colorIndex = 0
        let colorList = [
          '#005792', '#FF69B4', '#FDA700', '#002B49', '#FF0000', 
          '#00FFFF', '#00FF7F', '#ffff00', '#00ff00', '#0000ff', 
          '#ff00ff', '#000000', '#808080', '#008000', '#800000', 
          '#000080', '#808000', '#800080', '#c0c0c0', '#ffffff', 
          '#008080'
        ]

        this.recordData.forEach(item => {
          let hasItem = false
          for(let node of this.chartData) {
            if(item.merchant_id === node.merchant_id && item.game_code === node.game_code) {
              node.data.push([Date.parse(item?.create_time), parseInt(item.total_cost_money)])
              hasItem = true
            }
          }

          if(!this.hasDetail && !hasItem && item.create_time !== 'Total') {
            let newItem = {
              type: 'spline',
              name: item.vendor_code + ' ' + item.game_code + ' ' + i18n.t('總扣點'),
              data: [[Date.parse(item?.create_time), parseInt(item.total_cost_money)]],
              color: colorList[colorIndex],
              merchant_id: item.merchant_id,
              vendor_code: item.vendor_code,
              game_code: item.game_code
            }

            this.chartData.push(newItem)
            colorIndex = colorIndex + 1
          }

          item.detail?.forEach(detail => {
            hasItem = false

            for(let node of this.chartData) {
              if(detail.merchant_id === node.merchant_id && detail.game_code === node.game_code) {
                node.data.push([Date.parse(item?.create_time), parseInt(detail.total_cost_money)])
                hasItem = true
              }
            }

            if(!hasItem) {
              let newItem = {
                type: 'spline',
                name: detail.merchant_id + ' ' + detail.game_code + ' ' + i18n.t('總扣點'),
                data: [[Date.parse(item?.create_time), parseInt(detail.total_cost_money)]],
                color: colorList[colorIndex],
                merchant_id: detail.merchant_id,
                vendor_code: detail.vendor_code,
                game_code: detail.game_code
              }

              this.chartData.push(newItem)
              colorIndex = colorIndex + 1
            }
          })
        })
      },

      init() {
        this.chartData = []
        this.recordData = []
        this.summary= []
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
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),
            language: sessionStorage.getItem('language'),
            is_all: false,
            merchant_id: this.merchantId,                                  
            game_type: 9
          }
        }
        try {
          let temp = await getGameList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.gameList = temp?.result
            this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
            this.gameCode = this.gameList?.[0]?.game_code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getBoardGameRevenue() {
        const body = {
          data: {
            merchant_id: this.merchantId,
            game_code: this.gameCode,
            start_date: this.dateYear + '-01-01',
            end_date: this.dateYear + '-12-31',
            date_type: 2,
            vendor_code: sessionStorage.getItem('vendor_code'),
          }
        }
        try {
          let temp = await getBoardGameRevenue(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            if(temp.result.length>0) temp.result[0].detail = []
            this.recordData = temp?.result
            this.summary = temp?.summary
            this.res = temp
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
            'route': '/api/getBoardGameRevenue',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.res)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async search() {
        if(this.invalid.dateYear) return

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        if(!this.merchantId || !this.gameCode) this.hasDetail = true
        else this.hasDetail = false
        
        this.init()
        await this.getBoardGameRevenue()
        this.setchartData()
        this.formatRecordData()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },

      formatRecordData() {
        this.recordData?.forEach(item => {
          item.success_create_count = numberFormat(item?.success_create_count, 0)
          item.success_cost_count = numberFormat(item?.success_cost_count, 0)
          item.total_cost_money = numberFormat(item?.total_cost_money, 2)

          item?.detail?.forEach(node => {
            node.success_create_count = numberFormat(node?.success_create_count, 0)
            node.success_cost_count = numberFormat(node?.success_cost_count, 0)
            node.total_cost_money = numberFormat(node?.total_cost_money, 2)
          })
        })

        this.summary?.forEach(item => {
          item.success_create_count = numberFormat(item?.success_create_count, 0)
          item.success_cost_count = numberFormat(item?.success_cost_count, 0)
          item.total_cost_money = numberFormat(item?.total_cost_money, 2)
        })
      },
    },

    watch: {
      '$i18n.locale'() {
        this.chartData = []
        this.setchartData()
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
      this.dateYear = moment().format(this.dateFormat)

      await this.getOperatorList()
      await this.getGameList()
    },
}
</script>

<style lang="scss">
  .monthlyBoardGameRevenue .VueTables__sort-icon::before {
    display: none;
  }

  .monthlyBoardGameRevenue tr:first-child td:first-child {  
    pointer-events: none;
  }

  .monthlyBoardGameRevenue .VueTables__row td:first-child{  
    min-width: 30px;
  }

  .monthlyBoardGameRevenue .VueTables__child-row {
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
  .monthlyBoardGameRevenue tr:first-child .VueTables__child-row-toggler  {
    display: none;
  }
  
  .monthlyBoardGameRevenue .table-hover tbody tr:hover {
    background-color: white;
  }

  .monthlyBoardGameRevenue .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .totalText {
    color: #005792;
    font-weight: 300;
  }

  .monthlyBoardGameRevenue .VueTables__table th,
  .monthlyBoardGameRevenue .VueTables__row td {
    &:nth-last-child(1) {
      max-width: 16%;
      min-width: 16%;
      width: 16%;
    }
    &:nth-last-child(2) {
      max-width: 16%;
      min-width: 16%;
      width: 16%;
    }
    &:nth-last-child(3) {
      max-width: 16%;
      min-width: 16%;
      width: 16%;
    }
    &:nth-last-child(4) {
      max-width: 5%;
      min-width: 5%;
      width: 5%;
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
      max-width: 12%;
      min-width: 12%;
      width: 12%;
    }
  }

  .numberRight {
    text-align: end;
  }
  
</style>