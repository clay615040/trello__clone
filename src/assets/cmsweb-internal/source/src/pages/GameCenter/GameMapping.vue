<template>
  <div class="gameMapping">
    <widget v-if="!modeEditor" :title="`<h4><span class='fw-semi-bold'>${$t('遊戲開通綁定 - 列表')}</span></h4>`" :fetchingData="procSelect" customHeader>
      <div class="mt-4">
        <div class="float-left topGroup">
          <b-button type="button" variant="primary" @click="CREATE_DATA()">
            {{$t('新增')}}
          </b-button>
          <button class="excelInOutBtn" variant="primary" @click="execlInOutState()">
            {{ $t('匯入/匯出') }}
          </button>
          <button class="inGameBtn" variant="primary" @click="inGame()">
            {{ $t('進入遊戲') }}
          </button>
          <select class="form-control operatorSelect" v-model="searchOperator">
            <option v-for="(value, key) in operatorListAll" :key="key" :value="value.code">{{ value.name }}
            </option>
          </select>
          <div class="searchGroup">
            <img src="./image/icon-search.svg" class="searchIcon" alt="searchIcon">
            <input type="text" class="searchInput" v-model="searchText">
          </div>
        </div>
        <div class="float-right" v-if="searchTableData && !procSelect">
          <label class="pt-2">{{ $t('資料筆數') }} : {{ searchTableData.length }}</label>
        </div>
        
        <v-client-table ref="table" :columns="colMapping" :options="optMapping" :data="searchTableData">
          <template slot="route" slot-scope="props">
            <span>{{ $t(props.row.route == 1 ? '平台商傳入' : '遊戲商傳出') }}</span>
          </template>
          <template slot="active" slot-scope="props">
            <div v-if="props.row.active === 'disable'">
              <span class="table_disable">{{ $t(changeStateText(props.row.active)) }}</span>
            </div>
            <span v-else>{{ $t(changeStateText(props.row.active)) }}</span>
          </template>
          <template slot="action" slot-scope="props">
            <b-button type="button" variant="outline-info" class="btn-sm rounded-pill mr-2"
              @click="UPDATE_DATA(props.row)">{{ $t('編輯') }}
            </b-button>
          </template>
        </v-client-table>
      </div>
    </widget>

    <widget v-if="modeEditor" :title="titleModify" customHeader>
      <div class="mt-5">
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('呼叫來源')" label-for="selRoute">
          <b-form-select id="selRoute" v-model="route" :disabled="modeEditor=='update'">
            <option value="1">{{ $t('平台商傳入') }}</option>
            <option value="2">{{ $t('遊戲商傳出') }}</option>
          </b-form-select>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="selOperatorId">
          <div slot="label">{{ $t('平台商') }}<span class="warn-text">*</span></div>
          <b-form-select id="selOperatorId" v-model="merchantId" ref="merchantId" @change="getGameList(true, true, false)"
                          :class="{ 'is-invalid': invalid.merchantId }">
            <option v-for="(item, key) in operatorList" :key="key" :value="item.code" :selected="operatorId">
              {{ item.name }}
            </option>
          </b-form-select>         
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="selGameId">
          <div slot="label">{{ $t('遊戲名稱') }}<span class="warn-text">*</span></div>
          <b-form-select id="selGameId" v-model="gameId" ref="gameId"
                          :class="{ 'is-invalid': invalid.gameId }">
            <option v-for="(item, key) in gameIdList" :key="key" :value="item.game_id" :selected="gameId">
              {{ item.game_name_lang }} ({{item.game_code}})
            </option>
          </b-form-select>
        </b-form-group>

        <legend class="mt-5 mb-3">{{ $t('基本資訊') }}</legend>
        <!-- 平台商-遊戲代碼 -->
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtOperatorImplementId">
          <div slot="label">{{ $t('平台商-遊戲代碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtOperatorImplementId" v-model="operatorImplementId" ref="operatorImplementId"
                        :class="{ 'is-invalid': invalid.operatorImplementId }"></b-form-input>
        </b-form-group>
        <!-- 遊戲商-遊戲代碼 -->
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtImplementId">
          <div slot="label">{{ $t('遊戲商-遊戲代碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtImplementId" v-model="implementId" ref="implementId"
                        :class="{ 'is-invalid': invalid.implementId }"></b-form-input>
        </b-form-group>
        <!-- 合併帳務平台商商戶號 -->
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtImplementBillingCode">
          <div slot="label">{{ $t('合併帳務平台商商戶號') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtImplementBillingCode" v-model="implementBillingCode" ref="implementBillingCode"
                        :class="{ 'is-invalid': invalid.implementBillingCode }"></b-form-input>
        </b-form-group>
        <!-- 中間層環境辨識碼 -->
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtOperatorKey">
          <div slot="label">{{ $t('中間層環境辨識碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtOperatorKey" v-model="operatorKey" ref="operatorKey"
                        :class="{ 'is-invalid': invalid.operatorKey }"></b-form-input>
        </b-form-group>
        <!-- 遊戲伺服器 ID -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('遊戲伺服器 ID')" label-for="txtOperatorGameId">
          <b-form-input id="txtOperatorGameId" v-model="operatorGameId" ref="operatorGameId"
                        :class="{ 'is-invalid': invalid.operatorGameId }"></b-form-input>
        </b-form-group>

        <legend class="mt-5 mb-3">{{ $t('API 網址') }}</legend>
        <!-- 進入遊戲網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('進入遊戲網址')" label-for="txtUrlPlay">
          <div slot="label">{{ $t('進入遊戲網址') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtUrlPlay" v-model="urlPlay" ref="urlPlay"
                        :class="{ 'is-invalid': invalid.urlPlay }"></b-form-input>
        </b-form-group>
        <!-- 調閱室網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('調閱室網址')" label-for="txtUrlRound">
          <b-form-input id="txtUrlRound" v-model="urlRound" ref="urlRound"
                        :class="{ 'is-invalid': invalid.urlRound }"></b-form-input>
        </b-form-group>
        <!-- 玩家踢出網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('玩家踢出網址')" label-for="txtUrlKick">
          <b-form-input id="txtUrlKick" v-model="urlKick" ref="urlKick"
                        :class="{ 'is-invalid': invalid.urlKick }"></b-form-input>
        </b-form-group>
        <!-- 玩家是否在線網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('玩家是否在線網址')" label-for="txtUrlOnline">
          <b-form-input id="txtUrlOnline" v-model="urlOnline" ref="urlOnline"
                        :class="{ 'is-invalid': invalid.urlOnline }"></b-form-input>
        </b-form-group>
        <!-- 玩家強制登出網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('玩家強制登出網址')" label-for="txtUrlLogout">
          <b-form-input id="txtUrlLogout" v-model="urlLogout" ref="urlLogout"
                        :class="{ 'is-invalid': invalid.urlLogout }"></b-form-input>
        </b-form-group>
        <!-- 遊戲交易API調用紀錄網址 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('遊戲交易API調用紀錄網址')" label-for="txtUrlAPILog">
          <b-form-input id="txtUrlAPILog" v-model="urlAPILog" ref="urlAPILog"
                        :class="{ 'is-invalid': invalid.urlAPILog }"></b-form-input>
        </b-form-group>
        <!-- 遊戲交易API調用紀錄金鑰 -->
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('遊戲交易API調用紀錄金鑰')" label-for="txtKeyAPILog">
          <b-form-input id="txtKeyAPILog" v-model="keyAPILog" ref="keyAPILog"
                        :class="{ 'is-invalid': invalid.keyAPILog }"></b-form-input>
        </b-form-group>

        <legend class="mt-5 mb-3">{{ $t('其他') }}</legend>
        <b-form-group label-cols="4" label-cols-lg="2" :label="$t('啟用狀態')" label-for="selActive">
          <b-form-select id="selActive" v-model="active">
            <option value="enable">{{ $t('啟用') }}</option>
            <option value="disable">{{ $t('停用') }}</option>
          </b-form-select>
        </b-form-group>
        <div class="mt-5">
          <b-button type="button" variant="primary" class="mr-2" @click="confirmSave()">
            {{ $t('儲存') }}
          </b-button>
          <b-button type="button" variant="default" @click="CANCEL_MODIFY()">
            {{ $t('返回') }}
          </b-button>
        </div>
      </div>
    </widget>

    <b-modal v-model="showMessage" :title="$t(popupTitle)" @hide="CLOSE_MESSAGE()" body-bg-variant="white" size="xs" centered>
      <div v-if="modeMessage=='notice'" class="text-center">
        <label>{{ $t(message) }}</label>
      </div>
      <div v-if="confirmSaveActive" class="text-center">
        <label>{{ $t('遊戲相關資訊異動，將影響遊戲開通綁定及正式線上遊戲進行，請確認是否修改?') }}</label>
      </div>
      <div v-if="modeMessage=='confirm'" class="text-center">
        <label>{{ $t(message) }} [ {{ account }} ]</label>
      </div>
      <!-- excel匯入匯出 -->
      <div v-if="modeMessage === 'excelInOut'" class="execlGroup">
        <div class="execlExportGroup">
          <input type="radio" value="execlExport" name="inputOutState" v-model="inputOutState">
          <span>{{ $t('匯出') }}</span>
        </div>
        <div class="execlImportGroup">
          <input type="radio" value="execlImport" name="inputOutState" v-model="inputOutState"> 
          <span>{{ $t('匯入') }}</span>
          <input type="file" ref="file" @change="getFileData" class="execlImportClass" accept=".csv">
        </div>
        <div class="supData">{{ $t('檔案類型') }}: .csv</div>
        <div class="lastEditGroup" v-if="userLog && userLog.length>0">
          <span>{{ $t('上次修改時間') }}：{{ dateFormat(userLog[0].create_date) }}，{{ $t('修改者') }}：{{ userLog[0].username }}</span>
        </div>
        <span class="excelInOutPromptText">{{ $t('修改前，請務必先匯出最後一版，並以該版調整後，再行匯入！') }}</span>
      </div>
      <!-- 進入遊戲 -->
      <div v-if="modeMessage === 'inGame'" class="inGameClass">
        <div class="inGamePopupGroup">
          <label for="selOperator" class="popupInGameText">{{ $t('平台商') }}<span>*</span></label>
          <select id="selOperator" class="form-control"
                  v-model="popupOperator" @change="getGameList(true, false, true)"
                  :class="{ 'is-invalid': popupInvalid.popupOperator }">
            <option v-for="(value, key) in operatorList" :key="key" :value="value" :selected="merchantId">
                {{ value.name }}
            </option>
          </select>
        </div>
        <div class="inGamePopupGroup">
          <label for="selOperator" class="popupInGameText">{{ $t('遊戲名稱') }}<span>*</span></label>
          <select id="selOperator" class="form-control"
                  v-model="popupGameId" :class="{ 'is-invalid': popupInvalid.popupGameId }">
            <option v-for="(value, key) in gameIdList" :key="key" :value="value" :selected="gameId">
                {{ value.game_name_lang }} ({{value.game_realcode}})
            </option>
          </select>
        </div>
        <div class="inGamePopupGroup">
          <div class="popupInGameText">{{ $t('User Token') }}<span>*</span></div>
          <input type="text" class="popupInGameInput" :disabled="NODE_ENV === 'STAGE' || NODE_ENV === 'QC'" v-model="popupUserToken" :class="{inputError : popupInvalid.popupUserToken}">
          <b-button variant="outline-primary" :class="{ dtnHide: NODE_ENV !== 'STAGE' && NODE_ENV !== 'QC' }" class="btn-sm ml-2 getTokenBtn" @click="getUserToken()">{{ $t('取得Token') }}</b-button>
        </div>
        <div class="inGamePopupGroup">
          <div class="popupInGameText">{{ 'Session Token' }}</div>
          <input type="text" class="popupInGameInput" v-model="popupSessionToken">
        </div>
        <div class="inGamePopupGroup">
          <div class="popupInGameText">{{ 'games' }}</div>
          <input type="text" class="popupInGameInput" v-model="popupGame">
        </div>
        <div class="inGamePopupGroup">
          <div class="popupInGameText">{{ 'site' }}</div>
          <input type="text" class="popupInGameInput" v-model="popupSite">
        </div>
      </div>
      <!-- excel匯入缺必填 -->
      <div v-if="modeMessage === 'requiredError'" class="requiredErrorPopup">
        <div class="requiredErrorGroup">
          <div class="requiredErrorTitle">{{ $t('必填項目資料不完整') }} ！</div>
          <div v-for="(item, i) in excelRequiredList" :key="i" class="requiredErrorText">● {{ $t(item) }}</div>
        </div>
      </div>
      <!-- excel匯入 api回傳錯誤 -->
      <div v-if="modeMessage === 'excelImportError'">
        <div class="requiredErrorGroup" v-if="importErrorList.operator.length > 0 || importErrorList.game.length > 0">
          <div class="requiredErrorTitle">{{ $t('檔案匯入失敗！下列資料的 [平台商] / [遊戲名稱] 有誤或不完整') }}：</div>
          <div v-for="(item, i) in importErrorList.operator" :key="item + i" class="requiredErrorText">● {{ $t(item) }}</div>
          <div v-for="(item, i) in importErrorList.game" :key="i + item" class="requiredErrorText">● {{ $t(item) }}</div>
        </div>
        <div class="requiredErrorGroup" v-if="importErrorList.route.length > 0">
          <div class="requiredErrorTitle">{{ $t('檔案匯入失敗！下列資料未有相對應的 [平台商傳入] 或 [遊戲商傳出] 資料') }}：</div>
          <div v-for="(item, i) in importErrorList.route" :key="i" class="requiredErrorText">● {{ $t(item) }}</div>
        </div>
        <div class="requiredErrorGroup" v-if="importErrorList.exist.length > 0">
          <div class="requiredErrorTitle">{{ $t('檔案匯入失敗！系統已存在與下列資料相同的 [平台商] + [遊戲商名稱] 綁定資料') }}：</div>
          <div v-for="(item, i) in importErrorList.exist" :key="i" class="requiredErrorText">● {{ $t(item) }}</div>
        </div>
        <div class="requiredErrorGroup" v-if="importErrorList.duplicate.length > 0">
          <div class="requiredErrorTitle">{{ $t('檔案匯入失敗！下列資料有兩筆(含)以上相同的 [平台商傳入] 或 [遊戲商傳出] 資料') }}：</div>
          <div v-for="(item, i) in importErrorList.duplicate" :key="i" class="requiredErrorText">● {{ $t(item) }}</div>
        </div>
      </div>

      <template v-slot:modal-footer>
        <div v-if="modeMessage=='notice'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage=false">{{ $t('確認') }}</b-button>
        </div>
        <div v-if="confirmSaveActive">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="SUBMIT_MODIFY()">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="showMessage=false, confirmSaveActive = false">{{ $t('取消') }}</b-button>
        </div>
        <div v-if="modeMessage=='confirm'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="SUBMIT_DELETE()">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="showMessage=false">{{ $t('取消') }}</b-button>
        </div>
        <div v-if="modeMessage === 'excelInOut'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="importExport()">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="modeMessage='', showMessage=false">{{ $t('取消') }}</b-button>
        </div>
        <div v-if="modeMessage === 'inGame'">
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="confirmInGame()">{{ $t('進入遊戲') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="modeMessage = '', showMessage = false">{{ $t('取消') }}</b-button>
        </div>
        <div v-if="modeMessage === 'requiredError'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage = false">{{ $t('確認') }}</b-button>
        </div>
        <div v-if="modeMessage === 'excelImportError'">
          <b-button variant="outline-primary" class="btn-sm" @click="showMessage = false">{{ $t('確認') }}</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Widget from '@/components/Widget/Widget'
import i18n from '@/locales'
import Message from '@/mixins/message'
import { STATE_LIST } from '@/configs/site.js'
import XLSX from 'xlsx'
import moment from 'moment'
import md5 from 'js-md5'
import { getGameMappingData, testInGame, getUsesApiLog, importExcel, getOperatorList, getGameList, getVendorInfo, addVendorLog } from '@/services/service'
import axios from 'axios'

export default {
  name: 'GameMapping',
  
  components: { 
    'widget': Widget,
  },
  
  data() {
    return {
      colMapping: ['operator_name', 'game_name', 'game_code', 'rtp', 'route', 'active', 'action'],
      optMapping: {
        perPage: '10',
        perPageValues: ['10', '20', '50'],
        alwaysShowPerPageSelect: true,
        pagination: { show: true },
        texts: { filter: '', count: '', limit: '', page: '' },
        filterable: false,
        columnsClasses: { id: 'width-100' },
        skin: 'table table-striped table-hover',
        sortable: [],
        sortIcon: {
          base: 'fa text-muted', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort',
        },
        headings: {
          'operator_name': () => i18n.t('平台商'),
          'game_name': () => i18n.t('遊戲名稱'),
          'game_code': () => i18n.t('遊戲代碼'),
          'rtp': () => i18n.t('RTP (%)'),
          'route': () => i18n.t('呼叫來源'),
          'active': () => i18n.t('啟用狀態'),
          'action': () => i18n.t('操作'),
        },
      },
      mappingId: '',
      merchantId: '',
      operatorId: '',
      operatorKey: '',
      operatorGameId: '',
      operatorImplementId: '',
      implementId: '',
      implementVCode: '',
      implementBillingCode: '',
      implementBillingGameCode: '',
      urlPlay: '',
      urlRound: '',
      urlKick: '',
      urlBetLog: '',
      urlOnline: '',
      urlLogout: '',
      urlAPILog: '',
      keyAPILog: '',
      summaryCode: '',
      gameId: '',
      active: 'enable',
      route: 1,
      invalid: {
        'merchantId': false,
        'gameId': false,
        'operatorImplementId': false,
        'implementId': false,
        'implementBillingCode': false,
        'urlPlay': false,
        'operatorKey': false
      },
      modeEditor: '',
      modeMessage: '',
      showMessage: false,
      message: '',
      completed: false,
      logout: false,
      confirmSaveActive: false,
      searchText: '',
      tablePage: 1,
      popupTitle: '訊息',
      inputOutState: 'execlExport',
      gameMappingData: [],
      operatorList: [],
      gameIdList: [],
      popupInvalid: {
        'popupOperator': false,
        'popupGameId': false,
        'popupUserToken': false,
      },
      popupOperator: '',
      popupGameId: '',
      popupUserToken: '',
      popupSessionToken: '',
      popupGame: '',
      popupSite: '',
      importExcelData: [],
      excelRequiredList: [],
      mappingDataList: [],
      importErrorList: [],
      NODE_ENV: '',
      hashKey: '',
      userLog: [],
      tempPerPage: '10',
      searchOperator: '',
      operatorListAll: [],
    }
  },

  async mounted() {
    this.NODE_ENV = process?.env?.NODE_ENV
    await this.getOperatorList()
    await this.SELECT_MAPPING()

    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', this.goBack, false)
    }  
  },

  destroyed() {
    this.RESET_STATE()
  },
  
  computed: {
    ...mapState('gameMapping', {
      'procSelect': state => state.process.select,
      'procModify': state => state.process.modify,        
      'resDataInfo': state => state.response.info,
    }),

    titleModify() {
      return (this.modeEditor == 'create') ? `<h4><span class='fw-semi-bold'>${i18n.t('遊戲開通綁定 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('遊戲開通綁定 - 修改')}</span></h4>`
    },

    searchTableData() {
      let tempSearchText = this.searchText.toLowerCase()
      this.$nextTick(() => {
        this.$refs.table.setPage(1)
      })
      if(this.searchOperator !== '' || this.searchText !== '') {
        let temp = this.searchOperator !== '' ? this.resDataInfo.filter(node => 
          node.merchant_id === this.searchOperator) : this.resDataInfo
        return temp.filter(node => 
          node.operator_name?.toLowerCase().includes(tempSearchText) || 
          node.game_name?.toLowerCase().includes(tempSearchText) || 
          node.game_code?.toLowerCase().includes(tempSearchText) || 
          node.rtp?.toLowerCase().includes(tempSearchText) || 
          node.active?.toLowerCase().includes(tempSearchText)
        )
      }
      else return this.resDataInfo
    }
  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('gameMapping', {
      'REQUEST_SELECT': 'request_select', 
      'REQUEST_CREATE': 'request_create',
      'REQUEST_UPDATE': 'request_update',
      'RESET_STATE': 'reset_state',
    }),
    
    async SELECT_MAPPING() {
      let _err = await this.REQUEST_SELECT();

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err]);
      }
    },
    
    async CREATE_DATA() {
      history.pushState(null, null, document.URL)

      await this.getOperatorList(0)

      this.modeEditor = 'create'
      this.mappingId = ''
      this.merchantId = ''
      this.operatorId = ''
      this.operatorKey = ''
      this.operatorGameId = ''
      this.operatorImplementId = ''
      this.implementId = ''
      this.implementVCode = ''
      this.implementBillingCode = ''
      this.implementBillingGameCode = ''
      this.urlPlay = ''
      this.urlRound = ''
      this.urlKick = ''
      this.urlBetLog = ''
      this.urlOnline = ''
      this.urlLogout = ''
      this.urlAPILog = ''
      this.keyAPILog = ''
      this.summaryCode = ''
      this.gameId = ''
      this.active = 'enable'
      this.route = 1

      this.tablePage = this.$refs.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs.table?.$children?.[0]?.limit
    },

    async UPDATE_DATA(data) {
      history.pushState(null, null, document.URL)

      await this.getOperatorList(0)
      await this.getGameList(true, true, false)
      
      this.modeEditor = 'update';
      this.mappingId = data.mapping_id;
      this.merchantId = data.merchant_id;
      this.operatorId = data.operator_id;
      this.operatorKey = data.operator_key;
      this.operatorGameId = data.operator_game_id;
      this.operatorImplementId = data.operator_implement_id;
      this.implementId = data.implement_id;
      this.implementVCode = data.implement_vcode;
      this.implementBillingCode = data.implement_billing_code;
      this.implementBillingGameCode = data.implement_billing_game_code;
      this.urlPlay = data.url_play;
      this.urlRound = data.url_round;
      this.urlKick = data.url_kick;
      this.urlBetLog = data.url_betLog;
      this.urlOnline = data.url_online;
      this.urlLogout = data.url_logout;
      this.urlAPILog = data.url_apiLog;
      this.keyAPILog = data.key_apiLog;
      this.summaryCode = data.summary_code;
      this.gameId = data.game_id;
      this.active = data.active;
      this.route = data.route;

      this.tablePage = this.$refs.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs.table?.$children?.[0]?.limit
    },

    async SUBMIT_MODIFY() {
      this.confirmSaveActive = false
      
      for(let item in this.invalid) {
        this.invalid[item] = !this.$refs[item].value
      }
      
      for(let item in this.invalid) { 
        if(this.invalid[item]) {
          this.SHOW_MESSAGE(null, Message[2001])
          return
        }
      }

      let _para, _err;

      this.operatorId = this.operatorList?.find(item => {
        return item.code === this.merchantId
      })?.id

      switch(this.modeEditor) {
        case 'create':
          _para = {
            'merchantId': this.merchantId,
            'operatorId': this.operatorId,
            'operatorKey': this.operatorKey,
            'operatorGameId': this.operatorGameId,
            'operatorImplementId': this.operatorImplementId,
            'implementId': this.implementId,
            'implementVCode': this.merchantId,
            'implementBillingCode': this.implementBillingCode,
            'implementBillingGameCode': this.implementId,
            'urlPlay': this.urlPlay,
            'urlRound': this.urlRound,
            'urlKick': this.urlKick,
            'urlBetLog': this.urlBetLog,
            'urlOnline': this.urlOnline,
            'urlLogout': this.urlLogout,
            'urlAPILog': this.urlAPILog,
            'keyAPILog': this.keyAPILog,
            'summaryCode': this.summaryCode,
            'gameId': this.gameId,
            'active': this.active,
            'route': this.route
          }
          _err = await this.REQUEST_CREATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }
          
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break

        case 'update':
          _para = {
            'mappingId': this.mappingId,
            'merchantId': this.merchantId,
            'operatorId': this.operatorId,
            'operatorKey': this.operatorKey,
            'operatorGameId': this.operatorGameId,
            'operatorImplementId': this.operatorImplementId,
            'implementId': this.implementId,
            'implementVCode': this.merchantId,
            'implementBillingCode': this.implementBillingCode,
            'implementBillingGameCode': this.implementId,
            'urlPlay': this.urlPlay,
            'urlRound': this.urlRound,
            'urlKick': this.urlKick,
            'urlBetLog': this.urlBetLog,
            'urlOnline': this.urlOnline,
            'urlLogout': this.urlLogout,
            'urlAPILog': this.urlAPILog,
            'keyAPILog': this.keyAPILog,
            'summaryCode': this.summaryCode,
            'gameId': this.gameId,
            'active': this.active,
            'route': this.route
          }         
          _err = await this.REQUEST_UPDATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }
          
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break
      }
    },

    CANCEL_MODIFY() {
      history.back()
      this.modeEditor = ''

      if(this.$refs?.table) {
        this.$nextTick(() => {
          this.$refs.table.setLimit(this.tempPerPage)
          this.$refs.table.setPage(this.tablePage)
        })
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
      if(this.completed) {
        this.modeEditor = ''
        this.completed = false

        this.$nextTick(() => {
          this.$refs.table.setLimit(this.tempPerPage)
          this.$refs.table.setPage(this.tablePage)
        })
      }
      this.modeMessage = ''
      this.confirmSaveActive = false
      this.popupTitle = '訊息'
      this.popupOperator = ''
      this.popupGameId = ''
      this.popupUserToken = ''
      this.popupSessionToken = ''
      this.popupGame = ''
      this.popupSite = ''
      this.popupInvalid.popupOperator = false
      this.popupInvalid.popupGameId = false
      this.popupInvalid.popupUserToken = false

      if(this.logout) this.USER_LOGOUT()
    },

    confirmSave() {
      if(this.modeEditor !== 'create') {
        this.confirmSaveActive = true
        this.showMessage = true
        this.modeMessage = ''
      } else {
        this.SUBMIT_MODIFY()
      }
    },

    changeStateText(item) {
      return STATE_LIST.find(node => node.code === item)?.name ?? item
    },

    goBack(){
      this.modeEditor = ''

      this.$nextTick(() => {
        this.$refs.table.setLimit(this.tempPerPage)
        this.$refs.table.setPage(this.tablePage)
      })
    },

    async execlInOutState() {
      await this.getUsesApiLog()
      this.modeMessage = 'excelInOut'
      this.showMessage = true
      this.popupTitle = '匯入/匯出'
    },

    async inGame() {
      this.modeMessage = 'inGame'
      this.showMessage = true
      this.popupTitle = '進入遊戲'

      await this.getOperatorList()
    },

    async importExport() {
      if(this.inputOutState === 'execlImport') {
        console.log('匯入')

        this.verificationExcelRequired()

        if(this.excelRequiredList.length > 0) {
          this.modeMessage = 'requiredError'
          this.showMessage = true
          return
        }

        if(this.$refs?.file?.value) {
          this.mappingDataList.forEach(node => {
            node.mapping_id = node?.mapping_id?.toString()
            node.route = node?.route?.toString()
            node.operator_name = node?.operator_name?.toString()
            node.game_name = node?.game_name?.toString()
            node.operator_implement_id = node?.operator_implement_id?.toString()
            node.implement_id = node?.implement_id?.toString()
            node.implement_billing_code = node?.implement_billing_code?.toString()
            node.operator_key = node?.operator_key?.toString()
            node.operator_game_id = node?.operator_game_id?.toString()
            node.url_play = node?.url_play?.toString()
            node.url_round = node?.url_round?.toString()
            node.url_kick = node?.url_kick?.toString()
            node.url_online = node?.url_online?.toString()
            node.url_logout = node?.url_logout?.toString()
            node.url_apiLog = node?.url_apiLog?.toString()
            node.key_apiLog = node?.key_apiLog?.toString()
            node.active = node?.active?.toString() 
          })
          let tempRes = []
          const body = {
            data: {
              vendor_id: sessionStorage.getItem('vendor_id'),                                  
              mapping_data: this.mappingDataList,                              
            }
          }

          try {
            let temp = await importExcel(body)
            if (temp.code === 9999) {
              this.importErrorList = temp.error
              this.modeMessage = 'excelImportError'
              this.showMessage = true
              return
            } else if (temp.code !== 1000) {
              this.SHOW_MESSAGE(temp.code, Message[temp.code])
              return
            } else {
              tempRes = temp

              const body1 = {
                data: {                                 
                  account_id: parseInt(sessionStorage.getItem('user_id')),
                  menu_id: 0,
                  subMenu_id: 0,
                  action: 'update',
                  route: '/api/importGameMapping',
                  request: JSON.stringify(body.data),
                  response: JSON.stringify(tempRes)
                }
              }
              try {
                await addVendorLog(body1)
              } catch(e) {
                this.SHOW_MESSAGE(e, Message[e])
                console.error(e)
              }

              await this.SELECT_MAPPING()
            }
          } catch(e) {
            this.SHOW_MESSAGE(e, Message[e])
            console.error(e)
          }
        }

      } else if(this.inputOutState === 'execlExport') {
        console.log('匯出')
        await this.getGameMappingData()

        this.importExcelData = this.gameMappingData.map(node => ({
            mapping_id: node?.mapping_id, 
            route: node?.route,
            operator_name: node?.operator_name, 
            game_name: node?.game_name,
            operator_implement_id: node?.operator_implement_id, 
            implement_id: node?.implement_id, 
            implement_billing_code: node?.implement_billing_code, 
            operator_key: node?.operator_key, 
            operator_game_id: node?.operator_game_id,
            url_play: node?.url_play, 
            url_round: node?.url_round, 
            url_kick: node?.url_kick, 
            url_online: node?.url_online, 
            url_logout: node?.url_logout,
            url_apiLog: node?.url_apiLog, 
            key_apiLog: node?.key_apiLog, 
            active: node?.active
        }))

        let headRecord = [
          i18n.t('mapping_id'), i18n.t('呼叫來源'), i18n.t('平台商'), i18n.t('遊戲名稱'), 
          i18n.t('平台商-遊戲代碼'), i18n.t('遊戲商-遊戲代碼'), i18n.t('合併帳務平台商商戶號'), i18n.t('中間層環境辨識碼'), i18n.t('遊戲伺服器 ID'),
          i18n.t('進入遊戲網址'), i18n.t('調閱室網址'), i18n.t('玩家踢出網址'),
          i18n.t('玩家是否在線網址'), i18n.t('玩家強制登出網址'), i18n.t('遊戲交易API調用紀錄網址'),
          i18n.t('遊戲交易API調用紀錄金鑰'), i18n.t('啟用狀態')
        ]

        let record = XLSX.utils.book_new()
        XLSX.utils.sheet_add_aoa(record, [headRecord])
        XLSX.utils.sheet_add_json(record, this.importExcelData, { origin: 'A2', skipHeader: true }) 

        let fileName = i18n.t('遊戲開通綁定') + '_' + moment(new Date()).format('YYYYMMDD') + '_' + process.env.NODE_ENV +'.csv'

        let workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, record, 'Record')        
        XLSX.writeFile(workbook, fileName, { bookType: 'csv' })
      }

      this.modeMessage = ''
      this.showMessage = false
    },

    async getGameMappingData() {
      const body = {
        data: {
          vendor_id: parseInt(sessionStorage.getItem('vendor_id')),                                  
        }
      }

      try {
        let temp = await getGameMappingData(body)
        this.gameMappingData = temp.result
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async confirmInGame() {
      for(let item in this.popupInvalid) {
        if(this[item] === '') { this.popupInvalid[item] = true }
        else { this.popupInvalid[item] = false }
      } 
      if(this.popupInvalid.popupOperator || this.popupInvalid.popupGameId || this.popupInvalid.popupUserToken) return

      const body = {
        data: {
          operator_id: this.popupOperator?.id,
          vendor_code: sessionStorage.getItem('vendor_code'),  
          game_id: this.popupGameId.game_id,       
          user_token: this.popupUserToken,
          session_token: this.popupSessionToken,
          games: this.popupGame,
          site: this.popupSite,
          language: sessionStorage.getItem('language'),
        }
      }

      try {
        let temp = await testInGame(body)
        if(temp.code === 1000) window.open(temp.result.url)
        else this.SHOW_MESSAGE(temp.code, Message[temp.code])
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }

      this.showMessage = false
      this.modeMessage = ''
      this.confirmSaveActive = false
      this.popupTitle = '訊息'
      this.popupUserToken = ''
      this.popupSessionToken = ''
      this.popupGame = ''
      this.popupSite = ''
      this.popupInvalid.popupOperator = false
      this.popupInvalid.popupGameId = false
      this.popupInvalid.popupUserToken = false
    },

    async getOperatorList(vendorID) {
      const body = {
        data: {
          vendor_id: vendorID ?? parseInt(sessionStorage.getItem('vendor_id')),                                  
        }
      }

      try {
        let temp = await getOperatorList(body)
        this.operatorList = temp.result
        this.operatorListAll = JSON.parse(JSON.stringify(temp.result))
        this.operatorListAll.unshift({ code: '', id: '', name: 'All'})
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async getGameList(format, isAll, inGame) {
      let tempMerchantId = ''
      if(isAll) {
        tempMerchantId = undefined
      } else if(inGame) {
        tempMerchantId = this.popupOperator?.code
      } else {
        tempMerchantId = this.merchantId
      }

      const body = {
        data: {
          vendor_id: parseInt(sessionStorage.getItem('vendor_id')),                                  
          language: sessionStorage.getItem('language'),
          is_all: isAll,                               
          merchant_id: tempMerchantId,                                  
        }
      }

      try {
        let temp = await getGameList(body)
        this.gameIdList = temp?.result
        if(format) this.gameId = this.gameIdList?.[0]
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },
    
    getFileData() {
      let vm = this
      const inputFile = this.$refs.file.files[0]
      if (inputFile) {
        if (inputFile.name.indexOf(".csv") == -1) {
          console.log('檔案型別不正確！')
          vm.$refs.file.value = null
          return
        }
        const reader = new FileReader()
        reader.readAsBinaryString(inputFile)
        reader.onload = function(e) {
          var workbook = XLSX.read(e.target.result, { type: "binary" })
          for (let sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
              vm.mappingDataList = XLSX.utils.sheet_to_json(workbook.Sheets[sheet],
              { header: [ 'mapping_id', 'route', 'operator_name', 'game_name',
                          'operator_implement_id', 'implement_id', 'implement_billing_code', 'operator_key', 'operator_game_id',
                          'url_play', 'url_round', 'url_kick', 'url_online', 'url_logout',
                          'url_apiLog', 'key_apiLog', 'active' ] })
              vm.mappingDataList.shift()
            }
          }
        }
      }
    },

    verificationExcelRequired() {
      let temp = ['route', 'operator_name', 'game_name', 'operator_implement_id', 'implement_id', 
                  'implement_billing_code', 'operator_key', 'url_play', 'active']

      let tempText = ['呼叫來源', '平台商', '遊戲名稱', '平台商-遊戲代碼', '遊戲商-遊戲代碼', 
                      '合併帳務平台商商戶號', '中間層環境辨識碼', '進入遊戲網址', '啟用狀態']
      let tempList = []
      this.mappingDataList.forEach(item => {
        for(let node of temp) {
          if(!Object.keys(item).includes(node)) tempList.push(tempText[temp.indexOf(node)])
        }
      })
      this.excelRequiredList = [...new Set(tempList)]
    },

    async getUserToken() {
      this.popupUserToken = ''
      if(!this.popupGameId?.game_name || !this.popupOperator?.code) return
      await this.getVendorInfo()
      let vendor = parseInt(sessionStorage.getItem('vendor'))

      let data = {
        "merchantid": vendor,
        "vcode": this.popupOperator?.code,
        "gameid": this.popupGameId?.game_realcode
      }

      let apiUrl = ''
      if(this.NODE_ENV === 'STAGE') apiUrl = 'https://dev-seamlessapi.aug888.com'
      else if(this.NODE_ENV === 'QC') apiUrl = 'https://qc-seamlessapi.aug888.com'
      
      let hash = md5(JSON.stringify(data) + this.hashKey)

      axios.post( apiUrl + '/api/external/CreateToken',{
        data
        ,hash: hash
      })
      .then((res) => {
        if(res?.data?.status === 'Success') this.popupUserToken = res?.data?.result?.token
      })
      .catch((err) => console.log(err))
    },

    async getVendorInfo() {
      const body = {
        data: {
          vendor_id: parseInt(sessionStorage.getItem('vendor_id')),
        }
      }

      try {
        let temp = await getVendorInfo(body)
        this.hashKey = temp.result[0]?.hash_key
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async getUsesApiLog() {
      const body = {
        data: {
          per: 1, 
          route: '/api/importGameMapping, /api/addGameMapping, /api/updateGameMapping',
          vendor_id: sessionStorage.getItem('vendor_id')                      
        }
      }

      try {
        let temp = await getUsesApiLog(body)
        this.userLog = temp?.result
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    dateFormat(data) {
      return moment(data).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  
  watch: {
    modeEditor: {
      handler: function() {
        for(let item in this.invalid) {
          this.invalid[item] = false
        }
      },
    },
    '$i18n.locale'() {
      this.getGameList(false, true, false)
    },
  },

  beforeRouteLeave(to, from, next) {
    window.removeEventListener('popstate', this.goBack, false)
    next()
  },
}
</script>

<style lang="scss">
  .table_disable{
    display: inline-block;
    color: #29323a;
    background-color: #d7dfe6;
    padding: 4px 12px;
    font-weight: 600;
    font-size: 14px;
    line-height: 19px;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .5rem;
  }

  .gameMapping .topGroup {
    display: flex;
    align-items: center;
  }

  .gameMapping .searchGroup {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 8px;
    padding: 0 6px;
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;
  }

  .searchIcon {
    font-size: 20px;
    margin-right: 6px;
  }

  .gameMapping .searchInput {
    height: 31.5px;
    border: 0;
    font-size: 14px;

    &:focus {
      border: 0;
      outline: none;
    }
  }

  .gameMapping .excelInOutBtn,
  .gameMapping .inGameBtn {
    margin-left: 8px;
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

  .execlGroup {
    display: flex;
    flex-direction: column;

    input {
      margin-right: 8px;
      cursor: pointer;
    }
  }

  .execlImportGroup,
  .execlExportGroup {
    display: flex;
    align-items: center;
    height: 40px;

    span {
      margin-right: 8px;
      font-weight: 400;
    }
  }

  .inGamePopupGroup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  .popupInGameText {
    max-width: 114px;
    min-width: 114px;
    margin-right: 6px;
    font-weight: 400;

    span {
      margin-left: 2px;
      color: red;
    }
  }

  .popupInGameInput {
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 1rem;
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #c1ccd3;
    border-radius: 0.5rem;

    &:focus-visible {
      outline: none;
      border-color: #4d90fe;
    }
  }

  .inputError {
    border-color: red;
  }

  b-button {
    font-size: 14px;
  }

  .execlImportClass {
    color: rgb(153, 150, 150);
  }

  .supData {
    margin-left: 20px;
    color: #999696;
  }

  .requiredErrorPopup {
    align-items: center;
  }

  .requiredErrorPopup,
  .requiredErrorGroup {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
  }

  .requiredErrorTitle {
    padding-bottom: 4px;
    font-weight: bold;
  }

  .requiredErrorText {
    padding: 2px 0;
  }

  .getTokenBtn {
    margin: 0;
    white-space: nowrap;
  }

  .dtnHide {
    display: none;
  }

  .excelInOutPromptText {
    margin-left: 20px;
    color: red;
  }

  .lastEditGroup {
    margin: 6px 0 19px 20px;
    padding: 1px;
    background-color: lightgoldenrodyellow;
    border-radius: 4px;
  }

  .operatorSelect {
    margin-left: 8px;
    width: 210px;
  }
</style>