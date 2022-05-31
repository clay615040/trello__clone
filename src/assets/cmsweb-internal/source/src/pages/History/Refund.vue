<template lang="pug">
  .refund
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('沖銷紀錄')}</h4>`" customHeader :fetchingData="false")
      .row.mt-4.px-3
        .form-group.col-12.col-md-3.px-2
          label(for="txtBetNumber") {{ $t('注單編號') }}
          input#txtBetNumber.form-control(type="text" v-model="bet_number")
        .form-group.col-12.col-md-3.px-2
          label(for="selVendorCode") {{ $t('平台商') }}
          select#selVendorCode.form-control(v-model="merchantId" @change="getGameList(false)")
            option(v-for="(value, key) in operatorList" :key="key" :value="value.code") {{ value.name }}
        .form-group.col-12.col-md-3.px-2
          label(for="selGameId") {{ $t('遊戲代碼') }}
          select#selGameId.form-control(v-model="gameId")
            option(v-for="(value, key) in gameList" :key="key" :value="value.game_code") {{ value.game_name_lang + ' ' }}
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
      button.refundBtn(variant="primary" @click="refundApplicationPopup()") {{ $t('退款申請') }}
      .float-right(v-if="totalCount")
        label.float-left.pt-2.pr-3 {{ $t('資料筆數') }} : {{ totalCount }}
        b-pagination.pagination(v-model="pageNum" :total-rows="totalCount" :per-page="pageSize" @input="changePage()")
      v-client-table(:columns="colRecord" :options="optRecord" :data="recordData" ref="tbRecord")
        template(v-for="item in itemList" :slot="item.name" slot-scope="props")
          span(v-if="item.id === 1 || item.id === 5" :title="refundTableTooltip(props.row)") {{ timestampToDate(props.row[item.name]) }}
          span(v-else-if="item.id === 11 || item.id === 12" :title="refundTableTooltip(props.row)") {{ changeTableValueOldNew(item.name, props.row) }}
          span(v-else-if="item.id === 13" :title="refundTableTooltip(props.row)") {{ changeTableTypeText(props.row[item.name]) }}
          span(v-else :title="refundTableTooltip(props.row)") {{ props.row[item.name] }}
      .float-right(v-if="totalCount")
        b-pagination.pagination(v-model="pageNum" :total-rows="totalCount" :per-page="pageSize" @input="changePage()")
    
    b-modal(v-model="showRefundPopup" :title="$t(popupTitle)" @hide="closeMessage()" body-bg-variant="white" :size="popupSize" centered)
      widget.mb-0(:fetchingData="detailLoading")
        template(v-if="popupTitle === $t('退款申請') && step === 1")
          .refundPopupItem
            span {{ $t('平台商') }}
              span.warn-text *
            select#selVendorCode.form-control(v-model="detailMerchantId" @change="getGameList(true)" :disabled="detailData.length > 0")
              option(v-for="(value, key) in detailOperatorList" :key="key" :value="value.code") {{ value.name }}
          .refundPopupItem
            span {{ $t('遊戲代碼') }}
              span.warn-text *
            select#selGameId.form-control(v-model="detailGameId" :disabled="detailData.length > 0")
              option(v-for="(value, key) in detailGameList" :key="key" :value="value.game_code") {{ value.game_name_lang + ' ' }}
                span ({{ value.game_code }})
          .refundPopupItem(:class="{ 'error': requiredError.betNumber }")
            span {{ $t('注單編號') }}
              span.warn-text *
            input.idInput(v-model.trim="detailBetNumber" :disabled="detailData.length > 0")
          template(v-if="detailData.length > 0")
            .refundPopupItem(v-for="item in detailItemList")
              span {{ $t(item.name) }}
              span(v-if="item.code ==='bet_time'") {{ timestampToDate(detailData[0][item.code]) }}
              span.flex(v-else) {{ detailData[0][item.code] }}
                .totalWinGroup(v-if="refundType === 'part' && item.code === 'total_win'" :class="{ 'error': refundType === 'part' && requiredError.refundTypeInput }")
                  .partText ，{{ $t('調整為') }}
                  input.form-control(type="text" @input="changeInputNumber" @change="changeInputNumber" :value="changeAmount")
                .totalWinGroup(v-if="refundType === 'part' && item.code === 'win_lose'")
                  .partText ，{{ $t('調整為') }} {{ changeWinLose }}
            .refundPopupItem
              input(type="radio" name="refundType" value="all" v-model="refundType" checked)
              label.refundPopupLabel {{ $t('此注全退') }}
              input(type="radio" name="refundType" value="part" v-model="refundType")
              label.refundPopupLabel {{ $t('調整派彩金額') }}({{ $t('請輸入調整後總贏分') }})
            .refundPopupItem.reasonText(:class="{ 'error': requiredError.refundReason }")
              span {{ $t('申請原因') }}
                span.warn-text *
              .textAreaGroup
                textarea.reasonInput(type="text" maxlength="200" minlength="2" required v-model.trim="refundReason")
                .textAreaText {{ $t('還可輸入 {0} 個字', [reasonInputCount]) }}
          template(v-if="detailData.length === 0 && firstSearch")
            span.redText {{ $t('查無此注單或此注單已退款成功/已調整過派彩金額，請勿重覆申請！') }}
        template(v-if="popupTitle === $t('申請確認')")
          .refundPopupItem.boldText(v-if="refundType === 'all'") {{ $t('請再次確認是否退款 ?') }}
          .refundPopupItem.boldText(v-else) {{ $t('請再次確認！') }}
          .refundPopupItem(v-for="item in confirmDetailItemList")
            span {{ $t(item.name) }}
            span.flex(v-if="detailData && detailData.length > 0") {{ detailData[0][item.code] }}
              .totalWinGroup(v-if="refundType === 'part' && item && item.code === 'total_win'")
                .partText ，{{ $t('調整為') }} {{ changeMoney }}
              .totalWinGroup(v-if="refundType === 'part' && item && item.code === 'win_lose'")
                .partText ，{{ $t('調整為') }} {{ changeWinLose }}
          .refundPopupItem
            span {{ $t('申請原因') }}
            span.refundReasonText {{ refundReason }}
        template(v-if="popupTitle === $t('退款成功')")
          .alignCenter
            .refundPopupItem
              span {{ $t('注單編號') }}： {{ detailBetNumber }}
            .refundPopupItem
              div.boldText(v-if="refundType === 'all'") {{ $t('已完成退款申請') }} ！
              div.boldText(v-else) {{ $t('已完成調整派彩金額申請') }} ！
        template(v-if="popupTitle === $t('申請失敗')")
          .alignCenter
            .refundPopupItem
              span {{ $t('注單編號') }}： {{ detailBetNumber }}
            .refundPopupItem
              div.refundReasonText.boldText {{ failText }}
          
      template(v-slot:modal-footer)
        b-button.btn-sm(v-if="detailData.length === 0" variant="outline-primary" @click="getBetExcludeRefund()" :disabled="detailLoading") {{ $t('搜尋') }}
        b-button.btn-sm(v-else-if="detailData.length > 0 && step === 1" variant="outline-primary" @click="confirmReversal()") {{ $t('確認') }}
        b-button.btn-sm(v-else-if="step === 2" variant="outline-primary" @click="refundApplication()") {{ $t('確認') }}
        b-button.btn-sm(v-if="detailData.length > 0 && step !== 0" variant="outline-secondary" @click="popupInit()") {{ $t('返回') }}
        b-button.btn-sm(v-else variant="outline-secondary" @click="closeMessage()") {{ $t('關閉') }}

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
import { getOperatorList, getGameList, getRefund, getBetExcludeRefund, refundApplication, addVendorLog } from '@/services/service'
import { numberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'Refund',

    components: { 
      'widget': Widget, 
      'date-picker': DatePicker, 
      'video-player': videoPlayer,
      VueCircleProgress,
    },

    data() {
      return {
        colRecord: [
          'refund_application', 'bet_number', 'round_id', 'round_string', 'bet_time',
          'user_name', 'merchant_id', 'game_id', 'currency', 'total_bet',
          'total_win', 'win_lose', 'refund_result'
        ],
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
            id: 'width-100', total_bet: 'numberRight', total_win: 'numberRight', win_lose: 'numberRight', service_fee: 'numberRight',
            Jackpot: 'numberRight', bonus: 'numberRight',
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {
            'refund_application': () => i18n.t('申請時間'),
            'bet_number': () => i18n.t('注單編號'),
            'round_id': () => i18n.t('系統局號'),
            'round_string': () => i18n.t('遊戲局號'),
            'bet_time': () => i18n.t('投注時間'),
            'user_name': () => i18n.t('使用者名稱'),
            'merchant_id': () => i18n.t('平台商'),
            'game_id': () => i18n.t('遊戲代碼'),
            'currency': () => i18n.t('幣別'),
            'total_bet': () => i18n.t('總投注'),
            'total_win': () => i18n.t('總贏分'),
            'win_lose': () => i18n.t('總輸贏'),
            'service_fee': () => i18n.t('服務費'),
            'bonus': () => i18n.t('額外獎金'),
            'refund_result': () => i18n.t('申請狀態'),
          },
          cellClasses: {
            refund_application: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            bet_number: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            round_string: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            round_id: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            bet_time: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            user_name: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            merchant_id: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            game_id: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            currency: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            total_bet: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            total_win: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            win_lose: [
              {
                class: 'text-danger',
                condition: row => parseFloat(row.win_lose) < 0
              },
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
            refund_result: [
              {
                class: 'refundText',
                condition: row => row.refund_result >2
              },
            ],
          },
        },
        pageNum: 1,
        pageSize: 50,
        totalCount: 0,
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showRefundPopup: false,
        invalid: {
          'timePeriod': false
        },
        overTime: false,
        overTimeText: '',
        modeMessage: '',
        message: '',
        showMessage: false,
        loading: false,
        operatorList: [],
        gameList: [],
        bet_number: '',
        merchantId: '',
        gameId: '',
        recordData: [],
        detailData: [],
        detailBetNumber: '',
        detailMerchantId: '',
        detailGameId: '',
        detailLoading: false,
        detailItemList: [
          { name: '系統局號', code: 'round_id' },
          { name: '遊戲局號', code: 'round_string' },
          { name: '投注時間', code: 'bet_time' },
          { name: '使用者帳號', code: 'user_name' },
          { name: '總投注', code: 'total_bet' },
          { name: '總贏分', code: 'total_win' },
          { name: '總輸贏', code: 'win_lose' },
          
        ],
        confirmDetailItemList: [
          { name: '注單編號', code: 'bet_number' },
          { name: '總投注', code: 'total_bet' },
          { name: '總贏分', code: 'total_win' },
          { name: '總輸贏', code: 'win_lose' },
        ],
        refundReason: '',
        reasonInputMaxCount: 200,
        itemList: [
          { id: 1, name: 'refund_application', },
          { id: 2, name: 'bet_number' },
          { id: 3, name: 'round_id' },
          { id: 4, name: 'round_string' },
          { id: 5, name: 'bet_time' },
          { id: 6, name: 'user_name' },
          { id: 7, name: 'merchant_id' },
          { id: 8, name: 'game_id' },
          { id: 9, name: 'currency' },
          { id: 10, name: 'total_bet' },
          { id: 11, name: 'total_win' },
          { id: 12, name: 'win_lose' },
          { id: 13, name: 'refund_result' },
        ],
        firstSearch: false,
        popupTitle: i18n.t('退款申請'),
        popupSize: '',
        requiredError: {
          betNumber: false,
          refundReason: false,
          refundTypeInput: false
        },
        step: 1,
        failText: '',
        refundType: 'all',
        oldNum: '',
        changeMoney: '',
        detailOperatorList: [],
        detailGameList: [],
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    computed: {
      reasonInputCount() {
        return this.reasonInputMaxCount - this.refundReason.length
      },
      changeAmount() {
        return this.oldNum
      },
      changeWinLose() {
        return numberFormat(this.changeAmount - this.detailData[0]['total_bet'], 2)
      }
    },

    watch: {
      'refundReason'() {
        if(this.refundReason.length >=2) {
          this.requiredError.refundReason = false
        }
      },
      'changeAmount'() {
        if(this.changeAmount >= 0) {
          this.requiredError.refundTypeInput = false
        }
      },
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
        await this.getRefund()
        this.changeTableCol()
        this.formatRecordData()
        
        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
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
            this.detailOperatorList = { ...temp?.result }
            this.operatorList.unshift({ code: '', id: '', name: 'All'})
            this.merchantId = this.operatorList?.[0]?.code
            this.detailMerchantId = this.detailOperatorList?.[0]?.code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getGameList(isPopup) {
        const body = {
          data: {
            vendor_id: parseInt(sessionStorage.getItem('vendor_id')),
            language: sessionStorage.getItem('language'),
            is_all: false,
            merchant_id: isPopup ? this.detailMerchantId : this.merchantId ,                                  
          }
        }
        try {
          let temp = await getGameList(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.gameList = temp?.result
            this.detailGameList = { ...temp?.result }
            this.gameList.unshift({ game_code: '', id: '', game_name_lang: 'All'})
            this.gameId = this.gameList?.[0]?.game_code
            this.detailGameId = this.detailGameList?.[0]?.game_code
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getRefund() {
        const body = {
          data: {
            bet_number: this.bet_number,
            merchant_id: this.merchantId,
            game_id: this.gameId,
            start_time: this.datePeriod[0],
            end_time: this.datePeriod[1],
            page_no: 1,
            page_size: 5000,
            vendor_code: sessionStorage.getItem('vendor_code')
          }
        }
        try {
          let temp = await getRefund(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.recordData = temp?.result
            this.totalCount = temp?.result?.length
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
            'route': '/api/getRefund',
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

      async getBetExcludeRefund() {
        if(!this.detailMerchantId || !this.detailGameId || !this.detailBetNumber) {
          this.requiredError.betNumber = true
          return
        } else {
          this.requiredError.betNumber = false
        }

        this.detailLoading = true

        const body = {
          data: {
            bet_number: this.detailBetNumber,                                  
            merchant_id: this.detailMerchantId,
            game_id: this.detailGameId
          }
        }
        try {
          let temp = await getBetExcludeRefund(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            if(temp?.result.length === 0) this.firstSearch = true
            else {
              this.firstSearch = false
              this.detailData = temp?.result
              this.detailData?.forEach(item => {
                item.total_bet = numberFormat(item?.total_bet, 2)
                item.total_win = numberFormat(item?.total_win, 2)
                item.win_lose = numberFormat(item?.win_lose, 2)
                item.service_fee = numberFormat(item?.service_fee, 2)
                item.jackpot = numberFormat(item?.jackpot, 2)
                item.tax_amount = numberFormat(item?.tax_amount, 2)
                item.bonus = numberFormat(item?.bonus, 2)
              })
            }
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }

        this.detailLoading = false
      },

      async refundApplication() {
        const body = {
          data: {
            bet_number: this.detailBetNumber,
            merchant_id: this.detailMerchantId,
            game_id: this.detailGameId,
            round_id: this.detailData?.[0]?.round_id,
            reason: this.refundReason,
            bet_time: this.timestampToDate(this.detailData?.[0]?.bet_time),
            new_total_win: this.refundType === 'part' ? this.changeAmount : ''
          }
        }

        try {
          let temp = await refundApplication(body)
          if (temp.code !== 1000) {
            this.SHOW_MESSAGE(temp.code, Message[temp.code])
          } else {
            this.step = 0
            if(temp.result.code === 0) {
              this.popupTitle = i18n.t('退款成功')
            } else {
              this.popupTitle = i18n.t('申請失敗')
              if(temp.result.code === 2006) {
                this.failText = '2006，' + i18n.t('注單不存在')
              } else if(temp.result.code === 9999) {
                this.failText = '9999，' + i18n.t('其他錯誤')
              } 
            }
          }
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      timestampToDate(timestamp) {
        return moment(new Date(timestamp*1000)).format('YYYY-MM-DD HH:mm:ss')
      },

      formatRecordData() {
        this.recordData?.forEach(item => {
          item.total_bet = numberFormat(item?.total_bet, 2)
          item.total_win = numberFormat(item?.total_win, 2)
          item.old_total_win = numberFormat(item?.old_total_win, 2)
          item.win_lose = numberFormat(item?.win_lose, 2)
          item.old_win_lose = numberFormat(item?.old_win_lose, 2)
        })
        this.totalCount = numberFormat(this.totalCount, 0)
      },

      changePage() {
        this.$refs.tbRecord.setPage(this.pageNum)
      },

      async refundApplicationPopup() {
        this.showRefundPopup = true
        this.popupTitle = i18n.t('退款申請')
        this.popupSize = 'lg'
        await this.getGameList(true)
      },

      refundTableTooltip(item) {
        let temp = ''
        let tempCode = item.refund_result

        if(item.refund_result === 1 || item.refund_result === 2) {
          temp = i18n.t('申請原因') + '：' + item.reason
        } else {
          if(tempCode === 2006) temp = i18n.t('失敗原因') + '：' + tempCode + '，' + i18n.t('注單不存在')
          else if(tempCode === 9999) temp = i18n.t('失敗原因') + '：' + tempCode + '，' + i18n.t('其他錯誤')
          else temp = i18n.t('失敗原因') + '：' + item.refund_result_message
        }

        return temp
      },

      closeMessage() {
        this.showRefundPopup = false
        this.step = 1
        this.bet_number = ''
        this.detailData = []
        this.detailBetNumber = ''
        this.refundReason = ''
        this.failText = ''
        this.requiredError.betNumber = false
        this.requiredError.refundReason = false
        this.requiredError.refundTypeInput = false
        this.firstSearch = false
        this.refundType = 'all'
        this.oldNum = ''
        this.changeMoney = ''
      },

      confirmReversal() {
        if(this.refundReason.length < 2) {
          this.requiredError.refundReason = true
        } else if(this.refundType === 'part' && !this.changeAmount) {
          this.requiredError.refundTypeInput = true
        } else {
          this.requiredError.refundReason = false
          this.requiredError.refundTypeInput = false
          this.changeMoney = numberFormat(this.changeAmount, 2)
          this.step = 2
          this.popupTitle = i18n.t('申請確認')
          this.popupSize = 'lg'
        }
      },

      popupInit() {
        if(this.step === 2) {
          this.popupTitle = i18n.t('退款申請')
          this.step = 1
        } else {
          this.detailData = []
        }
      },

      init() {
        this.recordData = []
      },

      detailTypeChange() {
        if(sessionStorage.getItem('vendor_code') === 'audere') {
          this.detailItemList.push(
            { name: '總稅金', code: 'tax_amount' },
            { name: '額外獎金', code: 'bonus' },
          )
        } else if(sessionStorage.getItem('vendor_code') === 'chess') {
          this.detailItemList.push(
            { name: '服務費', code: 'service_fee' },
            { name: '彩金', code: 'jackpot' },
            { name: '額外獎金', code: 'bonus' },
          )
        } else {
          this.detailItemList.push(
            { name: '總稅金', code: 'tax_amount' },
            { name: '服務費', code: 'service_fee' },
            { name: '彩金', code: 'jackpot' },
            { name: '額外獎金', code: 'bonus' },
          )
        }
      },
      changeInputNumber(event) {
        let val = event.target.value.trim()
          if (/^\d\d*$|^$/.test(val)) {
            this.oldNum = val
          } else {
            event.target.value = this.oldNum
          }
      },
      changeTableTypeText(type) {
        let tempText = ''
        let tempType = ''
        if(type<3) tempText = i18n.t('成功')
        else tempText = i18n.t('失敗')
        if(type%2===0) tempType = i18n.t('調整派彩')
        else tempType = i18n.t('退注')

        return `${tempText}(${tempType})`
      },

      changeTableCol() {
        let tempDataState = 'notChange'

        this.recordData.find(item => {
          if(typeof item?.old_total_win === 'number' && typeof item?.old_win_lose === 'number') {
            tempDataState = 'hasChange'
          }
        })

        
        switch(tempDataState) {
          case 'hasChange':
            this.optRecord.headings = {
              'refund_application': () => i18n.t('申請時間'),
              'bet_number': () => i18n.t('注單編號'),
              'round_id': () => i18n.t('系統局號'),
              'round_string': () => i18n.t('遊戲局號'),
              'bet_time': () => i18n.t('投注時間'),
              'user_name': () => i18n.t('使用者名稱'),
              'merchant_id': () => i18n.t('平台商'),
              'game_id': () => i18n.t('遊戲代碼'),
              'currency': () => i18n.t('幣別'),
              'total_bet': () => i18n.t('總投注'),
              'total_win': () => i18n.t('總贏分(調整前)'),
              'win_lose': () => i18n.t('總輸贏(調整前)'),
              'service_fee': () => i18n.t('服務費'),
              'Jackpot': () => i18n.t('彩金'),
              'bonus': () => i18n.t('額外獎金'),
              'refund_result': () => i18n.t('申請狀態'),
            }    
            break

          case 'notChange':
          default:
            this.optRecord.headings = {
              'refund_application': () => i18n.t('申請時間'),
              'bet_number': () => i18n.t('注單編號'),
              'round_id': () => i18n.t('系統局號'),
              'round_string': () => i18n.t('遊戲局號'),
              'bet_time': () => i18n.t('投注時間'),
              'user_name': () => i18n.t('使用者名稱'),
              'merchant_id': () => i18n.t('平台商'),
              'game_id': () => i18n.t('遊戲代碼'),
              'currency': () => i18n.t('幣別'),
              'total_bet': () => i18n.t('總投注'),
              'total_win': () => i18n.t('總贏分'),
              'win_lose': () => i18n.t('總輸贏'),
              'service_fee': () => i18n.t('服務費'),
              'Jackpot': () => i18n.t('彩金'),
              'bonus': () => i18n.t('額外獎金'),
              'refund_result': () => i18n.t('申請狀態'),
            }       
        }
      },

      changeTableValueOldNew(tempType, tempData) {
        // refund_result === 1 3  成功 失敗(全退)
        if(tempData?.refund_result === 1 || tempData?.refund_result === 3) return tempData?.[tempType]
        // refund_result === 2 4  成功 失敗(調整退款)
        else if(tempData?.refund_result === 2 || tempData?.refund_result === 4) return tempData?.[tempType] + `(${tempData?.['old_'+ tempType]})`
      }
    },

    async mounted() {
      await this.getOperatorList()
      await this.getGameList(false)
      this.changeTableCol()

      let _dateFormat = 'YYYY-MM-DD HH:mm:00'
      let _dateNow = new Date()  // '2020-10-20 23:00:00'
      let _datePre = new Date().setTime(_dateNow.getTime() - 3600 * 1000 * 24 * 7)  // '2020-10-20 00:00:00'
      this.datePeriod = [moment(_datePre).format(_dateFormat), moment(_dateNow).format(_dateFormat)]

      this.detailTypeChange()
    },
}
</script>


<style lang="scss">
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

  .numberRight {
    text-align: end;
  }

  .refund .refundBtn {
    margin-bottom: 14px;
    padding: 5.25px 14px;
    height: 33.5px;
    border: 0;
    border-radius: 7px;
    color: white;
    background-color: #005792;
    font-size: 14px;

    &:active {
      background-color: #00395f ; 
    }
  }

  .refundPopupItem {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    line-height: 33.5px;

    span {
      min-width: 165px;
      margin-right: 6px;
      white-space: nowrap;
    }

    button {
      margin-left: 6px;
      white-space: nowrap;
    }

    .refundReasonText {
      white-space: pre-wrap;
      line-height: 20px;
    }
  }

  .refundPopupLabel {
    margin: 0 0 0 4px;
    min-width: 155px;
  }

  .idInput {
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
    outline: none;
  }

  .reasonInput {
    width: 100%;
    height: 135px;
    color: #495057;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
    outline: none;
    resize: none;
  }

  .textAreaGroup {
    width: 100%;
    line-height: 20px;
    color: #798892;
  }

  .reasonText {
    align-items: flex-start;
  }

  .btn-outline-primary {
    color: #fff;
    background-color: #005792;
    border-color: #005792;
  }

  .redText {
    color: red;
  }

  .boldText {
    font-weight: bold;
  }

  .alignCenter {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .refund .refundText {
    color: darkgray;
  }

  .totalWinGroup {
    display: flex;
  }

  .flex {
    display: flex;
  }

  .partText {
    margin-right: 4px;
  }

</style>