<template lang="pug">
  .betAreaMonthly
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('遊戲下注區熱門度 (月)')}</h4>`" customHeader)
      .row.mt-4.px-3
        .form-group.col-12.col-md-3.px-2
          label(for="txtYear") {{ $t('年份') }}
          span.warn-text *
          date-picker#txtYear(type="year" v-model="dateYear" valueType="format" :format="'YYYY'" :change="CHANGE_DATE()" :input-class="{ 'form-control': true, 'is-invalid': invalid.dateYear }" :placeholder='defaultChangeText' width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")
        .form-group.col-12.col-md-3.px-2
          label(for="selOperator") {{ $t('平台商') }}
          span.warn-text *
          select#selOperator.form-control(v-model="merchantId" @change="changeOperatorList()" :class="{ 'is-invalid': invalid.operator }")
            option(v-for="(value, key) in operatorList" :key="key" :value="value.code" :selected="merchantId") {{ value.name }}      
        .form-group.col-12.col-md-3.px-2
          label(for="selGameId") {{ $t('遊戲代碼') }}
          span.warn-text *
          select#selGameId.form-control(v-model="gameId" @change="getBetAreaList()" :class="{ 'is-invalid': invalid.gameId }")
            option(v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId") {{ value.game_name_lang + ' ' }}
              span(v-if="value.game_name_lang!=='All'") ({{ value.game_code }})
        .form-group.col-12.col-md-3.px-2
          label(for="selGameId") {{ $t('下注區') }}
          span.warn-text *
          tree-select#selPermission(v-model="betItem" :multiple="true" :options="betList" :limit="3" :normalizer="normalizer" v-on:input="limiter" :class="{ 'error': invalid.betItem }" value-consists-of="LEAF_PRIORITY" :placeholder="defaultText")
        .form-group.col-12.col-md.px-2.d-flex.align-items-end
          b-button(type="button" variant="primary" :disabled="false" @click="QUERY_REPORT(true)") {{ $t('搜尋') }}
    
    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    template(v-else)
      .mt-3.mb-n4.px-0(xs="12" v-if="chartData && chartData.length > 0")
        column-chart.chartStyle(:chartData="chartData" :stacked="true")

      widget.mb-3
        v-client-table(name="tbReport" :columns="colReport" :options="optReport" :data="betData" ref="tbReport")
          //highlight
          template(v-for="item in highLightList" :slot="item.row" slot-scope="props")            
            div(v-if="props.row[item.highlight]")
              span.highLight {{ props.row[item.row] }}
            div(v-else) {{ props.row[item.row] }}
          template(v-slot:child_row="props")
            v-client-table(name="tbReport" :columns="childColReport" :options="optReport" :data="props.row.detail" ref="tbReport") 
              //highlight
              template(v-for="item in highLightList" :slot="item.row" slot-scope="props")            
                div(v-if="props.row[item.highlight]")
                  span.highLight {{ props.row[item.row] }}
                div(v-else) {{ props.row[item.row] }}
                
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
import { mapActions } from 'vuex'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import ColumnChart from '@/pages/Dashboard/components/MainChart/ColumnChart'
import i18n from '@/locales'
import Message from '@/mixins/message'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import axios from 'axios'
import md5 from 'js-md5'
import { numberFormat, getMenuId, getSubMenuId, removeComma } from '@/helper'
import { getOperatorList, getGameList } from '@/services/service'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
  name: 'betAreaPopularityMonthly',

  components: { 
    'widget': Widget,
    'column-chart': ColumnChart,
    'date-picker': DatePicker,
    'tree-select': Treeselect,
    VueCircleProgress,
  },

  data() {
    return {
      colReport: ['month', 'merchant_id', 'game_code', 'bet_area', 'bet_count', 'win_count', 'total_bet', 'total_win', 'win_lose'],
      childColReport: ['space', 'month', 'merchant_id', 'game_code', 'bet_area', 'bet_count', 'win_count', 'total_bet', 'total_win', 'win_lose'],
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
          id: 'width-100', bet_count: 'numberRight', win_count: 'numberRight', total_bet: 'numberRight', total_win: 'numberRight',
          win_lose: 'numberRight'
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
          'month': () => i18n.t('月份'),
          'merchant_id': () => i18n.t('平台商'),
          'game_code': () => i18n.t('遊戲代碼'),
          'bet_area': () => i18n.t('下注區'),
          'bet_count': () => i18n.t('總下注次數'),
          'win_count': () => i18n.t('總開獎次數'),
          'total_bet': () => i18n.t('總投注'),
          'total_win': () => i18n.t('總贏分'),
          'win_lose': () => i18n.t('總輸贏'),
        },
        uniqueKey: "id", 
        sortable: [],
      },
      merchantId: '',
      vendorCode: sessionStorage.getItem('vendor_code'),
      gameId: '',
      dateYear: '',
      procExport: false,
      invalid: {
        'dateYear': false,
        'operator': false,
        'gameId': false,
        'betItem': false,
      },        
      modeMessage: '',
      message: '',
      showMessage: false,          
      logout: false,
      betList: [],
      betItem: [],
      betData: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.desc,
          children: node.children,
        }
      },
      defaultText: i18n.t('請選擇 (至多15項)'),
      defaultChangeText: i18n.t('請選擇'),
      chartData: [],
      loading: false,
      highLightList: [
        { row: 'bet_count', highlight: 'highlight_betCount' },
        { row: 'win_count', highlight: 'highlight_winCount' },
        { row: 'win_lose', highlight: 'highlight_winLose' },
      ],
      operatorList: [],
      gameList: [],
      progressValue: 0,
      progressTime: function() { return '' },
    }
  },

  watch: {
    '$i18n.locale'() {
      this.defaultText = i18n.t('請選擇 (至多15項)')
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

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('operator', {
      'REQUEST_OPERATOR': 'request_list'
    }),
    ...mapActions('game', {
      'REQUEST_GAMES': 'request_list'
    }),

    async QUERY_REPORT() {
      if(!this.merchantId || !this.gameId || !this.betItem.length > 0) {
        if(!this.merchantId) this.invalid['operator'] = true
        if(!this.gameId) this.invalid['gameId'] = true
        if(!this.betItem.length>0) this.invalid['betItem'] = true
        return
      }

      for(let item in this.invalid) {
        if(this.invalid[item]) return
      }  

      this.loading = true
      this.progressTime = window.setInterval(() => {
        this.progressValue = this.progressValue + 1.5
        this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
      }, 1000)
      
      this.init()
      await this.getBetAreaData()
      this.setChartData()
      this.dataFormat()

      window.clearInterval(this.progressTime)
      this.$refs.vueCircle?.$children[0].updateProgress(100)
      window.setTimeout(() => {
        this.loading = false
      }, 1250)
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
          this.invalid['operator'] = false
          break
        case 'txtYear':
          if(!this.dateYear) {
            this.invalid['dateYear'] = true
          }
          else {
            this.invalid['dateYear'] = false
          }
          break
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

    getBetAreaList() {
      this.betItem = []

      return new Promise(async(resolve, reject) => {                
        let _hash
        let _vendor_id = parseInt(sessionStorage.getItem('vendor_id'))
        let _data = {      
          'vendor_id': _vendor_id,                                  
          'game_code': this.gameId,
        }
        _hash = md5(JSON.stringify(_data) + '698856a')
        
        let _res = await axios.post('/api/getBetAreaList', { 'data':_data, 'hash':_hash })

        if(_res.data.code === 1000) {
          this.betList = JSON.parse(JSON.stringify(_res.data.result))
        }
        else {
          this.SHOW_MESSAGE(_err, Message[_err])
          return
        }
        resolve()
      })
    },
    
    getBetAreaData() {
      return new Promise(async(resolve, reject) => {                
        let _hash
        let _userId = parseInt(sessionStorage.getItem('user_id'))
        let _vendor_id = parseInt(sessionStorage.getItem('vendor_id'))
        let _data = {      
          'vendor_id': _vendor_id,                                  
          'merchant_id': this.merchantId,
          'game_code': this.gameId,
          'year': this.dateYear,
          'type_id': this.betItem?.toString(),
        }
        _hash = md5(JSON.stringify(_data) + '698856a')
        
        let _res = await axios.post('/api/monthlyBetAreaPopular', { 'data':_data, 'hash':_hash })
    
        let _resSort

        if(_res.data.code == 1000) {
          this.betData = JSON.parse(JSON.stringify(_res.data.result))
        
          for (let i = 0; i < this.betData.length; i++) {
            this.betData[i].id = i
          }
        }
        else {
          this.SHOW_MESSAGE(_err, Message[this.betData])
          return
        }

        //Execute Log
        let _dataLog = { 
            'account_id': _userId,
            'menu_id': getMenuId(this.$route.path),
            'subMenu_id': getSubMenuId(this.$route.path),
            'action': 'select',
            'route': '/api/monthlyBetAreaPopular',
            'request': JSON.stringify(_data),
            'response': JSON.stringify(_resSort)
        }
        _hash = md5(JSON.stringify(_dataLog) + '698856a')

        await axios.post('/api/addVendorLog', { 'data':_dataLog, 'hash':_hash })

        if(_res.data.code != 1000) {
          resolve(_res.data.code)
          return
        }
        resolve()
      })
    },

    limiter(e) {
      if(this.betItem.length > 0) this.invalid['betItem'] = false
      else this.invalid['betItem'] = true
      if(e.length > 15) {
        e.pop()
      }
    },

    setChartData() {
      let tempDateList = []
      this.betData.forEach(item => {
        item.detail.forEach(node => {
          let temp = false
          for (let i = 0; i <= this.chartData.length; i++) {
            if(this.chartData[i]?.name === node?.bet_area) {
              return
            }
            else temp = true
          }
          if(temp) this.chartData.push({'name': node.bet_area, 'data': []})
        })
        tempDateList.push(item.date)
      })

      tempDateList = [...new Set(tempDateList)]

      this.chartData.forEach(info => {
        this.betData.forEach(item => {
          item.detail.forEach(node => {
            for (let i = 0; i <= this.chartData.length; i++) {
              if(info.name === node.bet_area) {
                info.data.push({x: item.month, y: removeComma(node.bet_count)})
                return
              }
            }
          })
        })

        if(info.data.length < tempDateList.length) {
          tempDateList.forEach(time => {
            let temp = true
            info.data.forEach(item => {
              if(item.x === time) {
                temp = false
              } else if (item.x !== time && temp) {
                temp = true
              }
            })
            if(temp) info.data.push({x: time, y: 0})
          })
        }

        info.data.sort(function(a,b) {
          return new Date(a.x) - new Date(b.x)
        })
      })
    },

    dataFormat() {
      this.betData?.forEach(item => {
        item.bet_count = numberFormat(item?.bet_count, 0)
        item.win_count = numberFormat(item?.win_count, 0)
        item.total_bet = numberFormat(item?.total_bet, 2)
        item.total_win = numberFormat(item?.total_win, 2)
        item.win_lose = numberFormat(item?.win_lose, 2)

        item.detail.forEach(node => {
          node.bet_count = numberFormat(node?.bet_count, 0)
          node.win_count = numberFormat(node?.win_count, 0)
          node.total_bet = numberFormat(node?.total_bet, 2)
          node.total_win = numberFormat(node?.total_win, 2)
          node.win_lose = numberFormat(node?.win_lose, 2)
        })
      })
    },

    init() {
      this.chartData = []
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
        this.merchantId = this.operatorList?.[0]?.code
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
          game_type: tempType,
          is_all: false,
          merchant_id: this.merchantId,                                  
        }
      }

      try {
        let temp = await getGameList(body)
        this.gameList = temp.result
        this.gameId = this.gameList?.[0]?.game_code
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async changeOperatorList() {
      await this.getGameList()
      await this.getBetAreaList()
    }
  },

  async mounted() {
    await this.getOperatorList()
    await this.getGameList()
    await this.getBetAreaList()

    this.dateYear = moment().format('YYYY')
  },
}
</script>

<style lang="scss">
  .betAreaMonthly .chartStyle {
    overflow-x: scroll;
  }

  .betAreaMonthly .widgetControls {
    display: none;
  }

  .betAreaMonthly .VueTables__sort-icon::before {
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

  .fontWeight {
    font-weight: 600;
  }

  .betAreaMonthly .VueTables__child-row {
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

  .betAreaMonthly tr th,
  .betAreaMonthly .VueTables__row td{
    &:nth-last-child(1) {
      max-width: 13%;
      min-width: 13%;
      width: 13%;
    }
    &:nth-last-child(2) {
      max-width: 13%;
      min-width: 13%;
      width: 13%;
    }
    &:nth-last-child(3) {
      max-width: 13%;
      min-width: 13%;
      width: 13%;
    }
    &:nth-last-child(4) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(5) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(6) {
      max-width: 7%;
      min-width: 7%;
      width: 7%;
    }
    &:nth-last-child(7) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(8) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
    &:nth-last-child(9) {
      max-width: 9%;
      min-width: 9%;
      width: 9%;
    }
  }

  .betAreaMonthly .table-hover tbody tr:hover {
    background-color: white;
  }

  .betAreaMonthly .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .betAreaMonthly .vue-treeselect__control {
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
    max-height: 33.5px;
  }

  .betAreaMonthly #selPermission.error {
    .vue-treeselect__control {
      border-color: red;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23FD5F00' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23FD5F00' stroke='none'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  }

  .vue-treeselect__placeholder {
    font-size: 1rem;
    font-weight: 300;
    color: #495057;
  }

  .numberRight {
    text-align: end;
  }
</style>

