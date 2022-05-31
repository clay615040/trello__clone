<template lang="pug">
  .boardGameRecord
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('開桌遊戲紀錄')}</h4>`" customHeader :fetchingData="false")
      .row.mt-4.px-3
        .form-group.col-12.col-md-3.px-2
          label(for="txtBetNumber") {{ $t('會員帳號') }}
          input#txtBetNumber.form-control(type="text" v-model="userAccount")
        .form-group.col-12.col-md-3.px-2
          label(for="txtRoundId") {{ $t('桌號') }}
          input#txtRoundId.form-control(type="text" v-model="tableId")
        .form-group.col-12.col-md-3.px-2
          label(for="selVendorCode") {{ $t('平台商') }}
          select#selVendorCode.form-control(v-model="merchantId" @change="getGameList()")
            option(v-for="(value, key) in operatorList" :key="key" :value="value.code") {{ value.name }}
        .form-group.col-12.col-md-3.px-2
          label(for="selGameId") {{ $t('遊戲代碼') }}
          select#selGameId.form-control(v-model="gameId")
            option(v-for="(value, key) in gameList" :key="key" :value="value.game_realcode") {{ value.game_name_lang + ' ' }}
              span(v-if="value.game_name_lang!=='All'") ({{ value.game_code }})
        .form-group.col-12.col-md-3.px-2
          label(for="txtTimePeriod") {{ $t('時間區間') }}
          span.warn-text *
          span.warn-text(v-if="overTime") {{ overTimeText }}
          date-picker#txtTimePeriod(type="datetime" valueType="format" lang="en" range v-model="datePeriod" :format="dateFormat" :change="changeDate()" :not-before="dateBefore" :input-class="{ 'form-control': true, 'is-invalid': invalid.timePeriod }" width="100%")
            i.fa.fa-clock-o(slot="calendar-icon")
        .col-12.col-md-2.px-2.d-flex.align-items-end
          .form-group           
            b-button(type="button" variant="primary" :disabled="false" @click="search()") {{ $t('搜尋') }}

    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    widget.mb-3(v-else)
      .float-right(v-if="totalCount && totalCount > 0")
        label.float-left.pt-2.pr-3 {{ $t('資料筆數') }} : {{ formatTotalCount }}
        b-pagination.pagination(v-model="pageNum" :total-rows="totalCount" :per-page="pageSize" @input="changePage()")
      v-client-table(:columns="colRecord" :options="optRecord" :data="recordData" ref="tbRecord")
        template(slot="round_start_time" slot-scope="props") {{ timestampToDate(props.row.round_start_time) }}
        b-button.btn-sm(v-b-modal.modal-tall type="button" variant="outline-info" slot="detail" slot-scope="props" @click="getDetail(props.row)") {{ $t('檢視') }}
      .float-right(v-if="totalCount && totalCount > 0")
        b-pagination.pagination(v-model="pageNum" :total-rows="totalCount" :per-page="pageSize" @input="changePage()")
    b-modal(v-model="showDetail" :title="$t('細節')" size="xl")
      widget.mb-0.p-0.boardGameRecordPopup(:fetchingData="detailLoading")

        //- 影片
        iframe.video-chess(:src="detailUrl" :key="new Date().getTime()")

        h6.mt-3 {{ $t('桌子資訊') }}
        v-client-table(:columns="colTableInfoDetail" :options="optTableInfoDetail" :data="detailTableInfo")
          template(slot="create_time" slot-scope="props") {{ timestampToDate(props.row.create_time) }}

        h6.mt-3 {{ $t('玩法資訊') }}
        v-client-table(:columns="colPlayInfoDetail" :options="optPlayInfoDetail" :data="detailPlayInfo")
          .specialConfig(v-if="props.row.special_card_config" slot="special_card_config" slot-scope="props")
            span(v-for="(item, i) in props.row.special_card_config" :key="'specialCardConfig' + i") {{ item }}
              span(v-if="props.row.special_card_config && props.row.special_card_config.length > 1 && i !== props.row.special_card_config.length-1") {{ ',&nbsp;' }}
        template(v-if="detailGameId === 'mahjong_table'")
          h6.mt-3 {{ $t('當局資訊') }}
          v-client-table(:columns="colCurrentInfoDetail" :options="optCurrentInfoDetail" :data="detailCurrentInfo")
            .mahjongResult(v-if="props.row.result" slot="result" slot-scope="props") 
              span(v-for="(item, i) in props.row.result" :key="'result' + i") {{ item }}
                span(v-if="props.row.result.length > 1 && i !== props.row.result.length-1") {{ ',&nbsp;' }}

        h6.mt-3 {{ $t('當局玩家遊戲資訊') }}
        v-client-table.playerData(name="roundInfo" :columns="colPlayerInfoDetail" :options="optPlayerInfoDetail" :data="detailPlayerInfo")
          //- 13張
          template(slot="special_card_type" slot-scope="props")
            .playerCardType(v-if="props.row._is_special === 0")
              span {{ '頭墩：' + props.row.special_card_type[0] }}      
              span {{ '中墩：' + props.row.special_card_type[1] }}      
              span {{ '尾墩：' + props.row.special_card_type[2] }}      
            template(v-else) {{ props.row.special_card_type }}
          template(slot="cards" slot-scope="props")       
            .cardGroup.topCard
              div(v-for="(image, i) in props.row.cards" :key="'top' + image + i")
                img.imgCard(v-if="i<3" :src="`/images/game/${image}`" :alt="image")
            .cardGroup
              div(v-for="(image, i) in props.row.cards" :key="'mid' + image + i")
                img.imgCard(v-if="i>=3 && i<8" :src="`/images/game/${image}`" :alt="image")
            .cardGroup
              div(v-for="(image, i) in props.row.cards" :key="'bottom' + image + i")
                img.imgCard(v-if="i>=8 && i<=12" :src="`/images/game/${image}`" :alt="image")
          //- 麻將
          template(slot="flower_cards" slot-scope="props")
            .mahjongCardGroup
              .flowerCardGroup(v-if="props.row.flower_cards && props.row.flower_cards.length>0")
                div(v-for="(image, i) in props.row.flower_cards" :key="'flowerCards' + image + i")
                  img.imgCard(:src="`/images/game/${image}.png`" :alt="image")
              .mahjongCard
                .mahjongCardType.mahjongCardMarginRight(v-if="props.row.special_card_type && props.row.special_card_type.length>0" v-for="item in props.row.special_card_type")
                  //- 吃
                  .cardType
                    div(v-if="item._type === 1" v-for="(image, i) in item.cards" :key="'eatCards' + image + i")
                      img.imgCard(:src="`/images/game/${image}.png`" :alt="image")
                      img.imgCard(v-if="i === 0" :src="`/images/game/${item.main_card}.png`" :alt="item.main_card")
                  //- 碰
                  .cardType
                    div(v-if="item._type === 2" v-for="i of 3" :key="'touchCards' + item.cards + i")
                      img.imgCard(:src="`/images/game/${item.cards}.png`" :alt="item.cards")
                  //- 槓
                  .cardType.kongGroup(v-if="[3, 4, 5].includes(item._type)")
                    div(v-for="i of 3" :key="'kongCards' + item.cards[0] + i")
                      img.imgCard(:src="`/images/game/${item.cards[0]}.png`" :alt="item.cards[0]")
                    img.imgCard.kongCard(:src="`/images/game/${item.cards[0]}.png`" :alt="item.cards[0]")
                    span(v-if="[4].includes(item._type)") {{ '(暗槓)' }}
                    span(v-if="[5].includes(item._type)") {{ '(補槓)' }}
                .handCards(v-if="props.row.hand_cards && props.row.hand_cards.length>0")
                  div(v-for="(image, i) in props.row.hand_cards" :key="'handCards' + image + i")
                    img.imgCard(:src="`/images/game/${image}.png`" :alt="image")
                template(v-if="props.row.win_card")
                  img.imgCard(:src="`/images/game/${props.row.win_card}.png`" :alt="props.row.win_card")

      template(v-slot:modal-footer)
        b-button.btn-sm(variant="outline-secondary" @click="showDetail=false") {{ $t('關閉') }}

    b-modal(v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" size="xs" centered)
      .text-center(v-if="modeMessage=='notice'")
        label {{ $t(message) }}

      template(v-slot:modal-footer)
        div(v-if="modeMessage=='notice'")
          b-button.btn-sm(variant="outline-primary" @click="showMessage=false") {{ $t('確認') }}
</template>

<script>
import moment from 'moment'
import Widget from '@/components/Widget/Widget'
import DatePicker from 'vue2-datepicker'
import i18n from '@/locales'
import Message from '@/mixins/message'
import { videoPlayer } from 'vue-video-player'
import 'videojs-contrib-hls/dist/videojs-contrib-hls'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import { getOperatorList, getGameList, getPlayerRecord, getGameRecord, addVendorLog } from '@/services/service'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'BoardGameRecord',

    components: { 
      'widget': Widget, 
      'date-picker': DatePicker, 
      'video-player': videoPlayer,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: [],
        optRecord: {
          perPage: 50,
          perPageValues: [50],
          pagination: { show: false },
          texts: { 
            filterPlaceholder: i18n.t('篩選'), 
            filter: '', count: '', limit: '', page: ''
          },
          filterable: false,
          columnsClasses: { 
            round_num: 'numberRight', total_win_poiont: 'numberRight',
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {},
          cellClasses: {
            winLose: [
              {
                  class: 'text-danger',
                  condition: row => parseFloat(row.winLose) < 0
              }
            ]
          },
        },
        // 桌子資訊
        colTableInfoDetail: [],
        optTableInfoDetail: {
          perPage: 5,
          perPageValues: [5],          
          pagination: { chunk: 10, dropdown: false, edge: true },
          filterable: false,
          texts: { filter: '', count: '', limit: '' },
          columnsClasses: {
            player_limit: 'numberRight',
          },
          skin: 'table table-striped',
          sortable: [],
          sortIcon: {
              base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          hiddenColumns: [],
          headings: {}
        },
        // 玩法資訊
        colPlayInfoDetail: [],
        optPlayInfoDetail: {
          perPage: 5,
          perPageValues: [5],
          pagination: { chunk: 10, dropdown: false, edge: true },
          filterable: false,
          texts: { filter: '', count: '', limit: '' },
          columnsClasses: {
            round_limit: 'numberRight', ante: 'numberRight', fan_point: 'numberRight',
          },
          skin: 'table table-striped',
          sortable: [],
          sortIcon: {
              base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          hiddenColumns: [],
          headings: {}
        },
        // 當局資訊
        colCurrentInfoDetail: [],
        optCurrentInfoDetail: {
          perPage: 5,
          perPageValues: [5],
          pagination: { chunk: 10, dropdown: false, edge: true },
          filterable: false,
          texts: { filter: '', count: '', limit: '' },
          columnsClasses: {
            total_fan: 'numberRight',
          },
          skin: 'table table-striped',
          sortable: [],
          sortIcon: {
              base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          hiddenColumns: [],
          headings: {}
        },
        // 當局玩家遊戲資訊
        colPlayerInfoDetail: [],
        optPlayerInfoDetail: {
          perPage: 5,
          perPageValues: [5],
          pagination: { chunk: 10, dropdown: false },
          filterable: false,
          texts: { filter: '', count: '', limit: '' },
          columnsClasses: {
            settle: 'numberRight', total_win_poiont: 'numberRight',
          },
          skin: 'table table-striped',
          sortable: [],
          sortIcon: {
              base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          hiddenColumns: [],
          headings: {}
        },

        pageNum: 1,
        pageSize: 50,
        totalCount: 0,
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showDetail: false,
        invalid: {
          'timePeriod': false
        },
        hasVideo: {
          audere: false,
          chess: false,
        },
        urlVideo: {
          audere: '',
          chess: '',
        },
        overTime: false,
        overTimeText: '',
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        loading: false,
        operatorList: [],
        gameList: [],
        userAccount: '',
        tableId: '',
        merchantId: '',
        gameId: '',
        recordData: [],
        detailData: [],
        detailTableInfo: [],
        detailPlayInfo: [],
        detailCurrentInfo: [],
        detailPlayerInfo: [],
        detailGameId: '',
        detailUrl: '',
        detailLoading: false,
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    computed: {
      formatTotalCount() {
        return numberFormat(this.totalCount, 0)
      }
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
      async search() {
        if(this.invalid.timePeriod) return

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        this.init()
        this.CHANGE_COLUMN_RECORD(this.gameId)
        await this.getPlayerRecord()
        this.formatRecordData()
        
        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },

      async getDetail(data) {
        this.detailLoading = true
        this.showDetail = true
        this.detailGameId = data.game_name
        await this.getGameRecord(data)
        this.CHANGE_COLUMN_DETAIL(data)
        this.formatDetailData()

        this.detailLoading = false
      },

      CHANGE_COLUMN_RECORD(gameId) {
        switch(gameId) {
          case 'caspasusun_table':
          case 'mahjong_table':
          default:
            this.colRecord = ['round_start_time', 'vendor_name', 'game_name', 'table_id', 'table_uuid', 
                      'player_agent_id', 'round_num', 'total_win_poiont', 'detail']
            this.optRecord.headings = {
              'round_start_time': () => i18n.t('時間'),
              'vendor_name': () => i18n.t('平台商'),
              'game_name': () => i18n.t('遊戲代碼'),
              'table_id': () => i18n.t('桌號'),
              'table_uuid': () => i18n.t('系统唯一桌號'),
              'player_agent_id': () => i18n.t('會員帳號'),  
              'round_num': () => i18n.t('局次'),
              'total_win_poiont': () => i18n.t('總輸贏'),
              'detail': () => i18n.t('細節'),
            }       
            break
        }
      },

      CHANGE_COLUMN_DETAIL(item) {
        if(item.game_name === 'caspasusun_table') {
          this.colTableInfoDetail = [
            'create_time', 'create_type', 'table_id', 'room_name', 'owner_agent_id',
            'payment_type', 'player_limit', 'watch_mode'
          ]
          this.optTableInfoDetail.headings = {
            'create_time': () => i18n.t('創桌時間'),
            'create_type': () => i18n.t('開桌類型'),
            'table_id': () => i18n.t('桌號'),                    
            'room_name': () => i18n.t('桌名'),                    
            'owner_agent_id': () => i18n.t('開桌者帳號'),                    
            'payment_type': () => i18n.t('支付類型'),                    
            'player_limit': () => i18n.t('玩家人數'),                    
            'watch_mode': () => i18n.t('觀戰模式'),                    
          }

          this.colPlayInfoDetail = [
            'play_type', 'change_three', 'card_config', 'special_card_config', 'round_limit',
            'ante', 'auto_finishing_config', 'think_time'
          ]
          this.optPlayInfoDetail.headings = {
            'play_type': () => i18n.t('玩法類型'),
            'change_three': () => i18n.t('換3張'),
            'card_config': () => i18n.t('牌數配置'),              
            'special_card_config': () => i18n.t('特殊牌型'),              
            'round_limit': () => i18n.t('總局數'),   
            'ante': () => i18n.t('底注'),   
            'auto_finishing_config': () => i18n.t('自動理牌'),
            'think_time': () => i18n.t('理牌時間'),
          }

          this.colPlayerInfoDetail = [
            'agent_id', 'cards', 'special_card_type', 'settle', 'total_win_poiont',
          ]
          this.optPlayerInfoDetail.headings = {
            'agent_id': () => i18n.t('會員帳號'),
            'cards': () => i18n.t('牌'),
            'special_card_type': () => i18n.t('牌型'),              
            'settle': () => i18n.t('墩數'),              
            'total_win_poiont': () => i18n.t('輸贏'),    
          }
        } else if (item.game_name === 'mahjong_table') {
          this.colTableInfoDetail = [
            'create_time', 'create_type', 'table_id', 'room_name', 'owner_agent_id',
            'payment_type', 'player_limit', 'watch_mode'
          ]
          this.optTableInfoDetail.headings = {
            'create_time': () => i18n.t('創桌時間'),
            'create_type': () => i18n.t('開桌類型'),
            'table_id': () => i18n.t('桌號'),                    
            'room_name': () => i18n.t('桌名'),                    
            'owner_agent_id': () => i18n.t('開桌者帳號'),                    
            'payment_type': () => i18n.t('支付類型'),                    
            'player_limit': () => i18n.t('玩家人數'),                    
            'watch_mode': () => i18n.t('觀戰模式'),                    
          }

          this.colPlayInfoDetail = [
            'play_type', 'has_flower_card', 'special_card_config', 'round_limit', 'ante',
            'fan_point', 'max_fan', 'think_time'
          ]
          this.optPlayInfoDetail.headings = {
            'play_type': () => i18n.t('特殊玩法'),
            'has_flower_card': () => i18n.t('花牌'),
            'special_card_config': () => i18n.t('特殊牌型'),              
            'round_limit': () => i18n.t('圈數'),              
            'ante': () => i18n.t('底分'),   
            'fan_point': () => i18n.t('台分'),   
            'max_fan': () => i18n.t('封頂'),   
            'think_time': () => i18n.t('出牌時間'),   
          }

          this.colCurrentInfoDetail = [
            'round_num', 'game_round', 'round_wind', 'result', 'total_fan',
          ]
          this.optCurrentInfoDetail.headings = {
            'round_num': () => i18n.t('局次'),
            'game_round': () => i18n.t('圈次'),
            'round_wind': () => i18n.t('風圈位'),              
            'result': () => i18n.t('遊戲結果'),              
            'total_fan': () => i18n.t('總台數'),   
          }

          this.colPlayerInfoDetail = [
            'agent_id', 'chair_id', 'flower_cards', 'total_win_poiont',
          ]
          this.optPlayerInfoDetail.headings = {
            'agent_id': () => i18n.t('會員帳號'),
            'chair_id': () => i18n.t('風位置'),
            'flower_cards': () => i18n.t('牌'),                          
            'total_win_poiont': () => i18n.t('輸贏'),    
          }
        }
      },

      changeDate() {
        if(!this.datePeriod[0] || !this.datePeriod[1]) {
          this.invalid['timePeriod'] = true
        }
        else {
          this.invalid['timePeriod'] = false
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
            merchant_id: this.merchantId,                                  
            game_type: 9,
            is_all: false,
          }
        }
        try {
          let temp = await getGameList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.gameList = temp?.result
            this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
            this.gameId = this.gameList?.[0]?.game_realcode
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getPlayerRecord() {
        const body = {
          data: {
            merchant_id: this.merchantId,
            vendor_code: sessionStorage.getItem('vendor_code'),
            table_id: this.tableId,
            game_id: this.gameId,
            player_agent_id: this.userAccount,
            begin_time: Math.floor(Date.parse(this.datePeriod[0]) / 1000),
            end_time: Math.floor(Date.parse(this.datePeriod[1]) / 1000),
            page_num: this.pageNum,
            page_size: 50,
          }
        }
        try {
          let temp = await getPlayerRecord(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.recordData = temp?.result
            this.totalCount = temp?.count
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
            'route': '/api/getPlayerRecord',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.recordData)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getGameRecord(item) {
        const body = {
          data: {
            merchant_id: this.merchantId,
            table_uuid: item.table_uuid,
            game_id: item.game_name,
            vendor_code: sessionStorage.getItem('vendor_code'),
            round_num: item.round_num
          }
        }
        try {
          let temp = await getGameRecord(body)
          if (temp.code !== 1000) {
            this.init()
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.detailData = temp?.result
            this.detailTableInfo = [temp?.result?.table_info]
            this.detailPlayInfo = [temp?.result?.play_info]
            this.detailCurrentInfo = [temp?.result?.current_info]
            this.detailPlayerInfo = temp?.result?.current_player_game_info?.players
            this.detailUrl = temp?.result?.film_url
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      timestampToDate(timestamp) {
        return moment(new Date(timestamp*1000)).format('YYYY-MM-DD HH:mm:ss')
      },

      init() {
        this.detailData = []
        this.detailTableInfo = []
        this.detailPlayInfo = []
        this.detailCurrentInfo = []
        this.detailPlayerInfo = []
        this.detailUrl = ''
        this.detailGameId = ''
        this.pageNum = 1
      },

      formatRecordData() {
        this.recordData?.forEach(item => {
          item.total_win_poiont = numberFormat(item?.total_win_poiont, 2)
        })
      },

      formatDetailData() {
        this.detailPlayInfo?.forEach(item => {
          item.ante = numberFormat(item?.ante, 2)
          item.fan_point = numberFormat(item?.fan_point, 2)
        })

        this.detailPlayerInfo?.forEach(item => {
          item.total_win_poiont = numberFormat(item?.total_win_poiont, 2)
        })
      },

      async changePage() {
        // this.$refs.tbRecord.setPage(this.pageNum)
        this.loading = true
        await this.getPlayerRecord()
        this.formatRecordData()
        this.loading = false
      }
    },

    async mounted() {
      await this.getOperatorList()
      await this.getGameList()

      this.CHANGE_COLUMN_RECORD()

      let _dateFormat = 'YYYY-MM-DD HH:mm:00'
      let _dateNow = new Date()  // '2020-10-20 23:00:00'
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600 * 1000 * 24 * 7)  // '2020-10-20 00:00:00'
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)]
    },
}
</script>


<style lang="scss">
  .video-chess {
    max-width: 100%;
    margin: 20px auto;
    border: none;
    aspect-ratio: 16 / 9;
    width: 100%;
  }

  .tableCard {
    display: flex;
    flex-direction: row;
  }

  .imgCard {
    max-width: 35px;
    width: 35px;
  }

  .VueTables .VuePagination {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0;
    margin: 0;
  }

  .boardGameRecord .table th,
  .boardGameRecord .table td {
    vertical-align: inherit;
  }

  .playerCardType {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .cardGroup {
    display: flex;
  }

  .topCard {
    margin-left: 35px;
  }

  .playerData .VueTables__row td {
    &:nth-last-child(1) {
      vertical-align: middle
    }
    &:nth-last-child(2) {
      vertical-align: middle
    }
    &:nth-last-child(3) {
      vertical-align: middle
    }
    &:nth-last-child(4) {
      vertical-align: middle
    }
    &:nth-last-child(5) {
      vertical-align: middle
    }
  }

  .flowerCardGroup,
  .mahjongCard,
  .mahjongCardType,
  .cardType,
  .handCards {
    display: flex;
  }

  .specialConfig {
    max-width: 500px;
  }

  .mahjongResult {
    max-width: 700px;
  }

  .flowerCardGroup {
    margin-bottom: 6px;
  }

  .mahjongCardMarginRight,
  .handCards {
    margin-right: 6px;
  }

  .kongGroup {
    position: relative;
  }

  .kongCard {
    position: absolute;
    top: 8px;
    left: 35px;
  }

  .numberRight {
    text-align: end;
  }

  .boardGameRecordPopup {
    .widgetBody {
      width: 100%;
    }
  }

</style>