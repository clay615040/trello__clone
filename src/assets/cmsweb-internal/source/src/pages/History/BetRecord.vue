<template lang="pug">
  .betRecord
    widget.mb-4(:title="`<h4 class='fw-semi-bold'>${$t('押注紀錄 (注單)')}</h4>`" customHeader)
      .row.mt-4.px-3
        .form-group.col-12.col-md-4.px-2
            label(for="txtBetNumber") {{ $t('注單編號') }}
            input.form-control#txtBetNumber(type="text" v-model="betNumber")
        .form-group.col-12.col-md-4.px-2
            label(for="txtRoundId") {{ $t('系統局號') }}
            input.form-control#txtRoundId(type="text" v-model="roundId")
        .form-group.col-12.col-md-4.px-2
            label(for="txtRoundString") {{ $t('遊戲局號') }}
            input#txtRoundString.form-control(type="text" v-model="roundString")
      .row.px-3
        .form-group.col-12.col-md-2.px-2
            label(for="txtUserName") {{ $t('使用者 ID') }}
            input#txtUserName.form-control(type="text" v-model="userName")
        .form-group.col-12.col-md-2.px-2
            label(for="selOperator") {{ $t('平台商') }}
            select#selOperator.form-control(v-model="merchantId" @change="getGameList()" :class="{ 'is-invalid': invalid.operator }")
              option(v-for="(value, key) in operatorList" :key="key" :value="value.code" :selected="merchantId") {{ value.name }}
        .form-group.col-12.col-md-2.px-2
            label(for="selGameId") {{ $t('遊戲代碼') }}
            select#selGameId.form-control(v-model="gameId")
              option(v-for="(value, key) in gameList" :key="key" :value="value.game_code" :selected="gameId") {{ value.game_name_lang + ' ' }}
                span(v-if="value.game_name_lang!=='All'") ({{ value.game_code }})
        .form-group.col-12.col-md-5.px-2
            label(for="txtTimePeriod") {{ $t('時間區間') }}
            span.warn-text *
            span.warn-text(v-if="overTime") {{ $t('不能超過 90 天') }}
            date-picker#txtTimePeriod(type="datetime" valueType="format" lang="en" range v-model="datePeriod" :format="dateFormat" :change="CHANGE_DATE()" :not-before="dateBefore" :input-class="{ 'form-control': true, 'is-invalid': invalid.timePeriod }" width="100%")
              i.fa.fa-clock-o(slot="calendar-icon")
        .form-group.col-12.col-md.px-2.d-flex.align-items-end
          b-button(type="button" variant="primary" :disabled="loading" @click="search(true)") {{ $t('搜尋') }}

    widget.mt-5.mb-4(v-if="!loading && summary && summary.length > 0" title="<h5 class='fw-semi-bold'>Summary</h5>" customHeader)
      .table-resposive.mt-4
        table.table
          thead
            tr
              th.hidden-sm-down {{ $t('平台商') }}
              th.hidden-sm-down {{ $t('幣別') }}
              th.hidden-sm-down.numberRight {{ $t('投注') }}
              th.hidden-sm-down.numberRight {{ $t('贏分') }}
              th.hidden-sm-down.numberRight {{ $t('輸贏') }}
              template(v-if="vendorCode === 'chess'")
                th.hidden-sm-down.numberRight {{ $t('服務費') }}
                th.hidden-sm-down.numberRight {{ $t('彩金') }}
              th.hidden-sm-down.numberRight(v-else-if="vendorCode === 'audere'") {{ $t('稅金') }}
              th.hidden-sm-down.numberRight {{ $t('RTP') }}
          tbody
            tr(v-for="(row, index) in summary" :key="index")
              td {{ row.merchant_id }}
              td {{ row.currency }}
              td.numberRight {{ row.total_bet }}
              td.numberRight {{ row.total_win }}
              td.numberRight {{ row.win_lose }}
              template(v-if="vendorCode === 'chess'")
                td.numberRight {{ row.service_fee }}
                td.numberRight {{ row.jackpot }}
              td.numberRight(v-else-if="vendorCode === 'audere'") {{ row.tax_amount }}
              td.numberRight {{ row.rtp }}
      
      .mt-4.refundSummary(v-if="refundSummary && refundSummary.length>0")
        span.fw-semi-bold {{$t('退款概況')}}
        i.fa.fa-question-circle-o.refundSummaryIcon(aria-hidden="true" :title="$t('僅含於此後台人工手動產生的全退注單')")
      .table-resposive(v-if="refundSummary && refundSummary.length>0")
        table.table
          thead
            tr
              th.hidden-sm-down {{ $t('平台商') }}
              th.hidden-sm-down {{ $t('幣別') }}
              th.hidden-sm-down.numberRight {{ $t('投注') }}
              th.hidden-sm-down.numberRight {{ $t('贏分') }}
              th.hidden-sm-down.numberRight {{ $t('輸贏') }}
              template(v-if="vendorCode === 'chess'")
                th.hidden-sm-down.numberRight {{ $t('服務費') }}
                th.hidden-sm-down.numberRight {{ $t('彩金') }}
              th.hidden-sm-down.numberRight(v-else-if="vendorCode === 'audere'") {{ $t('稅金') }}
              th.hidden-sm-down.numberRight {{ $t('RTP') }}
          tbody
            tr(v-for="(row, index) in refundSummary" :key="index")
              td {{ row.merchant_id }}
              td {{ row.currency }}
              td.numberRight {{ row.total_bet }}
              td.numberRight {{ row.total_win }}
              td.numberRight {{ row.win_lose }}
              template(v-if="vendorCode === 'chess'")
                td.numberRight {{ row.service_fee }}
                td.numberRight {{ row.jackpot }}
              td.numberRight(v-else-if="vendorCode === 'audere'") {{ row.tax_amount }}
              td.numberRight {{ row.rtp }}

      .mt-4.refundSummary(v-if="adjustSummary && adjustSummary.length>0")
        span.fw-semi-bold {{$t('派彩金額調整之差額統計')}}
        i.fa.fa-question-circle-o.refundSummaryIcon(aria-hidden="true" :title="$t('差額') + '=' + $t('調整前') + '-' + $t('調整後')")
      .table-resposive(v-if="adjustSummary && adjustSummary.length>0")
        table.table
          thead
            tr
              th.hidden-sm-down {{ $t('平台商') }}
              th.hidden-sm-down {{ $t('幣別') }}
              th.hidden-sm-down.numberRight {{ $t('投注') }}
              th.hidden-sm-down.numberRight {{ $t('贏分') }}
              th.hidden-sm-down.numberRight {{ $t('輸贏') }}
              template(v-if="vendorCode === 'chess'")
                th.hidden-sm-down.numberRight {{ $t('服務費') }}
                th.hidden-sm-down.numberRight {{ $t('彩金') }}
              th.hidden-sm-down.numberRight(v-else-if="vendorCode === 'audere'") {{ $t('稅金') }}
              th.hidden-sm-down.numberRight {{ $t('RTP') }}
          tbody
            tr(v-for="(row, index) in adjustSummary" :key="index")
              td {{ row.merchant_id }}
              td {{ row.currency }}
              td.numberRight {{ '0.00' }}
              td.numberRight {{ row.total_win }}
              td.numberRight {{ row.win_lose }}
              template(v-if="vendorCode === 'chess'")
                td.numberRight {{ '0.00' }}
                td.numberRight {{ '0.00' }}
              td.numberRight(v-else-if="vendorCode === 'audere'") {{ '0.00' }}
              td.numberRight {{ row.rtp }}

    .mask(v-if="loading")
      vue-circle-progress(ref="vueCircle")

    widget.mb-3(v-else)
      .mb-2(v-if="betRecord.length > 0")
        .float-left
          b-button(type="button" variant="outline-primary" @click="EXPORT_RECORD()" :disabled="excelLoading")
            span(v-if="!loading") {{ $t('匯出') }}
            span(v-else) 
              i.fa.fa-spinner.fa-spin.fa-fw
        .float-right
          label.float-left.pt-2.pr-3 {{ $t('資料筆數') }} : {{ countRecord_Format }}
          b-pagination.pagination(v-model="pageNo" :total-rows="countRecord" :per-page="pageSize" @input="CHANGE_PAGE_RECORD()")
      v-client-table(name="tbRecord" :columns="colRecord" :options="optRecord" :data="betRecord" ref="tbRecord")
        template(slot="BetNumber" slot-scope="props")
          template(v-if="vendorCode=='chess'")
            button.btn.btn-link.p-0.border-0.text-left(type="button" @click="getTransactionLog(props.row)") {{ props.row.BetNumber }}
          div(v-else) {{ props.row.BetNumber }}
        template(slot="TotalWin" slot-scope="props")
          span(v-if="props.row.BetStatus===5") {{ `${props.row.TotalWin}(${props.row.OldTotalWin})` }}
          span(v-else) {{props.row.TotalWin}}
        template(slot="WinLose" slot-scope="props")
          span(v-if="props.row.BetStatus===5") {{ `${props.row.WinLose}(${props.row.OldWinLose})` }}
          span(v-else) {{props.row.WinLose}}
        template(slot="BetStatus" slot-scope="props")
          template(v-if="props.row.BetStatus===1") {{ $t('結算成功') }}
          template(v-else-if="props.row.BetStatus===2") {{ $t('已退注') }}
          template(v-else-if="props.row.BetStatus===3") {{ $t('取消') }}
          template(v-else-if="props.row.BetStatus===4") {{ $t('人工退注') }}
          template(v-else-if="props.row.BetStatus===5") {{ $t('調整派彩金額') }}
        b-button.btn-sm(v-b-modal.modal-tall type="button" variant="outline-info" slot="detail" slot-scope="props" @click="detailData(props.row)") {{$t('檢視')}}
      div(v-if="betRecord.length > 0")
        .float-right.mt-2
          b-pagination.pagination(v-model="pageNo" :total-rows="countRecord" :per-page="pageSize" @input="CHANGE_PAGE_RECORD()")
    
    b-modal(v-model="showDetail" :title="$t('細節')" body-bg-variant="white" size="xl")
      widget.mb-0.p-0(:fetchingData="detailLoading")

        //- 影片
        bet-viedo(v-if="videoUrl" :gameType="req.data.vendor_code" :videoUrl="videoUrl")

        .videoUrlGroup 
          img.videoIcon(src="./image/linkIcon.svg")
          input.urlClass(type="text" v-model="videoUrl" disabled="disabled")
          button.btn.btn-link.border-0.py-0.px-2(type="button" @click="COPY_TEXT(videoUrl)")
            i.fa.fa-clone(aria-hidden="true")

        //- 開獎結果
        bet-detail-result(v-if="isObjEmpty(detail)" :detailData="detail" :vendorCode="req.data.vendor_code" :detailGameId="detailGameId" :countDetail="countDetail_Format")

      template(v-slot:modal-footer)
        b-button.btn-sm(variant="outline-secondary" @click="showDetail=false") {{ $t('關閉') }}

    b-modal(v-model="showApiLog" :title="$t('Log')" body-bg-variant="white" size="xl")
      widget.mb-0.p-0(:fetchingData="transactionLogLoading")
        v-client-table(:columns="colApiLog" :options="optApiLog" :data="transactionLog")
      template(v-slot:modal-footer)
        b-button.btn-sm(variant="outline-secondary" @click="showApiLog=false") {{ $t('關閉') }}

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
import Widget from '@/components/Widget/Widget'
import DatePicker from 'vue2-datepicker'
import i18n from '@/locales'
import Message from '@/mixins/message'
import XLSX from 'xlsx'
import { videoPlayer } from 'vue-video-player'
import 'videojs-contrib-hls/dist/videojs-contrib-hls'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import { MAHJONG_LIST } from '@/configs/site.js'
import { betRecord, betDetail, transactionLog, getOperatorList, getGameList, addVendorLog } from '@/services/service'
import { numberFormat, objNumberFormat, getMenuId, getSubMenuId } from '@/helper'
import VueCircleProgress from "@/components/VueCircleProgress/VueCircleProgress"

export default {
    name: 'BetRecord',
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
            id: 'width-100', TotalBet: 'numberRight', TotalWin: 'numberRight',
            WinLose: 'numberRight', TaxAmount: 'numberRight', ServiceFee: 'numberRight', Jackpot: 'numberRight', 
            Bonus: 'numberRight' 
          },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
          },
          headings: {},
          cellClasses: {
            WinLose: [
              {
                  class: 'text-danger',
                  condition: row => parseFloat(row.WinLose) < 0
              },
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            BetNumber: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            RoundID: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            RoundString: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            BetTime: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            Username: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            MerchantId: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            GameID: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            Currency: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            TotalBet: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            TotalWin: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            TaxAmount: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            Jackpot: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            Bonus: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            BetStatus: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],
            ServiceFee: [
              {
                  class: 'refundText',
                  condition: row => row.BetStatus !== 1 && row.BetStatus !== 5
              },
            ],

          },
        },

        colApiLog: ['user_id', 'vendor_id', 'round_id', 'transaction_id', 'req_api', 'req_data', 'res_data'],
        optApiLog: {
          perPage: 50,
          perPageValues: [50],
          pagination: { show: false },
          texts: {
            filterPlaceholder: i18n.t('篩選'), 
            filter: '', 
            count: '', 
            limit: '', 
            page: ''
          },
          filterable: false,
          columnsClasses: { id: 'width-100' },
          skin: 'table table-striped table-hover',
          sortable: [],
          sortIcon: {
            base: 'fa text-muted', 
            up: 'fa-chevron-up', 
            down: 'fa-chevron-down', 
            is: 'fa-sort',
          },
          headings: {
            'user_id': () => i18n.t('使用者 ID'),
            'vendor_id': () => i18n.t('遊戲商編號'),
            'round_id': () => i18n.t('系統局號'),
            'transaction_id': () => i18n.t('交易序號'),
            'req_api': () => i18n.t('請求 API'),
            'req_data': () => i18n.t('請求內容'),
            'res_data': () => i18n.t('回應內容')
          }
        },
        optPlayer: {
          muted: true,
          language: 'en',
          hls: true,
          playbackRates: [0.7, 1.0, 1.5, 2.0],
          sources: [],
        },
        pageNo: 1,
        pageSize: 50,
        vendorCode: sessionStorage.getItem('vendor_code'),
        betNumber: '',
        roundId: '',
        roundString: '',
        userName: '',
        merchantId: '',
        gameId: '',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        datePeriod: ['', ''],
        dateBefore: '',
        dateAfter: new Date(),
        showDetail: false,
        showApiLog: false,
        timeExpire: null,
        timeSearch: null,
        detailGameId: '',
        invalid: {
          'timePeriod': false
        },
        hasVideo: {
          audere: false,
          chess: false,
        },
        overTime: false,
        modeMessage: '',
        message: '',
        showMessage: false,          
        logout: false,
        loading: false,
        mahJongList: MAHJONG_LIST,
        dataState: false,
        excelData: [],
        excelDataState: {
          oldTotalWin: false,
          oldWinLose: false,
        },
        gameList: [],
        operatorList: [],
        betRecordRes: [],
        betRecord: [],
        detail: [],
        detailLoading: false,
        detailRes: [],
        transactionLog: [],
        transactionLogRes: [],
        videoUrl: '',
        transactionLogLoading: false,
        summary: [],
        refundSummary: [],
        adjustSummary: [],
        countRecord: 0,
        countDetail: 0,
        req: [],
        excelLoading: false,
        resExport: [],
        progressValue: 0,
        progressTime: function() { return '' }
      }
    },

    computed: {
      countRecord_Format() {
        return numberFormat(this.countRecord, 0)
      },

      countDetail_Format() {
        return numberFormat(this.countDetail, 0)
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
      async search(isReload) {
        this.dataState = false
        this.init()

        for(let item in this.invalid) {
          if(this.invalid[item]) return;
        }

        if(!this.betNumber && !this.roundId && !this.roundString && !this.userName) {
          let _msg = i18n.t('注單編號') + i18n.t(' / ') +
                    i18n.t('系統局號') + i18n.t(' / ') +
                    i18n.t('遊戲局號') + i18n.t(' / ') +
                    i18n.t('使用者 ID') + i18n.t('。') +
                    i18n.t('條件必須擇一輸入 !');

          this.SHOW_MESSAGE(9999, _msg)
          this.loading = false
          return
        }

        let _diffTime = new Date(this.datePeriod[1]) - new Date(this.datePeriod[0])
        
        if(_diffTime > 3600 * 1000 * 24 * 92) {
          this.overTime = true
          this.loading = false
          return
        }

        this.loading = true
        this.progressTime = window.setInterval(() => {
          this.progressValue = this.progressValue + 1.5
          this.$refs.vueCircle?.$children[0].updateProgress(this.progressValue)
        }, 1000)

        this.overTime = false

        if(isReload) this.pageNo = 1

        await this.getBetRecord(isReload)

        for(let item of this.betRecord) {
          if(item?.BetStatus === 5) {
            this.dataState = true
            break
          }
        }

        this.CHANGE_COLUMN_RECORD()
        this.dataformat()
        this.detailInit()

        window.clearInterval(this.progressTime)
        this.$refs.vueCircle?.$children[0].updateProgress(100)
        window.setTimeout(() => {
          this.loading = false
        }, 1250)
      },

      async detailData(data) {
        this.detailLoading = true
        this.showDetail = true
        this.detailGameId = data.gameId

        await this.getBetDetail(data)

        this.CHANGE_COLUMN_DETAIL(data.GameID)

        switch(this.vendorCode) {
          case 'audere':
            this.hasVideo.audere = this.videoUrl ? true : false      
            this.optPlayer.sources = {
              type: 'application/x-mpegURL',
              src: this.videoUrl
            }      
            break
          case 'chess':
            this.hasVideo.chess = this.videoUrl ? true : false
            break
        }
        this.detailDataFormat()
        this.detailLoading = false
      },

      async EXPORT_RECORD() {
        this.excelLoading = true

        await this.getExcelData()
        this.excelData = this.resExport?.map(node => ({
          betNumber: node.BetNumber,
          roundId: node.RoundID,
          roundString: node.RoundString,
          betTime: node.BetTime,
          userName: node.Username,
          merchantId: node.MerchantId,
          vendor_code: sessionStorage.getItem('vendor_code'),
          gameId: node.GameID,
          currency: node.Currency,
          totalBet: numberFormat(node.TotalBet, 2),
          totalWin: numberFormat(node.TotalWin, 2),
          oldTotalWin: numberFormat(node?.OldTotalWin, 2),
          winLose: numberFormat(node.WinLose, 2),
          oldWinLose: numberFormat(node?.OldWinLose, 2),
          serviceFee: numberFormat(node.ServiceFee, 2),
          totalTax: numberFormat(node.TaxAmount, 2),
          jackpot: numberFormat(node.Jackpot, 2),
          bonus: numberFormat(node.Bonus, 2),
          BetStatus: this.changeExcelBetStatus(node.BetStatus),
        }))

        this.excelDataState = {
          oldTotalWin: false,
          oldWinLose: false,
        }

        // 判斷是否出現調整前的值 總贏分 總輸贏
        for(let item of this.excelData) {
          if(item?.['oldTotalWin']) this.excelDataState.oldTotalWin = true
          if(item?.['oldWinLose']) this.excelDataState.oldWinLose = true
        }

        let headSummary = this.setExcelSummaryData()
        let headRecord = this.setExcelListData()

        let summary = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(summary, [headSummary[0]])
        XLSX.utils.sheet_add_json(summary, this.summary, { header: headSummary[1], origin: 'A2', skipHeader: true })

        let record = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(record, [headRecord])
        XLSX.utils.sheet_add_json(record, this.excelData, { origin: 'A2', skipHeader: true }) 

        let workbook, fileName
      
        fileName = 'BetRecord_Data_'+ moment(new Date()).format('YYYYMMDD') +'.xlsx'
        workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, summary, 'Summary')
        XLSX.utils.book_append_sheet(workbook, record, 'list')        
        XLSX.writeFile(workbook, fileName)

        this.excelLoading = false
      },

      setExcelSummaryData() {
        let headSummary = [[],[]]

        // 一定會有的excel欄位
        let tempSummaryHeadList = [
          [
            i18n.t('平台商'), i18n.t('幣別'), i18n.t('投注'), i18n.t('贏分'), i18n.t('輸贏'), 
            i18n.t('RTP')
          ],
          [
            'merchant_id', 'currency', 'total_bet', 'total_win', 'win_lose', 
            'rtp'
          ]
        ]

        // 依照帳號 組成excel實際出現欄位
        for(let i=0; i<tempSummaryHeadList[0].length; i++) {
          headSummary[0].push(tempSummaryHeadList[0][i])
          headSummary[1].push(tempSummaryHeadList[1][i])
          if(i===4 && this.vendorCode === 'chess') {
            headSummary[0].push(i18n.t('服務費'))
            headSummary[0].push(i18n.t('彩金'))
            headSummary[1].push(i18n.t('service_fee'))
            headSummary[1].push(i18n.t('jackpot'))
          } else if(i===4 && this.vendorCode === 'audere') {
            headSummary[0].push(i18n.t('稅金'))
            headSummary[1].push(i18n.t('tax_amount'))
          }
        }

        // 刪掉不需要的excel資料
        this.summary.forEach(item => {
          if(this.vendorCode === 'audere') {
            delete item['service_fee']
            delete item['jackpot']
          } else if(this.vendorCode === 'chess') delete item['tax_amount']
          return item
        })  

        return headSummary
      },
      setExcelListData() {
        let headRecord = []

        // 一定會有的excel欄位
        let tempHeadList = [
          i18n.t('注單編號'), i18n.t('系統局號'), i18n.t('遊戲局號'), i18n.t('投注時間'), i18n.t('使用者名稱'), 
          i18n.t('平台商'), i18n.t('遊戲商'), i18n.t('遊戲代碼'), i18n.t('幣別'), i18n.t('總投注'), 
          i18n.t('總贏分'), i18n.t('總輸贏'), i18n.t('額外獎金'), i18n.t('狀態')
        ]

        // 依照帳號 組成excel實際出現欄位
        for(let i=0; i<tempHeadList.length; i++) {
          headRecord.push(tempHeadList[i])
          if(i===10 && this.excelDataState?.oldTotalWin) headRecord.push(i18n.t('總贏分(調整前)'))
          if(i===11 && this.excelDataState?.oldWinLose) headRecord.push(i18n.t('總輸贏(調整前)'))
          if(i===11 && this.vendorCode === 'audere') headRecord.push(i18n.t('總稅金'))
          else if(i===11 && this.vendorCode === 'chess') {
            headRecord.push(i18n.t('服務費'))
            headRecord.push(i18n.t('彩金'))
          }
        }

        // 刪掉不需要的excel資料
        this.excelData.forEach(item => { 
          // 視訊不顯示 服務費 彩金
          if(this.vendorCode === 'audere') {
            delete item['serviceFee']
            delete item['jackpot']
          } else if(this.vendorCode === 'chess') delete item['totalTax']
          if(!this.excelDataState?.oldTotalWin) delete item['oldTotalWin']
          if(!this.excelDataState?.oldWinLose) delete item['oldWinLose']
        })   

        return headRecord
      },

      CHANGE_COLUMN_RECORD() {
        switch(this.vendorCode) {
          case 'audere':
            //Table Record
            this.colRecord = [
              'BetNumber', 'RoundID', 'RoundString', 'BetTime', 'Username', 
              'MerchantId', 'GameID', 'Currency', 'TotalBet', 'TotalWin', 
              'WinLose', 'TaxAmount', 'Bonus', 'BetStatus', 'detail'
            ]
            this.optRecord.headings = {
              BetNumber: () => i18n.t('注單編號'),
              RoundID: () => i18n.t('系統局號'),
              RoundString: () => i18n.t('遊戲局號'),
              BetTime: () => i18n.t('投注時間'),
              Username: () => i18n.t('使用者名稱'),
              MerchantId: () => i18n.t('平台商'),
              GameID: () => i18n.t('遊戲代碼'),
              Currency: () => i18n.t('幣別'),
              TotalBet: () => i18n.t('總投注'),
              TotalWin: () => this.dataState ? i18n.t('總贏分(調整前)') : i18n.t('總贏分'),
              WinLose: () => this.dataState ? i18n.t('總輸贏(調整前)') : i18n.t('總輸贏'),
              TaxAmount: () => i18n.t('總稅金'),
              Bonus: () => i18n.t('額外獎金'),
              BetStatus: () => i18n.t('狀態'),
              detail: () => i18n.t('細節'),
            }
            break
          case 'chess':
            this.colRecord = [
              'BetNumber', 'RoundID', 'RoundString', 'BetTime', 'Username', 
              'MerchantId', 'GameID', 'Currency', 'TotalBet', 'TotalWin', 
              'WinLose', 'ServiceFee', 'Jackpot', 'Bonus', 'BetStatus', 'detail'
            ]
            this.optRecord.headings = {
              BetNumber: () => i18n.t('注單編號'),
              RoundID: () => i18n.t('系統局號'),
              RoundString: () => i18n.t('遊戲局號'),
              BetTime: () => i18n.t('投注時間'),
              Username: () => i18n.t('使用者名稱'),
              MerchantId: () => i18n.t('平台商'),
              GameID: () => i18n.t('遊戲代碼'),
              Currency: () => i18n.t('幣別'),
              TotalBet: () => i18n.t('總投注'),
              TotalWin: () => this.dataState ? i18n.t('總贏分(調整前)') : i18n.t('總贏分'),
              WinLose: () => this.dataState ? i18n.t('總輸贏(調整前)') : i18n.t('總輸贏'),
              ServiceFee: () => i18n.t('服務費'),
              Jackpot: () => i18n.t('彩金'),
              Bonus: () => i18n.t('額外獎金'),
              BetStatus: () => i18n.t('狀態'),
              detail: () => i18n.t('細節'),
            }
            break      
        }
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
        this.pageSize = this.req.data?.page_size
        this.betNumber = this.req.data?.bet_number
        this.roundId = this.req.data?.round_id
        this.roundString = this.req.data?.round_string
        this.userName = this.req.data?.user_name
        this.merchantId = this.req.data?.merchant_id
        this.vendorCode = this.req.data?.vendor_code
        this.gameId = this.req.data?.game_id
        this.datePeriod[0] = this.req.start_time
        this.datePeriod[1] = this.req.end_time
        this.search(false)
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

      dataformat() {
        // 不做numberFormat的key 陣列
        let exception = { 
          BetNumber: -1, RoundID: -1, RoundString: -1, BetStatus: -1, Username: -1
        }

        objNumberFormat(this.summary)
        objNumberFormat(this.refundSummary)
        objNumberFormat(this.refundAdjustSummary)

        objNumberFormat(this.betRecord, exception)
      },

      detailDataFormat() {
        this.detail.bet_info.bet_list?.forEach(item => {
          item.bet_amount = numberFormat(item?.bet_amount, 2)
          item.win_amount = numberFormat(item?.win_amount, 2)
          item.tax_amount = numberFormat(item?.tax_amount, 2)
          item.pool_money = numberFormat(item?.pool_money, 2)
          item.treasure_money = numberFormat(item?.treasure_money, 2)
          item.win_lose = numberFormat(item?.win_lose, 2)
          item.service_fee = numberFormat(item?.service_fee, 2)
          item.win_point = numberFormat(item?.win_point, 2)
          item.total_win = numberFormat(item?.total_win, 2)
          item.platform_tax = numberFormat(item?.platform_tax, 2)
          item.total_win_amount = numberFormat(item?.total_win_amount, 2)

          if(item?.ante) item.ante.bet_amount = numberFormat(item?.ante?.bet_amount, 2)
          if(item?.ante) item.ante.win_amount = numberFormat(item?.ante?.win_amount, 2)
          if(item?.ante) item.ante.service_fee = numberFormat(item?.ante?.service_fee, 2)

          if(item?.play) item.play.bet_amount = numberFormat(item?.play?.bet_amount, 2)
          if(item?.play) item.play.win_amount = numberFormat(item?.play?.win_amount, 2)
          if(item?.play) item.play.service_fee = numberFormat(item?.play?.service_fee, 2)

          if(item?.pairPlus) item.pairPlus.bet_amount = numberFormat(item?.pairPlus?.bet_amount, 2)
          if(item?.pairPlus) item.pairPlus.win_amount = numberFormat(item?.pairPlus?.win_amount, 2)
          if(item?.pairPlus) item.pairPlus.service_fee = numberFormat(item?.pairPlus?.service_fee, 2)
        })
        
        this.detail.bet_info.lottery?.forEach(item => {
          if(item?.win_amount) item.win_amount = decimalNumber.format(item?.win_amount)
        })
      },

      async getExcelData() {
        const body = {
          data: {
            merchant_id: this.req?.merchant_id,
            vendor_code: this.req?.vendor_code,
            bet_number: this.req?.bet_number,
            round_id: this.req?.round_id,
            round_string: this.req?.round_string,
            user_name: this.req?.user_name,
            game_id: this.req?.game_id,
            start_time: this.req?.start_time,
            end_time: this.req?.end_time,
            page_no: this.req?.page_no,
            page_size: this.req?.page_size,
            is_reload: false,
            is_export: true,
          }
        }

        try {
          let temp = await betRecord(body)
          this.resExport = temp.result
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      changeExcelBetStatus(BetStatus) {
        if(BetStatus === 1) return i18n.t('結算成功')
        else if(BetStatus === 2) return i18n.t('已退注')
        else if(BetStatus === 3) return i18n.t('取消')
        else if(BetStatus === 4) return i18n.t('人工退注')
        else if(BetStatus === 5) return i18n.t('調整派彩金額')
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
            is_all: false,
            merchant_id: this.merchantId,
            game_type: parseInt(sessionStorage.getItem('vendor_id'))===5 ? 6 : undefined                       
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

      async getBetRecord(isReload, isExport = false) {
        this.req = {
          data: {
            merchant_id: this.merchantId,
            vendor_code: this.vendorCode,
            bet_number: this.betNumber,
            round_id: this.roundId,
            round_string: this.roundString,
            user_name: this.userName,
            game_id: this.gameId,
            start_time: this.datePeriod[0],
            end_time: this.datePeriod[1],
            page_no: this.pageNo,
            page_size: this.pageSize,
            is_reload: isReload,
            is_export: isExport,
          }
        }

        try {
          this.betRecordRes = await betRecord(this.req)
          this.betRecord = this.betRecordRes?.result
          this.summary = this.betRecordRes?.summary
          this.refundSummary = this.betRecordRes?.refund_summary
          this.adjustSummary = this.betRecordRes?.refund_adjust_summary
          this.countRecord = this.betRecordRes?.total_count

          if(this.adjustSummary?.length>0) {
            this.adjustSummary[0].total_win = numberFormat(parseInt(this.adjustSummary[0]?.old_total_win) - parseInt(this.adjustSummary[0]?.total_win), 2)
            this.adjustSummary[0].win_lose = numberFormat(parseInt(this.adjustSummary[0]?.old_win_lose) - parseInt(this.adjustSummary[0]?.win_lose), 2)
          }

        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }

        const body1 = {
          data: { 
            account_id: parseInt(sessionStorage.getItem('user_id')),
            menu_id: getMenuId(this.$route.path),
            subMenu_id: getSubMenuId(this.$route.path),
            action: 'select',
            route: '/api/betRecord',
            request: JSON.stringify(this.req),
            response: JSON.stringify(this.betRecordRes)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getBetDetail(data) {
        const body = {
          data: {
            bet_number: data.BetNumber,
            round_id: data.RoundID,
            round_string: data.RoundString,
            bet_time: data.BetTime,
            user_name: data.Username,
            merchant_id: data.MerchantId,
            vendor_code: this.vendorCode,
            game_id: data.GameID,
            game_info: data.GameInfo,
          }
        }

        try {
          this.detailRes = await betDetail(body)
          this.detail = this.detailRes?.result?.detail
          this.videoUrl = this.detailRes?.result?.round
          this.countDetail = this.detailRes?.result?.detail?.bet_info?.bet_list?.length
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
            'route': '/api/betDetail',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.detailRes)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }
      },

      async getTransactionLog(data) {
        this.transactionLogLoading = true
        this.showApiLog = true

        const body = {
          data: {
            bet_number: data.betNumber,
            merchant_id: data.merchantId,
          }
        }

        try {
          this.transactionLogRes = await transactionLog(body)
          this.transactionLog = this.transactionLogRes?.result
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
            'route': '/api/transactionLog',
            'request': JSON.stringify(body.data),
            'response': JSON.stringify(this.transactionLogRes)
          }
        }
        try {
          await addVendorLog(body1)
        } catch(e) {
          this.SHOW_MESSAGE(e, Message[e])
          console.error(e)
        }

        this.transactionLogLoading = false
      },

      detailInit() {
        this.hasVideo.audere = false          
        this.optPlayer.sources = []
        this.hasVideo.chess = false
        this.detailRes = []
        this.detail = []
        this.videoUrl = ''
        this.transactionLogRes = []
        this.transactionLog = []
      },

      init() {
        this.excelData = []
        this.summary = []
        this.adjustSummary = []
        this.refundSummary = []
        this.detailRes = []
        this.detail = []
        this.videoUrl = ''
        this.countDetail = 0
      },

      COPY_TEXT(text) {
        navigator.clipboard.writeText(text)
      },

      isObjEmpty(item) {
        return Object.keys(item).length !== 0
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
  .tableCard {
    display: flex;
    flex-direction: row;
  }

  .imgCard {
    max-width: 35px;
    width: 35px;
  }

  .superbullImgCard {
    max-width: 30px;
    width: 32px;
    margin-right: 2px;
  }

  .VuePagination {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 0;
    margin: 0;
  }

  .numberRight {
    text-align: end;
  }

  .betRecord .table th,
  .betRecord .table td {
    vertical-align: inherit;
  }

  .betRecord .refundText {
    color: darkgray;
  }

  button.disable {
    pointer-events: none;
    border: 1px solid darkgray;
    color: darkgray;
  }

  .refundSummary {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    span {
      font-size: 1.25rem;
    }
  }

  .refundSummaryIcon {
    margin-left: 4px;
    font-size: 20px;
    cursor: pointer;
  }

  .blackJackText {
    line-height: 48px;
    padding-bottom: 14px;
  }

  .videoUrlGroup {
    display: flex;
    justify-content: center;
    margin: 8px 0 40px 0;
  }

  .urlClass {
    margin: 0 8px;
    width: 100%;
    border: 0;
    outline: 0;
  }

  .videoIcon {
    width: 20px;
    height: 20px;
  }
</style>