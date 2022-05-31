<template lang="pug">
  .newAndOldMonthly
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('新舊會員押注統計 (日)')}</h4>`" customHeader)
      .row.mt-4.px-3
        .form-group.col-12.col-md-2.px-2
          label(for="txtYear") {{ $t('月份') }}
          span.warn-text *
          date-picker#txtMonth(type="month" v-model="dateMonth" valueType="format" :format="'YYYY-MM'" @change="searchReport()" :input-class="{'form-control': true, 'is-invalid': invalid.dateMonth }" :placeholder='defaultChangeText' width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")

    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    template(v-else)
      .div(xs="12" v-if="chartData && chartData.length > 0" v-for="(item, i) in chartData" :key="i")
        Widget(:title="$t(item.name)" close collapse customHeader class="mixedChartTitle")
          mixed-chart.chartMarginBottom(:chartData="item.arppuData" :chartOptions="arppuChartOptions")
          mixed-chart(:chartData="item.mixedData" :chartOptions="mixedChartOptions")
      
      widget.mb-3
        v-client-table(name="tbReport" :columns="colReport" :options="optReport" :data="newAndOldData" ref="tbReport")       
          template(v-if="newAndOldData && newAndOldData.length>1" v-slot:child_row="props")
            v-client-table(name="tbReport" :columns="childColReport" :options="optReport" :data="props.row.details" ref="tbReport")
      
    b-modal(v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" body-bg-variant="white" size="xs" centered)
      .text-center(v-if="modeMessage=='notice'")
        label {{ $t(message) }}
      template(v-slot:modal-footer)
        div(v-if="modeMessage=='notice'")
          b-button.btn-sm(variant="outline-primary" @click="showMessage=false") {{ $t('確認') }}
</template>

<script>
import moment from 'moment'
import { mapActions } from 'vuex'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import ColumnChart from '@/pages/Dashboard/components/MainChart/ColumnChart'
import mixedChart from '@/pages/Dashboard/components/MainChart/mixedChart'
import i18n from '@/locales'
import Message from '@/mixins/message'
import { getDailyNAOBettingCount, addVendorLog } from '@/services/service'
import { numberFormat, removeComma, getMenuId, getSubMenuId, setXaxis, numberToSiNumber } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
  name: 'newAndOldDaily',

  components: { 
    'widget': Widget,
    'column-chart': ColumnChart,
    'mixed-chart': mixedChart,
    'date-picker': DatePicker,
    VueCircleProgress,
  },

  data() {
    return {
      colReport: ['date', 'OperatorName', 'theOldUser', 'theNewUser', 'theOldPayUser', 'theNewPayUser', 'theOldUserBets', 'theNewUserBets', 'theOldUserBetsArppu', 'theNewUserBetsArppu'],
      childColReport: ['space', 'date', 'OperatorName', 'theOldUser', 'theNewUser', 'theOldPayUser', 'theNewPayUser', 'theOldUserBets', 'theNewUserBets', 'theOldUserBetsArppu', 'theNewUserBetsArppu'],
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
          id: 'width-100', theOldUser: 'numberRight', theNewUser: 'numberRight', theOldPayUser: 'numberRight', theNewPayUser: 'numberRight', 
          theOldUserBets: 'numberRight', theNewUserBets: 'numberRight', theOldUserBetsArppu: 'numberRight', theNewUserBetsArppu: 'numberRight'
        },
        skin: 'table table-striped table-hover',
        selectable:{
          mode: 'single',
          only: function(row) {
            return row
          },
          selectAllMode: 'all',
          programmatic: false,
        },
        headings: {
          'date': () => i18n.t('日期'),
          'OperatorName': () => i18n.t('平台商'),
          'theOldUser': () => i18n.t('舊會員總數'),
          'theNewUser': () => i18n.t('新會員總數'),
          'theOldPayUser': () => i18n.t('舊付費會員數'),
          'theNewPayUser': () => i18n.t('新付費會員數'),
          'theOldUserBets': () => i18n.t('舊會員押注額'),
          'theNewUserBets': () => i18n.t('新會員押注額'),
          'theOldUserBetsArppu': () => i18n.t('舊會員ARPPU'),
          'theNewUserBetsArppu': () => i18n.t('新會員ARPPU'),
        },
        uniqueKey: "date", 
        sortable: [],
      },
      dateMonth: '',
      procExport: false,
      invalid: {
        'dateMonth': false,
      },        
      modeMessage: '',
      message: '',
      showMessage: false,          
      logout: false,
      chartData: [],
      loading: false,
      defaultChangeText: i18n.t('請選擇'),
      newAndOldData: [],
      arppuChartOptions: {
        chart: {
          type: 'line',
          zoom: { 
            enabled: false
          },
          toolbar: {
            show: false,
            tools: {
              download: false,
            },
          }
        },
        stroke: {
          width: [2, 2]
        },
        xaxis: {
          type: 'category',
          labels: {
            show: true,
            datetimeFormatter: {
                year: 'yyyy',
                month: 'MMM',
                day: 'dd.MMM',
                hour: 'dd.MMM',
            },
            formatter(value, timestamp, opts) {
              return setXaxis(value)
            }
          },
        },
        yaxis: [
          {
            title: {
              text: i18n.t('金額'),
            },
            labels: {
              formatter(val) {
                return numberToSiNumber(val)
              }
            }
          }, 
          {
            show: false,
            seriesName: i18n.t('舊會員ARPPU'),
          }
        ],
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center', 
          showDuplicates: false,
          itemMargin: {
            horizontal: 5,
            vertical: 0
          },
        },
        tooltip: {
          y:{
            formatter(y) {
              return numberFormat(y, 2)
            }
          },
        },
        grid: {
          padding: {
            top: 0,
            right: 85,
            bottom: 0,
            left: 30
          },  
        },
        markers: {
          size: 5,
          hover: {
            size: 5,
          }
        }
      },
      mixedChartOptions: {
        chart: {
          type: 'line',
          zoom: { 
            enabled: false
          },
          toolbar: {
            show: false,
            tools: {
              download: false,
            },
          }
        },
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3E98AF'],
        stroke: {
          width: [2, 2, 2, 2, 0, 0]
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          type: 'category',
          labels: {
            show: true,
            datetimeFormatter: {
                year: 'yyyy',
                month: 'MMM',
                day: 'dd.MMM',
                hour: 'dd.MMM',
            },
            formatter(value, timestamp, opts) {
              return setXaxis(value)
            }
          },
        },
        yaxis: [
          {
            title: {
              text: i18n.t('人數'),
              style: {
                color: '#000',
              }
            },
            labels: {
              formatter: function (val) {
                return numberToSiNumber(val)
              }
            }
          }, 
          {
            show: false,
            seriesName: i18n.t('舊會員總數'),
          },
          {
            show: false,
            seriesName: i18n.t('舊會員總數'),
          }, 
          {
            show: false,
            seriesName: i18n.t('舊會員總數'),
          },
          {
            // 左右
            opposite: true,
            title: {
              text: i18n.t('金額'),
              style: {
                color: '#000',
              }
            },
            labels: {
              formatter: function (val) {
                return numberToSiNumber(val)
              }
            }
          },
          {
            show: false,
            seriesName: i18n.t('舊會員押注額'),
          }
        ],
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center', 
          showDuplicates: false,
          itemMargin: {
            horizontal: 5,
            vertical: 0
          },
        },
        tooltip: {
          y: [
            {
              formatter: function (y) {
                return numberFormat(y, 0)
              }
            },
            {
              formatter: function (y) {
                return numberFormat(y, 0)
              }
            },
            {
              formatter: function (y) {
                return numberFormat(y, 0)
              }
            },
            {
              formatter: function (y) {
                return numberFormat(y, 0)
              }
            },
            {
              formatter: function (y) {
                return numberFormat(y, 2)
              }
            },
            {
              formatter: function (y) {
                return numberFormat(y, 2)
              }
            }
          ],
        },
        markers: {
          size: 5,
          hover: {
            size: 5,
          }
        }
      },
      progressValue: 0,
      progressTime: function() { return '' },
    }
  },

  computed: {
    '$i18n.locale'() {
      this.defaultChangeText = i18n.t('請選擇')
    },
  },

  watch: {
    '$i18n.locale'() {
      this.init()
      this.arppuChartOptions.yaxis[0].seriesName = i18n.t('新會員ARPPU')
      this.arppuChartOptions.yaxis[0].title.text = i18n.t('金額')
      this.mixedChartOptions.yaxis[0].seriesName = i18n.t('新會員數')
      this.mixedChartOptions.yaxis[0].title.text = i18n.t('人數')
      this.mixedChartOptions.yaxis[4].seriesName = i18n.t('新會員押注額')
      this.mixedChartOptions.yaxis[4].title.text = i18n.t('金額')

      this.$nextTick(() => {
        this.setChartData()
      })
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

    async searchReport() {
      this.loading = true
      this.progressTime = window.setInterval(() => {
        this.progressValue = this.progressValue + 1.5
        this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
      }, 1000)

      this.init()
      await this.getDailyNAOBettingCount()
      this.setChartData()
      this.dataFormat()

      window.clearInterval(this.progressTime)
      this.$refs.vueCircle?.$children[0].updateProgress(100)
      window.setTimeout(() => {
        this.loading = false
      }, 1250)
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
    async getDailyNAOBettingCount() {
      let tempYear = this.dateMonth.split('-')[0]
      let tempMonth = this.dateMonth.split('-')[1]
      const body = {
        data: {        
          year: tempYear, 
          month: tempMonth,
          id_vendor: sessionStorage.getItem('vendor_id')?.toString()
        }
      }
      try {
        let temp = await getDailyNAOBettingCount(body)
        if (temp.code !== 1000) {
          this.SHOW_MESSAGE(temp.code, Message[temp.code])
        } else {
          this.newAndOldData = temp.result
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
          'route': '/api/getDailyNAOBettingCount',
          'request': JSON.stringify(body.data),
          'response': JSON.stringify(this.newAndOldData)
        }
      }
      try {
        await addVendorLog(body1)
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    setChartData() {
      this.chartData = []
      let tempDataList = []
      let tempList = JSON.parse(JSON.stringify(this.newAndOldData))
      if(tempList?.length > 1) tempList.shift()

      tempList.forEach(item => {
        item.details?.forEach(node => {
          let temp = false
          for (let i = 0; i <= this.chartData.length; i++) {
            if(this.chartData[i]?.name === node.OperatorName) {
              return
            }
            else temp = true
          }
          if(temp) this.chartData.push({ name: node.OperatorName, mixedData: [], arppuData: [] })
        })
        tempDataList.push(item.date)
      })

      tempDataList = [...new Set(tempDataList)]
      this.chartData.sort((a, b) => a.name.localeCompare(b.name))

      this.chartData.forEach(info => {
        info.mixedData.push(
          { data: [], type: 'line', name: i18n.t('舊會員總數') },
          { data: [], type: 'line', name: i18n.t('新會員總數') },
          { data: [], type: 'line', name: i18n.t('舊付費會員數') },
          { data: [], type: 'line', name: i18n.t('新付費會員數') },
          { data: [], type: 'column', name: i18n.t('舊會員押注額') },
          { data: [], type: 'column', name: i18n.t('新會員押注額') },
        )

        info.arppuData.push(
          { data: [], type: 'line', name: i18n.t('舊會員ARPPU') },
          { data: [], type: 'line', name: i18n.t('新會員ARPPU') },
        )

        tempList.forEach(item => {
          item.details?.forEach(node => {
            if(info.name === node.OperatorName) {
              info.mixedData[0].data.push({x: item.date, y: removeComma(node.theOldUser?.toString())})
              info.mixedData[1].data.push({x: item.date, y: removeComma(node.theNewUser?.toString())})
              info.mixedData[2].data.push({x: item.date, y: removeComma(node.theOldPayUser?.toString())})
              info.mixedData[3].data.push({x: item.date, y: removeComma(node.theNewPayUser?.toString())})
              info.mixedData[4].data.push({x: item.date, y: removeComma(node.theOldUserBets?.toString())})
              info.mixedData[5].data.push({x: item.date, y: removeComma(node.theNewUserBets?.toString())})
              info.arppuData[0].data.push({x: item.date, y: removeComma(node.theOldUserBetsArppu?.toString())})
              info.arppuData[1].data.push({x: item.date, y: removeComma(node.theNewUserBetsArppu?.toString())})
            }
          })
        })
      })
    },

    dataFormat() {
      this.newAndOldData?.forEach(item => {
        item.theOldUser = numberFormat(item?.theOldUser, 0)
        item.theNewUser = numberFormat(item?.theNewUser, 0)
        item.theOldPayUser = numberFormat(item?.theOldPayUser, 0)
        item.theNewPayUser = numberFormat(item?.theNewPayUser, 0)
        item.theOldUserBets = numberFormat(item?.theOldUserBets, 2)
        item.theNewUserBets = numberFormat(item?.theNewUserBets, 2)
        item.theOldUserBetsArppu = numberFormat(item?.theOldUserBetsArppu, 2)
        item.theNewUserBetsArppu = numberFormat(item?.theNewUserBetsArppu, 2)

        item?.details?.forEach(node => {
          node.theOldUser = numberFormat(node?.theOldUser, 0)
          node.theNewUser = numberFormat(node?.theNewUser, 0)
          node.theOldPayUser = numberFormat(node?.theOldPayUser, 0)
          node.theNewPayUser = numberFormat(node?.theNewPayUser, 0)
          node.theOldUserBets = numberFormat(node?.theOldUserBets, 2)
          node.theNewUserBets = numberFormat(node?.theNewUserBets, 2)
          node.theOldUserBetsArppu = numberFormat(node?.theOldUserBetsArppu, 2)
          node.theNewUserBetsArppu = numberFormat(node?.theNewUserBetsArppu, 2)
        })
      })
    },

    init() {
      this.chartData = []
    },
  },

  async mounted() {
    this.dateMonth = moment(new Date()).format('YYYY-MM')

    await this.searchReport()
  },
}
</script>

<style lang="scss">
  .newAndOldMonthly tr:first-child .VueTables__child-row-toggler  {
    display: none;
  }

  .newAndOldMonthly .VueTables__sort-icon::before {
    display: none;
  }

  .newAndOldMonthly .chartStyle {
    overflow-x: scroll;
  }

  .newAndOldMonthly .widgetControls {
    display: none;
  }

  .highLight {
    padding: 4px 12px;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .5rem;
    color: #fff;
    font-size: 14px;
    font-weight: 300;
    line-height: 21px;
    background-color: #21ae8c;
  }

  .newAndOldMonthly .fontWeight {
    font-weight: 600;
  }

  .newAndOldMonthly .VueTables__child-row {
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

  .newAndOldMonthly tr th,
  .newAndOldMonthly .VueTables__row td{
    &:nth-last-child(1) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(2) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(3) {
      max-width: 12%;
      min-width: 12%;
      width: 12%;
    }
    &:nth-last-child(4) {
      max-width: 12%;
      min-width: 12%;
      width: 12%;
    }
    &:nth-last-child(5) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(6) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(7) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(8) {
      max-width: 8%;
      min-width: 8%;
      width: 8%;
    }
    &:nth-last-child(9) {
      max-width: 11%;
      min-width: 11%;
      width: 11%;
    }
    &:nth-last-child(10) {
      max-width: 7%;
      min-width: 7%;
      width: 7%;
    }
  }

  .newAndOldMonthly .table-hover tbody tr:hover {
    background-color: white;
  }

  .newAndOldMonthly .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .newAndOldMonthly .vue-treeselect__control {
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
    max-height: 33.5px;
  }

  .newAndOldMonthly #selPermission.error {
    .vue-treeselect__control {
      border-color: red;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23FD5F00' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23FD5F00' stroke='none'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  }

  .newAndOldMonthly .vue-treeselect__placeholder {
    font-size: 1rem;
    font-weight: 300;
    color: #495057;
  }

  .numberRight {
    text-align: end;
  }

  .mixedChartTitle {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .chartMarginBottom {
    margin-bottom: 50px;
  }

</style>

