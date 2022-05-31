<template>
  <div class="playerStock">
    <widget class="mb-4" :title="`<h4 class='fw-semi-bold'>${$t('遊戲玩家庫存')}</h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
            <label for="txtMonth">{{ $t('月份') }}</label>
            <span class="warn-text">*</span>
            <date-picker type="month" id="txtMonth"
                valueType="format" :lang="datePickerLang" v-model="dateMonth"                 
                :format="dateFormat" :change="CHANGE_DATE()"                
                :input-class="{ 'form-control': true, 'is-invalid': invalid.dateMonth }"
                width="100%">
            <i class="fa fa-clock-o" slot="calendar-icon" aria-hidden="true"/>
            </date-picker>
        </div>
        <div class="form-group col-12 col-md-3 px-2">
            <label for="selOperator">{{ $t('平台商') }}</label>
            <select id="selOperator" class="form-control" v-model="merchant" :class="{ 'is-invalid': invalid.operator }" @change="getGameList()">
              <option v-for="(value, key) in operatorList" :key="key" :value="value">{{ value.name }}
              </option>
            </select>
        </div>         
        <div class="form-group col-12 col-md-3 px-2">
            <label for="selGameId">{{ $t('遊戲代碼') }}</label>
            <select id="selGameId" class="form-control" v-model="gameId">
              <option v-for="(value, i) in gameList" :key="i" :value="value.game_code">{{ value.game_name_lang + ' ' }}
                <span v-if="value.game_name_lang!=='All'">({{ value.game_code }})</span>
              </option>
            </select>
        </div>
        <div class="col-12 col-md-2 px-2 d-flex align-items-end">
          <div class="form-group">           
            <b-button type="button" variant="primary" 
                      :disabled="loading" @click="QUERY_REPORT(true)">
                      {{ $t('搜尋') }}
            </b-button>
          </div>
        </div>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <template v-else>
      <div class="mt-3 mb-n4 px-0" xs="12" v-if="chartData && chartData.length>1 && playerStockList.length>0">
        <line-chart :data="chartData" chartHeight="500" xType="datetime" />
      </div>

      <widget class="mb-3" :fetchingData="loading">
        <v-client-table name="tbReport" :columns="colReport" :options="optReport" :data="playerStockList" ref="tbReport">        
        </v-client-table>      
      </widget>  
    </template>
    
    <b-modal v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" 
              size="xs" centered>

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
import i18n from '@/locales'
import Message from '@/mixins/message'
import { getOperatorList, getGameList, getPlayerStock, addVendorLog } from '@/services/service'
import LineChart from '@/pages/Dashboard/components/MainChart/LineChart'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'playerStocks',

    components: { 
      'widget': Widget,
      'date-picker': DatePicker,
      'line-chart': LineChart,
      VueCircleProgress,
    },

    data() {
      return {
        colReport: [],
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
            id: 'width-100', experience: 'numberRight', elementary: 'numberRight', intermediate: 'numberRight', advanced: 'numberRight',
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {},   
          cellClasses:{
            date: [
              {
                class:'totalClass',
                condition: row => row.date === i18n.t('總計')
              }
            ]
          }      
        },
        datePickerLang: {
          months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        },
        merchant: '',
        gameId: '',
        dateMonth: '',
        dateFormat: 'YYYY-MM',
        procExport: false,
        invalid: {
          'merchant': false,
          'dateMonth': false
        },        
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        tableData: [],
        loading: false,
        merchantList: [],
        gameList: [],
        playerStockList: [],
        chartData: [],
        playerStockOperator: '',
        operatorList: [],
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    watch: {
      '$i18n.locale'() {
        this.init()
        this.setChartData()
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

      async QUERY_REPORT() {
        for(let item in this.invalid) {
          if(this.invalid[item]) return
        }  

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        this.init()
        await this.getPlayerStockList()
        this.setChartData()
        this.dataFormat()
        
        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },     
    
      CHANGE_DATE() {
        if(!this.dateMonth) {
          this.invalid['dateMonth'] = true
        }
        else {
          this.invalid['dateMonth'] = false
        }
      },      
      
      DATA_VALID(id) {
        switch(id) {
          case 'selMerchantId':
            if(!this.merchant) {
              this.invalid['merchant'] = true
            }
            else {
              this.invalid['merchant'] = false
            }
            break
          case 'txtMonth':
            if(!this.dateMonth) {
              this.invalid['dateMonth'] = true
            }
            else {
              this.invalid['dateMonth'] = false
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
            this.merchant = this.operatorList?.[0]
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
            merchant_id: this.merchant?.code,                                  
            game_type: 6
          }
        }
        try {
          let temp = await getGameList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.gameList = temp?.result
            this.gameId = this.gameList?.[0]?.game_code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getPlayerStockList() {
        const body = {
          data: {
            operator_id: this.merchant?.id,         
            vendor_code: sessionStorage.getItem('vendor_code'),
            game_code: this.gameId,
            start_date: moment(this.dateMonth).clone().startOf('month').format('YYYY-MM-DD'),
            end_date: moment(this.dateMonth).clone().endOf('month').format('YYYY-MM-DD'),
          }
        }
        try {
          let temp = await getPlayerStock(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          }
          this.playerStockList = temp?.result?.stock
          this.playerStockOperator = temp?.result?.operator
          this.changeColumn()
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
            'route': 'playerStock',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.playerStockList)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      changeColumn() {
        switch(this.playerStockOperator) {
          // 王牌
          case 'aceonline':
            this.colReport = ['date', 'merchant_id', 'game_code', 'elementary', 'intermediate', 'advanced']
            this.optReport.headings = {         
              date: () => i18n.t('日期'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              elementary: () => i18n.t('入門館'),
              intermediate: () => i18n.t('高手館'),
              advanced: () => i18n.t('傳奇館'),              
            }        
            break
          // 08
          case '08online':
          default:
            this.colReport = ['date', 'merchant_id', 'game_code', 'experience', 'elementary', 'intermediate', 'advanced']
            this.optReport.headings = {  
              date: () => i18n.t('日期'),
              merchant_id: () => i18n.t('平台商'),
              game_code: () => i18n.t('遊戲代碼'),
              experience: () => i18n.t('體驗區'),
              elementary: () => i18n.t('初級區'),
              intermediate: () => i18n.t('中級區'),              
              advanced: () => i18n.t('高級區'),
            }        
            break

        }
      },

      setChartData() {
        switch(this.playerStockOperator) {
          // 08
          case '08online':
            let groupExperience = []
            let groupElementary = []
            let groupIntermediate = []
            let groupAdvanced = []

            this.playerStockList.map(item => {
              groupExperience.push([Date.parse(item.date), parseInt(item.experience)]) 
              groupElementary.push([Date.parse(item.date), parseInt(item.elementary)]) 
              groupIntermediate.push([Date.parse(item.date), parseInt(item.intermediate)]) 
              groupAdvanced.push([Date.parse(item.date), parseInt(item.advanced)]) 
            })
            
            let experience = {
              'type': 'spline',
              'name': i18n.t('體驗區'),
              'data': groupExperience,
              'color': '#005792'
            }

            let elementary = {
              'type': 'spline',
              'name': i18n.t('初級區'),
              'data': groupElementary,
              'color': '#FF69B4'
            }

            let intermediate = {
              'type': 'spline',
              'name': i18n.t('中級區'),
              'data': groupIntermediate,
              'color': '#FDA700'
            }

            let advanced = {
              'type': 'spline',
              'name': i18n.t('高級區'),
              'data': groupAdvanced,
              'color': '#002B49'
            }

            this.chartData.push(experience)
            this.chartData.push(elementary)
            this.chartData.push(intermediate)
            this.chartData.push(advanced)

            break

          // 王牌
          case 'aceonline':
            groupElementary = []
            groupIntermediate = []
            groupAdvanced = []

            this.playerStockList.map(item => {
              groupElementary.push([Date.parse(item.date), parseInt(item.elementary)]) 
              groupIntermediate.push([Date.parse(item.date), parseInt(item.intermediate)]) 
              groupAdvanced.push([Date.parse(item.date), parseInt(item.advanced)]) 
            })
          
            elementary = {
              'type': 'spline',
              'name': i18n.t('入門館'),
              'data': groupElementary,
              'color': '#FF69B4'
            }

            intermediate = {
              'type': 'spline',
              'name': i18n.t('高手館'),
              'data': groupIntermediate,
              'color': '#FDA700'
            }

            advanced = {
              'type': 'spline',
              'name': i18n.t('傳奇館'),
              'data': groupAdvanced,
              'color': '#002B49'
            }

            this.chartData.push(elementary)
            this.chartData.push(intermediate)
            this.chartData.push(advanced)

            break
        }
      },

      dataFormat() {
        this.playerStockList?.forEach(item => {
          item.experience = numberFormat(item?.experience, 2)
          item.elementary = numberFormat(item?.elementary, 2)
          item.intermediate = numberFormat(item?.intermediate, 2)
          item.advanced = numberFormat(item?.advanced, 2)
          item.master = numberFormat(item?.master, 2)
        })
      },

      init() {
        this.chartData = []
      },
    },
    
    async mounted() {
      await this.getOperatorList()
      await this.getGameList()

      this.dateMonth = moment(new Date()).format('YYYY-MM')

      this.changeColumn()
    },
}
</script>


<style>
  .VueTables__table.table tr th {
    font-size: x-small !important;
    color: white !important;
  }

  .VueTables__dropdown-pagination select{
    margin-left: 10px;
  }

  .VueTables__child-row-toggler {
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    margin: auto;
    text-align: center;
    font-weight: bold;
    font-size: large;
  }

  .pagination > li.active > a,
  .pagination > li > a:hover
  {
    background-color: #005792 !important;
    color: white !important;
    border-radius: 6px !important;
  }

  .VuePagination ul li.active a {
    background-color: #005792 !important;
    color: white !important;
    border-radius: 6px !important;
  }

  .warn-text {
    margin-left: 5px;
    color: red;
    font-weight: bold;
  }

  .numberRight {
    text-align: end;
  }

</style>