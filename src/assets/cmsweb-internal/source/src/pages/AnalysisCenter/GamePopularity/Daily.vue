<template>
  <div class="gamePopularityDaily">
    <widget class="mb-4" :title="`<h4><span class='fw-semi-bold'>${$t('遊戲熱門度 (日)')}</span></h4>`" customHeader>
      <div class="row mt-4 px-3">
        <div class="form-group col-12 col-md-3 px-2">
          <label for="txtMonth">{{ $t('月份') }}</label>
          <span class="warn-text">*</span>
          <date-picker type="month" id="txtMonth"
              valueType="format" :lang="datePickerLang" v-model="dateMonth"                 
              :format="'YYYY-MM'" :change="CHANGE_DATE()"                
              :input-class="{ 'form-control': true, 'is-invalid': invalid.dateMonth }"
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
                    :disabled="loading" @click="QUERY_REPORT(true)">
                    {{ $t('搜尋') }}
          </b-button>
        </div>
      </div>
    </widget>

    <div v-if="loading" class="mask">
      <vue-circle-progress ref="vueCircle" />
    </div>

    <template v-else>
      <div class="mt-3 mb-n4 px-0" xs="12" v-if="!loading && chartData && chartData[1].data.length > 0">
        <mixed-chart :chartData="chartData" />
      </div>

      <widget class="mb-3">
        <v-client-table :columns="colReport" :options="optReport" :data="popular" ref="tbReport">
          <template slot="players_dup" slot-scope="props">             
            <div v-if="props.row.highlight_dup">
              <span class="highLight">{{ props.row.players_dup }}</span>
            </div>
            <div v-else>{{ props.row.players_dup }}</div>
          </template>
          <template slot="players_not_dup" slot-scope="props">             
            <div v-if="props.row.highlight_notDup">
              <span class="highLight">{{ props.row.players_not_dup }}</span>
            </div>
            <div v-else>{{ props.row.players_not_dup }}</div>
          </template>
          <template slot="time_avg" slot-scope="props">             
            <div v-if="props.row.highlight_time">
              <span class="highLight">{{ props.row.time_avg }}</span>
            </div>
            <div v-else>{{ props.row.time_avg }}</div>
          </template>
          <template v-if="(!merchantId || !gameId)" name="tbReport" v-slot:child_row="props">
            <v-client-table v-if="props.row.month !== 'Total'" name="tbReport" :columns="childColReport" :options="optReport" :data="props.row.detail" ref="tbReport">
              <template slot="players_dup" slot-scope="child">             
                <div v-if="child.row.highlight_dup">
                  <span class="highLight">{{ child.row.players_dup }}</span>
                </div>
                <div v-else>{{ child.row.players_dup }}</div>
              </template>
              <template slot="players_not_dup" slot-scope="child">             
                <div v-if="child.row.highlight_notDup">
                  <span class="highLight">{{ child.row.players_not_dup }}</span>
                </div>
                <div v-else>{{ child.row.players_not_dup }}</div>
              </template>
              <template slot="time_avg" slot-scope="child">             
                <div v-if="child.row.highlight_time">
                  <span class="highLight">{{ child.row.time_avg }}</span>
                </div>
                <div v-else>{{ child.row.time_avg }}</div>
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
import { mapState, mapActions } from 'vuex'
import DatePicker from 'vue2-datepicker'
import Widget from '@/components/Widget/Widget'
import MixedChart from '@/pages/Dashboard/components/MainChart/gamePopularityChart'
import i18n from '@/locales'
import Message from '@/mixins/message'
import XLSX from 'xlsx'
import { numberFormat } from '@/helper'
import { getOperatorList, getGameList } from '@/services/service'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'GamePopularityDaily',
    components: { 
      'widget': Widget,
      'mixed-chart': MixedChart,
      'date-picker': DatePicker,
      'excel': XLSX,
      VueCircleProgress,
    },

    data() {
      return {
        colReport: ['date', 'merchant_id', 'game_code', 'players_dup', 'players_not_dup', 'time_avg'],
        childColReport: ['space', 'date', 'merchant_id', 'game_code', 'players_dup', 'players_not_dup', 'time_avg'],
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
            id: 'width-100', players_dup: 'numberRight', players_not_dup: 'numberRight', time_avg: 'numberRight'
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
            'merchant_id': () => i18n.t('平台商'),
            'game_code': () => i18n.t('遊戲代碼'),
            'players_dup': () => i18n.t('進入人次 (含重複的玩家)'),
            'players_not_dup': () => i18n.t('進入人數(不含重複的玩家)'),
            'time_avg': () => i18n.t('遊玩時長(分鐘)'),
          },
          uniqueKey: "date", 
          sortable: [],
        },
        datePickerLang: {
          months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        },
        merchantId: '',
        vendorCode: sessionStorage.getItem('vendor_code'),
        gameId: '',
        dateMonth: '',
        procExport: false,
        invalid: {
          'dateMonth': false
        },        
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        chartData: [    
          {
            name: i18n.t('遊玩時長(分鐘)'),
            type: 'column',
            data: []
          },   
          {
            name: i18n.t('進入人次 (含重複的玩家)'),
            type: 'line',
            data: []
          }, 
          {
            name: i18n.t('進入人數(不含重複的玩家)'),
            type: 'line',
            data: []
          },
        ],
        tempChartLabels: [
          '', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
              'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 
              'Nov', 'Dec',
        ],
        operatorList: [],
        gameList: [],
        progressValue: 0,
        progressTime: function() { return '' },
        loading: false,
      }
    },

    computed: {
      ...mapState('gamePopularityDaily', {  
        'popular': state => state.response.popular,      
      }),
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
      ...mapActions('gamePopularityDaily', {
        'REQUEST_REPORT': 'request_report',
        'RESET_STATE': 'reset_state'
      }),

      async QUERY_REPORT() {
        for(let item in this.invalid) {
          if(this.invalid[item]) return;
        }  

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        let _para = {  
          'merchantId': this.merchantId,  
          'vendorCode': this.vendorCode,
          'gameId': this.gameId,
          'date': this.dateMonth,
        }

        let _err = await this.REQUEST_REPORT(_para);
          
        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err]);
          return;
        }
        this.init()
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
          this.invalid['dateMonth'] = true;
        }
        else {
          this.invalid['dateMonth'] = false;
        }
      },  

      DATA_VALID(id) {
        switch(id) {
          case 'selOperator':
            this.invalid['operator'] = false;
            break;
          case 'txtMonth':
            if(!this.dateYear) {
              this.invalid['dateMonth'] = true;
            }
            else {
              this.invalid['dateMonth'] = false;
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
        if(this.completed) this.completed = false;
        if(this.logout) this.USER_LOGOUT();
      },

      dataFormat() {
        this.popular?.forEach(item => {
          item.players_dup = numberFormat(item?.players_dup, 0)
          item.players_not_dup = numberFormat(item?.players_not_dup, 0)
          item.time_avg = numberFormat(item?.time_avg, 0)

          item?.detail?.forEach(node => {
            node.players_dup = numberFormat(node?.players_dup, 0)
            node.players_not_dup = numberFormat(node?.players_not_dup, 0)
            node.time_avg = numberFormat(node?.time_avg, 0)
          })
        })
      },

      setChartData() {
        let tempPlayersDup = []
        let tempPlayersNotDup = []
        let tempTimeAvg = []

        for (let i = 1; i < this.popular.length; i++) {
          let month = parseInt(this.popular[i]?.date?.split('-')[1])
          let day = parseInt(this.popular[i]?.date?.split('-')[2])
          let temp = day + '.' + this.tempChartLabels[month] 

          tempTimeAvg.push({x: temp, y: this.popular[i]?.time_avg})
          tempPlayersDup.push({ x: temp, y: this.popular[i]?.players_dup})
          tempPlayersNotDup.push({x: temp, y: this.popular[i]?.players_not_dup})
        }

        this.chartData[0].data = tempTimeAvg
        this.chartData[1].data = tempPlayersDup
        this.chartData[2].data = tempPlayersNotDup
      },

      init() {
        this.chartData = [ 
        {
          name: i18n.t('遊玩時長(分鐘)'),
          type: 'column',
          data: []
        },
        {
          name: i18n.t('進入人次 (含重複的玩家)'),
          type: 'line',
          data: []
        }, 
        {
          name: i18n.t('進入人數(不含重複的玩家)'),
          type: 'line',
          data: []
        }]
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

      this.dateMonth = moment(new Date()).format('YYYY-MM')
    },

    destroyed() {
      this.RESET_STATE()
    }
}
</script>


<style lang="scss">
  .gamePopularityDaily tr:first-child .VueTables__child-row-toggler  {
    display: none;
  }

  .gamePopularityDaily .widgetControls {
    display: none;
  }

  .gamePopularityDaily .VueTables__sort-icon::before {
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

  .gamePopularityDaily .VueTables__row:first-child td:first-child {
    pointer-events: none;
  }

  .gamePopularityDaily .VueTables__child-row {
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

  .gamePopularityDaily tr th,
  .gamePopularityDaily .VueTables__row td{
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
      max-width: 20%;
      min-width: 20%;
      width: 20%;
    }
    &:nth-last-child(4) {
      max-width: 12%;
      min-width: 12%;
      width: 12%;
    }
    &:nth-last-child(5) {
      max-width: 12%;
      min-width: 12%;
      width: 12%;
    }
    &:nth-last-child(6) {
      max-width: 11%;
      min-width: 11%;
      width: 11%;
    }
  }

  .gamePopularityDaily .table-hover tbody tr:hover {
    background-color: white;
  }

  .gamePopularityDaily .VueTables__row:hover {
    background-color:rgba(0, 0, 0, 0.075) !important; 
  }
  
</style>

