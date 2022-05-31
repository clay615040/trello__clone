<template lang="pug">
  .riskcontrol
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('風險控管')}</h4>`" customHeader)
      .row.mt-4.px-3
        .form-group.col-12.col-md-3.px-2
          label(for="selOperator") {{ $t('平台商') }}
          select#selOperator.form-control(v-model="merchantId" @change="getGameList()" :class="{ 'is-invalid': invalid.operator }")
            option(v-for="(value, key) in operatorList" :key="key" :value="value.code" :selected="merchantId") {{ value.name }}
        .form-group.col-12.col-md-3.px-2
          label(for="selGameId") {{ $t('遊戲代碼') }}
          select#selGameId.form-control(v-model="gameId")
            option(v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId") {{ value.game_name_lang + ' ' }}
              span(v-if="value.game_name_lang!=='All'") ({{ value.game_code }})
        .form-group.col-12.col-md-3.px-2
          label(for="txtTimePeriod") {{$t('時間區間')}}
          span.warn-text *
          span.warn-text(v-if="overTime") {{ overTimeText }}
          date-picker#txtTimePeriod(type="datetime" valueType="format" lang="en" range v-model="datePeriod" :format="dateFormat" :change="CHANGE_DATE()" :not-before="dateBefore" :input-class="{ 'form-control': true, 'is-invalid': invalid.timePeriod }" width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")
        .col-12.col-md.px-2.d-flex.align-items-end
          .form-group   
            b-button(type="button" variant="primary" :disabled="loading" @click="QUERY_RECORD(true)") {{ $t('搜尋') }}
    
    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    template(v-else)
      mt-3.mb-n4.px-0.pieChartGroup(v-if="pieChartData && pieChartData.length > 0" :fetchingData="loading")
        widget.col-12.col-md-6.pieChartGroupLeft
          .pieChartItem(v-for="(item, i) in summary" :key="i")
            .group
              .pieChartBall(:style="{ backgroundColor: colors[i] }")
              span {{item.rule_name}}
            span {{item.count}}
        pie-chart.col-12.col-md-6.pieChartGroupRight(:data="pieChartData" :labels="pieChartLabels" :fetchingData="pieChartData.length>0 && pieChartLabels.length>0")
      
      widget.mb-3
        v-client-table(name="tbRecord" :columns="colRecord" :options="optRecord" :data="resRecord" ref="tbRecord")
          template(v-slot:child_row="props")
            b {{ $t('規則描述') }} : {{ $t(props.row.rule_desc) }}
            b {{ $t('訊息文字') }} :
            json-view(:data="JSON.parse(props.row.messages)" rootKey="" :options="{maxDepth: 10}" :styles="{ arrowSize: '1px' }")
        div(v-if="resRecord.length > 0 && !loading")
          .float-right.mt-2
            b-pagination.pagination(v-model="pageNo" :total-rows="countRecord" :per-page="pageSize" @input="CHANGE_PAGE_RECORD()")
      
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
import { mapState, mapActions } from 'vuex'
import { JSONView } from 'vue-json-component'
import moment from 'moment'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Method from '@/mixins/method'
import Message from '@/mixins/message'
import PieChart from '@/pages/Dashboard/components/MainChart/PieChart'
import { getOperatorList, getGameList } from '@/services/service'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'RiskControl',
    components: { 
      'widget': Widget, 
      'date-picker': DatePicker,
      'json-view': JSONView,
      'pie-chart': PieChart,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: ['merchant_id', 'game_code', 'rule_code', 'rule_name', 'create_date'],
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
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {            
            'merchant_id': () => i18n.t('平台商'),
            'game_code': () => i18n.t('遊戲代碼'),
            'rule_code': () => i18n.t('告警規則代碼'),
            'rule_name': () => i18n.t('告警規則名稱'),
            'create_date': () => i18n.t('時間'),
          },
          sortable: [],
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
        pieChartData: [],
        pieChartLabels: [],
        colors: [ 
          '#005792', '#0D7ADD', '#1A9FE3', '#368195', '#3E98AF', 
          '#4BACC6', '#21AE8C', '#FD5F00', '#FDA700', '#FFC90E', 
          '#FFF606'
        ],
        operatorList: [],
        gameList: [],
        progressValue: 0,
        progressTime: function() { return '' },
        loading: false,
      }
    },

    computed: {
      ...mapState('riskControl', {          
        'countRecord': state => state.response.count_record,
        'pageRecord': state => state.response.page_record,
        'resRecord': state => state.response.record,
        'summary': state => state.response.summary,
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
      ...mapActions('riskControl', {
        'REQUEST_RECORD': 'request_record',
        'RESET_STATE': 'reset_state',
      }),
      
      async QUERY_RECORD(isReload) {
        this.init()

        for(let item in this.invalid) {
          if(this.invalid[item]) return;
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

        let _err = await this.REQUEST_RECORD(_para)
        
        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
          return
        }

        this.setPieChart()
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

      CHANGE_PAGE_RECORD() {
        this.pageSize = this.reqRecord.page_size
        this.merchantId = this.reqRecord.merchant_id
        this.vendorCode = this.reqRecord.vendor_code
        this.gameId = this.reqRecord.game_id
        this.datePeriod[0] = this.reqRecord.date_period[0]
        this.datePeriod[1] = this.reqRecord.date_period[1]
        
        this.QUERY_RECORD(false)
      },

      DATA_VALID(id) {
        switch(id) {
          case 'selOperator':
            if(!this.merchantId) {
              this.invalid['operator'] = true
            }
            else {
              this.invalid['operator'] = false
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

      setPieChart() {
        this.init()
        for(let item of this.summary) {
          if(item?.count && item?.rule_name) {
            this.pieChartData.push(item?.count)
            this.pieChartLabels.push(item?.rule_name)
          }
        }
      },

      init() {
        this.pieChartData = []
        this.pieChartLabels = []
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

      let _dateFormat = 'YYYY-MM-DD HH:mm:00'
      let _dateNow = new Date()
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600* 1000* 24* 3)
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)]
    },
    
    destroyed() {
      this.RESET_STATE()
    }
}
</script>

<style lang="scss">
  .riskcontrol .widgetControls {
    display: none;
  }

  .riskcontrol .pieChartGroup {
    display: flex;
  }

  .riskcontrol .pieChartGroupLeft {
    display: flex;
    justify-content: center;
    position: relative;
    font-weight: 600; 
    color: #444;
    font-size: 1.25rem;
    border-radius: 0.45rem 0 0 0.45rem;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: -10px;
      width: 50px;
      height: 100%;
      background-color: #fff;
      z-index: 2;
    }
  }

  .riskcontrol .pieChartGroupRight {
    border-radius: 0 0.45rem 0.45rem 0;
  }

  .riskcontrol .pieChartItem {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;

    .group {
      display: flex;
      align-items: center;
    }
    
    span {
      margin-right: 30px;
    }
  }

  .riskcontrol .pieChartBall {
    margin-right: 6px;
    width: 12px;
    height: 12px;
    border-radius: 100%;
  }

  .riskcontrol .VueTables__sort-icon::before,
  .riskcontrol .apexcharts-legend {
    display: none;
  }   
</style>
