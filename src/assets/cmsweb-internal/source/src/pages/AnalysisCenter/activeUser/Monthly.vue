<template lang="pug">
  .activeUserMonthly
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('月活躍用戶 (MAU)')}</h4>`" customHeader)
      .row.mt-4.px-3
        .form-group.col-12.col-md-2.px-2
          label(for="txtYear") {{ $t('年份') }}
          span.warn-text *
          date-picker#txtYear(type="year" v-model="dateYear" valueType="format" :format="'YYYY'" @change="searchReport()" :input-class="{'form-control': true, 'is-invalid': invalid.dateYear }" :placeholder='defaultChangeText' width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")

    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    template(v-else)
      .chartClass(xs="12" v-if="chartData && chartData.length > 0" v-for="item in chartData")
        column-chart(:chartData="item.data" :title="item.name" :stacked="false")
      
      widget.mb-3
        v-client-table(name="tbReport" :columns="colReport" :options="optReport" :data="activeUserData" ref="tbReport")       
          template(v-slot:child_row="props")
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
import i18n from '@/locales'
import Message from '@/mixins/message'
import { getMonthlyActiveUser, addVendorLog } from '@/services/service'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
  name: 'activeUserMonthly',

  components: { 
    'widget': Widget,
    'column-chart': ColumnChart,
    'date-picker': DatePicker,
    VueCircleProgress,
  },

  data() {
    return {
      colReport: ['date', 'OperatorName', 'theNoDuplicateUser', 'theNewUser'],
      childColReport: ['space', 'date', 'OperatorName', 'theNoDuplicateUser', 'theNewUser'],
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
          id: 'width-100', theNoDuplicateUser: 'numberRight', theNewUser: 'numberRight'
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
          'date': () => i18n.t('月份'),
          'OperatorName': () => i18n.t('平台商'),
          'theNoDuplicateUser': () => i18n.t('進入人數(不含重複的玩家)'),
          'theNewUser': () => i18n.t('新會員數'),
        },
        uniqueKey: "date", 
        sortable: [],
      },
      dateYear: '',
      procExport: false,
      invalid: {
        'dateYear': false,
      },        
      modeMessage: '',
      message: '',
      showMessage: false,          
      logout: false,
      chartData: [],
      loading: false,
      defaultChangeText: i18n.t('請選擇'),
      activeUserData: [],
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
      this.setChartData()
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
      await this.getMonthlyActiveUser()
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

    async getMonthlyActiveUser() {
      const body = {
        data: {        
          year: this.dateYear,
          id_vendor: sessionStorage.getItem('vendor_id')?.toString()
        }
      }
      try {
        let temp = await getMonthlyActiveUser(body)
        this.activeUserData = temp.result
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
          'route': '/api/getMonthlyActiveUser',
          'request': JSON.stringify(body.data),
          'response': JSON.stringify(this.activeUserData)
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
      let tempDataList = []
      let tempList = JSON.parse(JSON.stringify(this.activeUserData))
      if(tempList?.length > 1) tempList.shift()

      tempList.forEach(item => {
        item.details?.forEach(node => {
          let temp = true
          for (let i = 0; i <= this.chartData.length; i++) {
            if(this.chartData[i]?.name === node.OperatorName) {
              return
            }
          }
          if(temp) this.chartData.push({'name': node.OperatorName, 'data': []})
        })
        tempDataList.push(item.date)
      })

      tempDataList = [...new Set(tempDataList)]
      this.chartData.sort((a, b) => a.name.localeCompare(b.name))

      this.chartData.forEach(info => {
        info.data.push({data: [], name: i18n.t('進入人數(不含重複的玩家)')}, {data: [], name: i18n.t('新會員數')})

        tempList.forEach(item => {
          item.details?.forEach(node => {
            if(info.name === node.OperatorName) {
              info.data[0].data.push({x: item.date, y: parseInt(node.theNoDuplicateUser)})
              info.data[1].data.push({x: item.date, y: parseInt(node.theNewUser)})
            }
          })
        })
      })
    },

    dataFormat() {
      this.activeUserData?.forEach(item => {
        item.theNoDuplicateUser = numberFormat(item?.theNoDuplicateUser, 0)
        item.theNewUser = numberFormat(item?.theNewUser, 0)

        item?.details?.forEach(node => {
          node.theNoDuplicateUser = numberFormat(node?.theNoDuplicateUser, 0)
          node.theNewUser = numberFormat(node?.theNewUser, 0)
        })
      })
    },

    init() {
      this.chartData = []
    },

    CHANGE_DATE() {
      if(!this.dateYear) {
        this.invalid['dateYear'] = true
      }
      else {
        this.invalid['dateYear'] = false
      }
    },  
  },

  mounted() {
    this.dateYear = moment().format('YYYY')

    this.searchReport()
  },
}
</script>

<style lang="scss">
  .activeUserMonthly tr:first-child .VueTables__child-row-toggler  {
    display: none;
  }

  .activeUserMonthly .VueTables__sort-icon::before {
    display: none;
  }

  .activeUserMonthly .chartStyle {
    overflow-x: scroll;
  }

  .activeUserMonthly .widgetControls {
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

  .activeUserMonthly .fontWeight {
    font-weight: 600;
  }

  .activeUserMonthly .VueTables__child-row {
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

  .activeUserMonthly tr th,
  .activeUserMonthly .VueTables__row td{
    &:nth-last-child(1) {
      max-width: 25%;
      min-width: 25%;
      width: 25%;
    }
    &:nth-last-child(2) {
      max-width: 25%;
      min-width: 25%;
      width: 25%;
    }
    &:nth-last-child(3) {
      max-width: 25%;
      min-width: 25%;
      width: 25%;
    }
    &:nth-last-child(4) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
  }

  .activeUserMonthly .table-hover tbody tr:hover {
    background-color: white;
  }

  .activeUserMonthly .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .activeUserMonthly .vue-treeselect__control {
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
    max-height: 33.5px;
  }

  .activeUserMonthly #selPermission.error {
    .vue-treeselect__control {
      border-color: red;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23FD5F00' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23FD5F00' stroke='none'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  }

  .activeUserMonthly .vue-treeselect__placeholder {
    font-size: 1rem;
    font-weight: 300;
    color: #495057;
  }

  .activeUserMonthly .chartClass {
    width: 100%;
  }

  .numberRight {
    text-align: end;
  }

</style>

