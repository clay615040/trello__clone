<template>
  <div class="revenueSummaryMonthly">
    <widget class="mb-4" :title="`<h4><span class='fw-semi-bold'>${$t('營收彙總/預估 (月)')}</span></h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
            <label for="txtYear">{{ $t('年份') }}</label>
            <span class="warn-text">*</span>
            <date-picker id="txtYear" type="year"
                v-model="dateYear" valueType="format"
                :format="dateFormat" :change="CHANGE_DATE()"                
                :input-class="{ 'form-control': true, 'is-invalid': invalid.dateYear }"
                placeholder="Select Date"
                width="100%">
            <i class="fa fa-clock-o" slot="calendar-icon" aria-hidden="true"/>
            </date-picker>
        </div>
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
              <option v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId">{{ value.game_name_lang + ' ' }}
                <span v-if="value.game_name_lang!=='All'">({{ value.game_code }})</span>
              </option>
            </select>
        </div>
        <div class="form-group col-12 col-md px-2 d-flex align-items-end">
          <b-button type="button" variant="primary" 
                    :disabled="loading" @click="search()">
                    {{ $t('搜尋') }}
          </b-button>
        </div>
      </div>
    </widget>

    <widget v-if="estimate && estimate.length > 0 && !loading" class="mt-5 mb-4" :title="`<h5><span class='fw-semi-bold'>${$t('本月營收預估 ({0})', [estimate[0].date])}</span></h5>`" customHeader>
      <div class="expectGroup overflow-auto" ref="expectGroup">
        <div class="expectItem" v-for="(item, i) in estimate" :key="i">
          <div class="groupTotal">
            <span>{{ '● ' }}{{ item.merchant_id }}</span> 
            <div class="groupTotalExpect">{{ item.win_lose }}</div> 
          </div>
          <div class="expect" v-for="(node, i) in item.detail" :key="i">
            <span>{{ '- ' }}{{ node.game_code }}</span> 
            <span>{{ node.win_lose }}</span> 
          </div>
        </div>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <template v-else>
      <div class="mt-3 px-0" xs="12" v-if="chartData && chartData.length > 0">
        <line-chart :data="chartData"/>
      </div>

      <div class="mt-3 px-0" xs="12" v-if="CompareChartData && CompareChartData.length > 0">
        <line-chart :data="CompareChartData" chartId="CompareChart" yTitle="%"/>
      </div>

      <widget class="mb-3">
        <v-client-table name="tbReport" :columns="colReport" :options="optReport" :data="recordData" ref="tbReport">
          <template slot="win_lose" slot-scope="props">             
            <div v-if="props.row.high_light">
              <span class="highLight">{{ props.row.win_lose }}</span>
            </div>
            <div v-else>{{ props.row.win_lose }}</div>
          </template>
          <template v-if="hasDetail" v-slot:child_row="props">
            <v-client-table v-if="props.row.date !== 'total'" name="tbReport" :columns="childColReport" :options="optReport" :data="props.row.detail" ref="tbReport">
              <template slot="win_lose" slot-scope="child">             
                <div v-if="child.row.high_light">
                  <span class="highLight">{{ child.row.win_lose }}</span>
                </div>
                <div v-else>{{ child.row.win_lose }}</div>
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
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import { getOperatorList, getGameList, getMonthlyRevenue, addVendorLog } from '@/services/service'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'RevenueSummaryMonthly',

    components: { 
      'widget': Widget,
      'line-chart': LineChart,
      'date-picker': DatePicker,
      'excel': XLSX,
      VueCircleProgress,
    },

    data() {
      return {
        colReport: ['date', 'merchant_id', 'game_code', 'win_lose', 'compare'],
        childColReport: ['space', 'space', 'merchant_id', 'game_code', 'win_lose', 'compare'],
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
            id: 'width-100', win_lose: 'numberRight', compare: 'numberRight'
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
            'merchant_id': () => i18n.t('平台商'),
            'game_code': () => i18n.t('遊戲代碼'),
            'win_lose': () => i18n.t('總營收'),
            'compare': () => i18n.t('相較前個月(%)'),
          },
          uniqueKey: "date", 
          sortable: [],
        },
        merchantId: '',
        vendorCode: sessionStorage.getItem('vendor_code'),
        gameId: '',
        dateYear: '',
        dateFormat: 'YYYY',
        procExport: false,
        invalid: {
          'dateYear': false
        },        
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        chartData: [],
        CompareChartData: [],
        tempChartLabels: [
          '', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
              'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 
              'Nov', 'Dec',
        ],
        operatorList: [],
        gameList: [],
        loading: false,
        res: [],
        recordData: [],
        estimate: [],
        hasDetail: false,
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
        await this.getMonthlyRevenue()
        this.setExpectJustifyContent()
        this.setChartData()
        this.setCompareChartData()
        this.tableDataFormat()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
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
            this.invalid['operator'] = false;
            break
          case 'txtYear':
            if(!this.dateYear) {
              this.invalid['dateYear'] = true;
            }
            else {
              this.invalid['dateYear'] = false;
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
        if(this.completed) this.completed = false;
        if(this.logout) this.USER_LOGOUT();
      },

      setExpectJustifyContent() {
        if(this.$refs.expectGroup?.scrollWidth <= this.$refs.expectGroup?.offsetWidth) this.$refs.expectGroup.style.justifyContent = 'center'
      },

      tableDataFormat() {
        this.estimate?.forEach(item => {
          item.win_lose = numberFormat(item?.win_lose, 2)

          item.detail.forEach(node => {
            node.win_lose = numberFormat(node?.win_lose, 2)
          })
        })

        this.recordData?.forEach(item => {
          item.win_lose = numberFormat(item?.win_lose, 2)
          item.compare = numberFormat(item?.compare, 2)

          item.detail?.forEach(node => {
            node.win_lose = numberFormat(node?.win_lose, 2)
          })
        })
      },

      setCompareChartData() {
        this.CompareChartData = []
        let _tempCompare = {
          'type': 'spline',
          'name': i18n.t('營收成長率'),
          'data': null,
          'color': '#005792'
        }

        let _tempData = []

        for (let i = 1; i < this.recordData.length; i++) {
          _tempData.push([Date.parse(this.recordData[i]?.date), parseFloat(numberFormat(this.recordData[i]?.compare, 2))])
        }

        _tempCompare['data'] = _tempData
        if(_tempCompare?.data && _tempCompare?.data.length > 0) this.CompareChartData.push(_tempCompare)
      },

      setChartData() {
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
              node.data.push([Date.parse(item?.date), parseInt(item.win_lose)])
              hasItem = true
            }
          }

          if(!this.hasDetail && !hasItem && item.date !== 'Total') {
            let newItem = {
              type: 'spline',
              name: item.merchant_id + ' ' + item.game_code + ' ' + i18n.t('總營收'),
              data: [[Date.parse(item?.date), parseInt(item.win_lose)]],
              color: colorList[colorIndex],
              merchant_id: item.merchant_id,
              game_code: item.game_code
            }

            this.chartData.push(newItem)
            colorIndex = colorIndex + 1
          }

          item.detail?.forEach(detail => {
            hasItem = false

            for(let node of this.chartData) {
              if(detail.merchant_id === node.merchant_id && detail.game_code === node.game_code) {
                node.data.push([Date.parse(item?.date), parseInt(detail.win_lose)])
                hasItem = true
              }
            }

            if(!hasItem) {
              let newItem = {
                type: 'spline',
                name: detail.merchant_id + ' ' + detail.game_code + ' ' + i18n.t('總營收'),
                data: [[Date.parse(item?.date), parseInt(detail.win_lose)]],
                color: colorList[colorIndex],
                merchant_id: detail.merchant_id,
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
        this.CompareChartData = []
        this.res = []
        this.recordData = []
        this.estimate = []
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

      async getMonthlyRevenue() {
        const body = {
          data: {
            merchant_id: this.merchantId,  
            vendor_code: this.vendorCode,
            game_code: this.gameId,
            start_date: moment(this.dateYear).clone().startOf('year').format('YYYY-MM-DD'),
            end_date: moment(this.dateYear).clone().endOf('year').format('YYYY-MM-DD'),
          }
        }
        try {
          let temp = await getMonthlyRevenue(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          }

          this.res = temp
          this.recordData = temp?.result?.revenue
          this.estimate = temp?.result?.estimate
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
            'route': '/api/monthlyRevenue',
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
    },

    watch: {
      '$i18n.locale'() {
        this.init()
        this.setChartData()
        this.setCompareChartData()
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
      
      this.dateYear = moment().format(this.dateFormat)
    },
}
</script>

<style lang="scss">
  .expectGroup {
    margin-top: 12px;
    padding: 10.5px;
    display: flex;
  }

  .revenueSummaryMonthly .groupTotal {
    font-weight: 600;
  }

  .expectItem {
    margin-bottom: 12px;
    margin-left: 150px;
    display: inline-block;
    flex-direction: column;
    flex: 1;
    min-width: 360px;
    max-width: 360px;

    &:first-child {
      margin-left: 0;
    }
  }

  .groupTotal,
  .expect {
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    line-height: 24px;
  }

  .expect {
    margin-left: 16px;
  }

  .revenueSummaryMonthly .VueTables__sort-icon::before {
    display: none;
  }

  .fontWeight {
    font-weight: 600;
  }

  .revenueSummaryMonthly .VueTables__child-row {
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

  .revenueSummaryMonthly tr th,
  .revenueSummaryMonthly .VueTables__row td {
    &:nth-last-child(1) {
      max-width: 20%;
      min-width: 20%;
      width: 20%;
    }
    &:nth-last-child(2) {
      max-width: 20%;
      min-width: 20%;
      width: 20%;
    }
    &:nth-last-child(3) {
      max-width: 17%;
      min-width: 17%;
      width: 17%;
    }
    &:nth-last-child(4) {
      max-width: 17%;
      min-width: 17%;
      width: 17%;
    }
    &:nth-last-child(5) {
      max-width: 15%;
      min-width: 15%;
      width: 15%;
    }
    &:nth-last-child(6) {
      max-width: 10%;
      min-width: 10%;
      width: 10%;
    }
  }

  .revenueSummaryMonthly .table-hover tbody tr:hover {
    background-color: white;
  }

  .revenueSummaryMonthly .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }

  .numberRight {
    text-align: end;
  }
  
</style>

