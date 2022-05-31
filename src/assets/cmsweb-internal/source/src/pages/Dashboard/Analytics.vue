

<template>
  <div class="dashboard-page">
    <div class="row px-3 mb-3">
      <div class="form-group col-12 col-md-3 px-2">
        <label for="selOperator">{{ $t('平台商') }}</label>
        <select id="selOperator" class="form-control" v-model="merchantId" @change="CHANGE_OPERATOR()">
          <option v-for="(value, key) in operatorList" :key="key" :value="value.code" :selected="merchantId">
            {{ value.name }}
          </option>
        </select>
      </div>
      <div class="form-group col-12 col-md-3 px-2">
        <label for="selGameId">{{ $t('遊戲代碼') }}</label>
        <select id="selGameId" class="form-control" v-model="gameId" @change="CHANGE_GAME()">
          <option v-for="(value, key) in gameList" :key="key" :value="value.code" :selected="gameId">
            {{ value.name }}
          </option>
        </select>
      </div>
      <div class="form-group col-12 col-md-3 px-2">
        <label for="selCurrency">{{ $t('幣別') }}</label>
        <select id="selCurrency" class="form-control" v-model="currency" @change="CHANGE_CURRENCY()">
          <option v-for="(value, key) in currencyList" :key="key" :value="value.name" :selected="currency">
            {{ value.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="sidesWrapper">

      <div class="analyticsSide">
        <b-row>
          <b-col lg="3" sm="6" xs="12">
            <div class="pb-xlg h-100">
              <Widget class="mb-0" :title="`<h5 class='fw-semi-bold'>${$t('總投注 (日)')}</h5>`" :fetchingData="recvRecord" customHeader>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('今日') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataDay.today.bet_str }}</span>
                </div>
                <b-progress class="mb" style="height:15px"
                  variant="primary" :value="dataDay.today.bet" :max="maxDay" />
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('昨日') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataDay.yesterday.bet_str }}</span>
                </div>
                <b-progress class="mb-xs" style="height:15px"
                  variant="secondary" :value="dataDay.yesterday.bet" :max="maxDay" />
                
              </Widget>
            </div>
          </b-col>
          <b-col lg="3" sm="6" xs="12">
            <div class="pb-xlg h-100">
              <Widget class="mb-0" :title="`<h5 class='fw-semi-bold'>${$t('總贏分 (日)')}</h5>`" :fetchingData="recvRecord" customHeader>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('今日') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataDay.today.win_str }}</span>
                </div>
                <b-progress class="mb" style="height:15px"
                  variant="primary" :value="dataDay.today.win" :max="maxDay" :precision="2"/>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('昨日') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataDay.yesterday.win_str }}</span>
                </div>
                <b-progress class="mb-xs" style="height:15px"
                  variant="secondary" :value="dataDay.yesterday.win" :max="maxDay" :precision="2"/>
              </Widget>
            </div>
          </b-col>
          <b-col lg="3" sm="6" xs="12">
            <div class="pb-xlg h-100">
              <Widget class="mb-0" :title="`<h5 class='fw-semi-bold'>${$t('總投注 (周)')}</h5>`" :fetchingData="recvRecord" customHeader>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('本周') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataWeek.thisWeek.bet_str }}</span>
                </div>
                <b-progress class="mb" style="height:15px"
                  variant="primary" :value="dataWeek.thisWeek.bet" :max="maxWeek" :precision="2"/>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('上周') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataWeek.lastWeek.bet_str }}</span>
                </div>
                <b-progress class="mb-xs" style="height:15px"
                  variant="secondary" :value="dataWeek.lastWeek.bet" :max="maxWeek" :precision="2"/>
              </Widget>
            </div>
          </b-col>
          <b-col lg="3" sm="6" xs="12">
            <div class="pb-xlg h-100">
              <Widget class="mb-0" :title="`<h5 class='fw-semi-bold'>${$t('總贏分 (周)')}</h5>`" :fetchingData="recvRecord" customHeader>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('本周') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataWeek.thisWeek.win_str }}</span>
                </div>
                <b-progress class="mb" style="height:15px"
                  variant="primary" :value="dataWeek.thisWeek.win" :max="maxWeek" :precision="2"/>
                <div class="clearfix fs-mini mt-4 mb-2">
                  <span class="pull-left m-0 fw-semi-bold">{{ $t('上周') }}</span>
                  <span class="pull-right m-0 fw-semi-bold">{{ dataWeek.lastWeek.win_str }}</span>
                </div>
                <b-progress class="mb-xs" style="height:15px"
                  variant="secondary" :value="dataWeek.lastWeek.win" :max="maxWeek" :precision="2"/>
              </Widget>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col xs="12">
            <MainChart :title="`<h5 class='fw-semi-bold'>${$t('本月')}</h5>`" :data="dataMonth.thisMonth" :fetchingData="recvRecord"/>
          </b-col>
        </b-row>
        <b-row>
          <b-col xs="12">
            <MainChart :title="`<h5 class='fw-semi-bold'>${$t('上月')}</h5>`" :data="dataMonth.lastMonth" :fetchingData="recvRecord"/>
          </b-col>
        </b-row>
      </div>
      
    </div>

    <b-modal v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" 
              body-bg-variant="white" size="xs" centered>

      <div class="text-center">
        <label>{{ $t(message) }}</label>
      </div>
      
      <template v-slot:modal-footer>
        <div>
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage=false">{{ $t('確認') }}</b-button>
        </div>
      </template>
    </b-modal>
  
    
  </div>
  
</template>

<script>
import {mapState, mapActions} from 'vuex';
import moment from 'moment';
import Widget from '@/components/Widget/Widget';
import Method from '@/mixins/method';
import Message from '@/mixins/message';
import MainChart from './components/MainChart/MainChart';

export default {
  name: 'Analytics',
  components: {
    Widget, MainChart
  },
  data() {
    return {
      dateFormat: 'YYYY-MM-DD',
      merchantId: '',
      gameId: '',
      currency: '',
      maxDay: 10,
      maxWeek: 10,

      dataDay: {
        'today': {
          'bet': 0,
          'bet_str': '',
          'win': 0,
          'win_str': ''
        },
        'yesterday':{
          'bet': 0,
          'bet_str': '',
          'win': 0,
          'win_str': ''
        }
      },
      dataWeek: {
        'thisWeek': {
          'bet': 0,
          'bet_str': '',
          'win': 0,
          'win_str': ''
        },
        'lastWeek':{
          'bet': 0,
          'bet_str': '',
          'win': 0,
          'win_str': ''
        }
      },
      dataMonth: {
        'thisMonth': [],
        'lastMonth': []
      },
      
      message: '',
      showMessage: false,
      logout: false
    };
  },
  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('analytics', {
      'REQUEST_RECORD': 'request_record',      
      'RESET_STATE': 'reset_state'
    }),
    ...mapActions('operator', {
      'REQUEST_OPERATORS': 'request_list'
    }),
    ...mapActions('game', {
      'REQUEST_GAMES': 'request_list'
    }),
    
    SELECT_RECORD() {

      return new Promise((resolve, reject) => {

        let _para = {
          'merchantId': this.merchantId,
          'gameId': this.gameId,
          'startDate': moment().subtract(1,'months').startOf('month').format(this.dateFormat),
          'endDate': moment().subtract(0,'months').endOf('month').format(this.dateFormat),
        };

        this.REQUEST_RECORD(_para).then((_err) => {
          
          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err]);
            return;
          }

          if(!this.currency && this.currencyList.length > 0) { 
            this.currency = this.currencyList[0].name;
          }

          this.RECORD_DAY();
          this.RECORD_WEEK();
          this.RECORD_MONTH();
          
          resolve();
        })
      })
    },
    RECORD_DAY() {
      
      let _record = this.record[this.currency];
      if(!_record) return;

      let _today = moment().format(this.dateFormat)
      let _yestoday = moment().subtract(1, 'days').format(this.dateFormat)
      let _totalBetToday = 0
      let _totalWinToday = 0
      let _totalBetYestoday = 0
      let _totalWinYestoday = 0

      for(let _item of _record) {
        if(_item.date == _today) {
          _totalBetToday = _item.total_bet
          _totalWinToday = _item.total_win        
        }

        if(_item.date == _yestoday) {
          _totalBetYestoday = _item.total_bet
          _totalWinYestoday = _item.total_win
        }
      }

      this.dataDay.today.bet = _totalBetToday
      this.dataDay.today.win = _totalWinToday  
      this.dataDay.today.bet_str = Method.format_number(_totalBetToday, 2)
      this.dataDay.today.win_str = Method.format_number(_totalWinToday, 2)
      this.dataDay.yesterday.bet = _totalBetYestoday
      this.dataDay.yesterday.win = _totalWinYestoday
      this.dataDay.yesterday.bet_str = Method.format_number(_totalBetYestoday, 2)
      this.dataDay.yesterday.win_str = Method.format_number(_totalWinYestoday, 2)
      
      if(!_totalBetToday || !_totalBetYestoday) return

      let _digit = (_totalBetToday >= _totalBetYestoday)? _totalBetToday.toString().length: _totalBetYestoday.toString().length
      this.maxDay = Math.pow(10, _digit - 1) * 7
    },
    RECORD_WEEK() {

      let _record = this.record[this.currency]
      if(!_record) return

      let _lastWeek = [moment().subtract(1, 'weeks').startOf('week').format(this.dateFormat), 
                        moment().subtract(1, 'weeks').endOf('week').format(this.dateFormat)];
      let _thisWeek = [moment().weekday(0).format(this.dateFormat), 
                        moment().weekday(6).format(this.dateFormat)]
      let _totalBetLastWeek, _totalWinLastWeek, _totalBetThisWeek, _totalWinThisWeek

      this.dataWeek.lastWeek.bet = 0
      this.dataWeek.lastWeek.win = 0
      this.dataWeek.thisWeek.bet = 0
      this.dataWeek.thisWeek.win = 0

      for(let _item of _record) {
        
        if(moment(_item.date).isBetween(_lastWeek[0], _lastWeek[1], undefined, '[]')) {
          this.dataWeek.lastWeek.bet += _item.total_bet
          this.dataWeek.lastWeek.win += _item.total_win
        }

        if(moment(_item.date).isBetween(_thisWeek[0], _thisWeek[1], undefined, '[]')) {
          this.dataWeek.thisWeek.bet += _item.total_bet
          this.dataWeek.thisWeek.win += _item.total_win
        }
      }

      _totalBetLastWeek = this.dataWeek.lastWeek.bet
      _totalWinLastWeek = this.dataWeek.lastWeek.win
      _totalBetThisWeek = this.dataWeek.thisWeek.bet
      _totalWinThisWeek = this.dataWeek.thisWeek.win
        
      this.dataWeek.lastWeek.bet_str = Method.format_number(_totalBetLastWeek, 2)
      this.dataWeek.lastWeek.win_str = Method.format_number(_totalWinLastWeek, 2)
      this.dataWeek.thisWeek.bet_str = Method.format_number(_totalBetThisWeek, 2)
      this.dataWeek.thisWeek.win_str = Method.format_number(_totalWinThisWeek, 2)
      
      if(!_totalBetThisWeek || !_totalBetLastWeek) return

      let _digit = (_totalBetThisWeek >= _totalBetLastWeek)? _totalBetThisWeek.toString().length: _totalBetLastWeek.toString().length
      this.maxWeek = Math.pow(10, _digit - 1) * 7
    },
    RECORD_MONTH() {
      let _record = this.record[this.currency]
      if(!_record) return

      let _lastMonth = [moment().subtract(1,'months').startOf('month').format(this.dateFormat), 
                      moment().subtract(1,'months').endOf('month').format(this.dateFormat)]
      let _thisMonth = [moment().startOf('month').format(this.dateFormat), 
                        moment().endOf('month').format(this.dateFormat)]

      this.dataMonth.lastMonth = []
      this.dataMonth.thisMonth = []

      for(let _item of _record) {
        if(moment(_item.date).isBetween(_lastMonth[0], _lastMonth[1], undefined, '[]')) {
          this.dataMonth.lastMonth.push(_item)
        }
        if(moment(_item.date).isBetween(_thisMonth[0], _thisMonth[1], undefined, '[]')) {
          this.dataMonth.thisMonth.push(_item)
        }
      }
    },
    CHANGE_OPERATOR() {
      this.QUERY_GAMES()
    },
    CHANGE_GAME() {
      this.SELECT_RECORD()
    },
    CHANGE_CURRENCY() {
      this.RECORD_DAY()
      this.RECORD_WEEK()
      this.RECORD_MONTH()
    },
    async QUERY_OPERATORS() {
      let _err = await this.REQUEST_OPERATORS()

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      if(this.operatorList.length > 0) {
        this.merchantId = this.operatorList[0].code
        this.CHANGE_OPERATOR()
      }
    },
    async QUERY_GAMES() {
      let _para = {
        'merchantId': this.merchantId,
      }
      let _err = await this.REQUEST_GAMES(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }

      let _exist = this.gameList.some(game => game.code === this.gameId)
      if(!_exist) this.gameId = ''

      this.SELECT_RECORD()
    },


    SHOW_MESSAGE(err, message) {
      this.message = message
      this.showMessage = true

      if(err == 1002 || err == 1004 || err == 1005 || err == 1012) {
        this.logout = true
      }
    },
    CLOSE_MESSAGE() {
      if(this.logout) this.USER_LOGOUT()
    },
  },
  computed: {
    ...mapState('analytics', {
      'record': state => state.response.record,
      'recvRecord': state => state.receiving.record,
      'currencyList': state => state.response.currency,      
    }),
    ...mapState('operator', {
      'operatorList': state => state.response.list, 
      'recvOperator': state => state.receiving.list
    }),
    ...mapState('game', {
      'gameList': state => state.response.list, 
      'recvGame': state => state.receiving.list
    }),
  },
  mounted() {
    this.QUERY_OPERATORS()
  },
}
</script>

<style src="./Analytics.scss" lang="scss" />
