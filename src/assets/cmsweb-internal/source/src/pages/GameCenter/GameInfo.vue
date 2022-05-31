<template>
  <div class="gameInfo">
    <widget v-if="!modeEditor" :title="`<h4><span class='fw-semi-bold'>${$t('遊戲資訊 - 列表')}</span></h4>`" customHeader :fetchingData="loading">
      <div class="mt-4">
        <div class="float-left topGroup">
          <b-button type="button" variant="primary" @click="CREATE_GAME()">
            {{$t('新增')}}
          </b-button>
          <div class="searchGroup">
            <img src="./image/icon-search.svg" class="searchIcon" alt="searchIcon">
            <input type="text" class="searchInput" v-model="searchText">
          </div>
        </div>
        <div class="float-right" v-if="searchTableData">
          <label class="pt-2">{{ $t('資料筆數') }} : {{ searchTableData.length }}</label>
        </div>
        <v-client-table ref="table" :columns="colGame" :options="optGame" :data="searchTableData">
          <template slot="active" slot-scope="props">
            <div v-if="props.row.active === 0">
              <span class="table_disable">{{ $t(changeStateText(props.row.active)) }}</span>
            </div>
            <span v-else>{{ $t(changeStateText(props.row.active)) }}</span>
          </template>
          <template slot="action" slot-scope="props">
            <b-button type="button" variant="outline-info" class="btn-sm rounded-pill mr-2"
              @click="UPDATE_GAME(props.row)">{{ $t('編輯') }}
            </b-button>
          </template>
          <template slot="rtp" slot-scope="props">
            <span>{{ props.row.rtp }}%</span>
          </template>
        </v-client-table>
      </div>
    </widget>

    <widget v-if="modeEditor" :title="titleModify" :fetchingData="procLocaleString" customHeader>
      <div class="mt-4">
        <div class="gameNameGroup mb-2">
          <div class="groupText col-4 col-lg-2">{{ $t('遊戲名稱') }}
            <span class="warn-text">*</span>
            <span class="help-block text-danger mt-n3" 
                  style="line-height:20px !important">{{ $t('各語系僅可設定一組相對應名稱') }}</span>
          </div>
          <div class="Group">
            <div class="languageGroup mb-2" v-for="(item, i) in gameName" :key="i">
              <select class="form-control languageList" v-model="item.language_id" ref="languageId"
                      :disabled="item.default" @change="CHANGE_LANGUAGE()"
                      :class="{ 'is-invalid': invalid.languageId[i] }">
                <option v-for="(lang, i) in listLanguage" :key="i" :value="lang.id" :disabled="lang.selected"> {{ $t(lang.name) }}
                </option>
              </select>
              <input type="text" class="form-control languageInput" v-model="item.value" ref="gameName"
                      :class="{ 'is-invalid': invalid.gameName[i] }">
              <i class="fa fa-trash-o" v-if="i !== 0" aria-hidden="true" @click="DELETE_GAMENAME(i)"></i>
              <i class="fa fa-plus-circle" v-if="i === gameName.length - 1 && i < listLanguage.length - 1" aria-hidden="true" @click="CREATE_GAMENAME(i)"></i>
            </div>
          </div>
        </div>        
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtGameCode">
          <div slot="label">{{ $t('遊戲代碼') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtGameCode" v-model="gameCode" ref="gameCode"
                        :class="{ 'is-invalid': invalid.gameCode }"></b-form-input>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="selGameType">
          <div slot="label">{{ $t('遊戲類型') }}<span class="warn-text">*</span></div>
          <b-form-select id="selGameType" v-model="gameType" ref="gameType"
                          :class="{ 'is-invalid': invalid.gameType }">
            <option v-for="(item, key) in gameTypeList" :key="key" :value="item.id" :selected="gameType">
              {{ item.name }}
            </option>
          </b-form-select>
        </b-form-group>
        <b-form-group label-cols="4" label-cols-lg="2" label-for="txtRtp">
          <div slot="label">{{ $t('RTP (%)') }}<span class="warn-text">*</span></div>
          <b-form-input id="txtRtp" type="number" v-model="rtp" ref="rtp"
                        :class="{ 'is-invalid': invalid.rtp }"></b-form-input>
        </b-form-group>
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

  <b-modal v-model="showMessage" :title="$t('訊息')" @hide="CLOSE_MESSAGE()" 
              body-bg-variant="white" size="xs" centered>
      <div v-if="modeMessage=='notice'" class="text-center">
        <label>{{ $t(message) }}</label>
      </div>
      <div v-if="confirmSaveActive" class="text-center">
        <label>{{ $t('遊戲相關資訊異動，將影響遊戲開通綁定及正式線上遊戲進行，請確認是否修改?') }}</label>
      </div>
      <div v-if="modeMessage=='confirm'" class="text-center">
        <label>{{ message }}</label>
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
          <b-button variant="outline-primary" class="btn-sm mr-2" @click="CONFIRM_ACTIVE(true)">{{ $t('確認') }}</b-button>
          <b-button variant="outline-secondary" class="btn-sm" @click="CONFIRM_ACTIVE(false)">{{ $t('取消') }}</b-button>
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
import { getGameType, getGameList } from '@/services/service'

export default {
  name: 'GameInfo',

  components: { 
    'widget': Widget,
  },
  
  data() {
    return {
      colGame: ['game_name', 'game_name_lang', 'game_code', 'rtp', 'active', 'action'],
      optGame: {
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
          'game_name': () => i18n.t('遊戲名稱 (預設)'),
          'game_name_lang': () => i18n.t('遊戲名稱 (繁中)'),
          'game_code': () => i18n.t('遊戲代碼'),
          'rtp': () => i18n.t('RTP (%)'),
          'active': () => i18n.t('啟用狀態'),
          'action': () => i18n.t('操作'),
        },
      },
      gameId: '',
      gameCode: '',
      gameName: [],
      gameType: 0,
      rtp: 0,
      isH5: 1,
      active: 'enable',
      active_confirm: false,
      confirmSaveActive: false,
      invalid: {
        'gameCode': false,
        'gameType': false,          
        'rtp': false,
        'gameName': [false],
        'languageId': [false],
      },
      modeEditor: '',
      modeMessage: '',
      message: '',
      showMessage: false,
      completed: false,
      logout: false,
      tablePage: 1,
      tempPerPage: '10',
      gameList: [],
      gameTypeList: [],
      loading: false,
      searchText: '',
    }
  },
  
  computed: {
    ...mapState('gameInfo', {
      'procModify': state => state.process.modify,
      'resGameId': state => state.response.gameId,
    }),

    ...mapState('localeString', {
      'listLanguage': state => state.response.lang,
      'listLocaleString': state => state.response.list,
      'procLocaleString': state => state.process.select,
    }),
    titleModify() {
      return (this.modeEditor == 'create') ? `<h4><span class='fw-semi-bold'>${i18n.t('遊戲資訊 - 新增')}</span></h4>` : `<h4><span class='fw-semi-bold'>${i18n.t('遊戲資訊 - 修改')}</span></h4>`
    },
    searchTableData() {
      let temp = this.searchText.toLowerCase()
      this.$nextTick(() => {
        this.$refs.table.setPage(1)
      })
      if(this.searchText !== '') {
        return this.gameList.filter(node => 
          node.game_name?.toLowerCase().includes(temp) || 
          node.game_name_lang?.toLowerCase().includes(temp) || 
          node.game_code?.toLowerCase().includes(temp) ||
          node.rtp?.toString()?.toLowerCase().includes(temp) || 
          node.active?.toString()?.toLowerCase().includes(temp)
        )
      }
      else return this.gameList
    }
  },

  methods: {
    ...mapActions('auth', {
      'USER_LOGOUT': 'logoutUser'
    }),
    ...mapActions('gameInfo', {
      'REQUEST_SELECT': 'request_select', 
      'REQUEST_CREATE': 'request_create',
      'REQUEST_UPDATE': 'request_update',
      'RESET_STATE': 'reset_state',
    }),

    ...mapActions('localeString', {
      'REQUEST_LANGUAGE': 'request_language',    
      'REQUEST_SELECT_LOCALE': 'request_select', 
      'REQUEST_CREATE_LOCALE': 'request_create',
      'REQUEST_UPDATE_LOCALE': 'request_update',
      'REQUEST_DELETE_LOCALE': 'request_delete',        
    }),
    
    async CREATE_GAME() {   
      this.gameCode = ''
      this.gameName = [{ entity_id: 0, language_id: 2, value: '', default: true }]
      this.gameType = 0
      this.rtp = ''
      this.active = 'enable'
      this.active_confirm = false

      history.pushState(null, null, document.URL)
      this.modeEditor = 'create'

      this.tablePage = this.$refs?.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs?.table?.$children?.[0]?.limit
    },

    async UPDATE_GAME(data) {
      this.gameId = data.game_id
      this.gameCode = data.game_code
      this.gameName = [
        { 
          entity_id: 0, 
          language_id: 2, 
          value: data.game_name, 
          default: true 
        }
      ]
      this.gameType = data.game_type_id
      this.rtp = data.rtp
      this.active = data.active === 1 ? 'enable' : 'disable'
      this.active_confirm = this.active == 'enable' ? false : true

      let _para = {
        'sourceDB': 'ManufacturerCMS',
        'sourceTable': 'Game',
        'entityId': this.gameId,
        'resourceName': 'GameName'
      }

      let _err = await this.REQUEST_SELECT_LOCALE(_para)
      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
        return
      }
      
      this.listLocaleString.forEach(_item => {
        if(_item.language_id !== 2) {
          this.gameName.push({
            entity_id: _item.entity_id, 
            language_id: _item.language_id,
            value: _item.resource_value
          })
        }
      }) 
      
      this.languageState()

      history.pushState(null, null, document.URL)
      this.modeEditor = 'update'
      
      this.tablePage = this.$refs.table?.$children?.[0]?.Page
      this.tempPerPage = this.$refs.table?.$children?.[0]?.limit
    },

    async SUBMIT_MODIFY() {
      this.confirmSaveActive = false

      for(let item in this.invalid) {
        if(item == 'gameName' || item == 'languageId') {
          this.invalid[item].forEach((_item, i) => {
            this.invalid[item][i] = !this.$refs[item][i].value
          })            
        }
        else this.invalid[item] = !this.$refs[item].value
      }        
      
      for(let item in this.invalid) {
        let _invalid = false

        if(item == 'gameName' || item == 'languageId') {
          this.invalid[item].forEach((_item, i) => {
            if(this.invalid[item][i]) _invalid= true
          })            
        }
        else {
          if(this.invalid[item]) _invalid = true
        }

        if(_invalid) {
          let _message = Message[2001]
          this.SHOW_MESSAGE(null, _message)
          return
        }
      }
    
      let _para, _err

      switch(this.modeEditor) {
        case 'create':
          _para = {
            'gameCode': this.gameCode,
            'gameName': this.gameName[0].value,
            'gameTypeId': this.gameType,
            'rtp': this.rtp,
            'isH5': this.isH5,
            'active': this.active
          }            
          _err = await this.REQUEST_CREATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }
          this.SET_GAME_NAME(this.resGameId)
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break
        case 'update':
          _para = {
            'gameId': this.gameId,
            'gameCode': this.gameCode,
            'gameName': this.gameName[0].value,
            'gameTypeId': this.gameType,
            'rtp': this.rtp,
            'isH5': this.isH5,
            'active': this.active             
          }            
          _err = await this.REQUEST_UPDATE(_para)

          if(_err) {
            this.SHOW_MESSAGE(_err, Message[_err])
            return
          }

          this.SET_GAME_NAME(this.gameId)
          this.SHOW_MESSAGE(null, Message[1000])
          this.completed = true
          break
      }
    },

    async SET_GAME_NAME(gameId) {
      let _para, _err
      _para = {
        'sourceDB': 'ManufacturerCMS',
        'sourceTable': 'Game',
        'entityId': gameId,
        'resourceName': 'GameName'
      }            
      _err = await this.REQUEST_DELETE_LOCALE(_para)

      if(_err) {
        this.SHOW_MESSAGE(_err, Message[_err])
      }

      this.gameName.forEach(async(_item) => {
        _para = {              
          'languageId': _item.language_id,
          'sourceDB': 'ManufacturerCMS',
          'sourceTable': 'Game',
          'entityId': gameId,
          'resourceName': 'GameName',
          'resourceValue': _item.value,
        }            
        _err = await this.REQUEST_CREATE_LOCALE(_para)

        if(_err) {
          this.SHOW_MESSAGE(_err, Message[_err])
        }
      })
    },

    CANCEL_MODIFY() {
      history.back()
      this.modeEditor = ''

      this.listLanguage.forEach(_item => {
        if(_item.id == 2) _item.selected = true
        else _item.selected = false
      })
    },

    CONFIRM_ACTIVE(confirm) {
      if(!confirm) {
        this.active = 'enable'
        this.modeMessage = ''
      }
      this.active_confirm = true
      this.showMessage = false
    },

    SHOW_MESSAGE(err, message) {
      this.message = message
      this.modeMessage = 'notice'
      this.showMessage = true

      if(err == 1002 || err == 1004 || err == 1005 || err == 1012) {
        this.logout = true
      }
    },

    async CLOSE_MESSAGE() {
      this.confirmSaveActive = false
      if(!this.active_confirm) this.active = 'enable'
      if(this.completed) {
        this.modeEditor = ''
        this.completed = false
        await this.getGameType()
        await this.getGameList()
        this.$nextTick(() => {
          this.$refs.table.setLimit(this.tempPerPage)
          this.$refs.table.setPage(this.tablePage)
        })
      }
      if(this.logout) this.USER_LOGOUT()
    },

    languageState() {
      this.gameName.forEach(_item => {
        let _selectedId = _item.language_id

        this.listLanguage.forEach(_lang => {
          if(_lang.id == _selectedId) _lang.selected = true
        })
      })
    },

    CHANGE_LANGUAGE() {
      this.listLanguage.forEach(_lang => {
        _lang.selected = false
      })

      this.languageState()
    },

    CREATE_GAMENAME(index) {
      this.invalid.languageId.push(false)
      this.invalid.gameName.push(false)

      this.gameName.push({entity_id: '', language_id: '', value: ''})
    },

    DELETE_GAMENAME(index) {
      this.invalid.languageId.splice(index, 1)
      this.invalid.gameName.splice(index, 1)
      
      let _selectedId = this.gameName[index].language_id
      this.gameName.splice(index, 1)
      
      this.listLanguage.forEach(_lang => {
        if(_lang.id == _selectedId) _lang.selected = false
      })
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
      return STATE_LIST.find(node => node.id === item)?.name ?? item
    },

    goBack(){
      this.modeEditor = ''

      this.$nextTick(() => {
        this.$refs.table.setLimit(this.tempPerPage)
        this.$refs.table.setPage(this.tablePage)
      })
    },

    async getGameList() {
      const body = {
        data: {
          vendor_id: parseInt(sessionStorage.getItem('vendor_id')),
          language: sessionStorage.getItem('language'),
          is_all: true,
        }
      }
      try {
        let temp = await getGameList(body)
        this.gameList = temp.result
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async getGameType() {
      const body = {
        data: {}
      }
      try {
        let temp = await getGameType(body)
        this.gameTypeList = temp.result
      } catch(e) {
        this.SHOW_MESSAGE(e, Message[e])
        console.error(e)
      }
    },

    async changeLocale() {
      this.loading = true
      await this.getGameType()
      await this.getGameList()
      this.loading = false
    }
  },
  
  watch: {
    modeEditor: {
      handler: function(newValue, oldValue) {
        if(!newValue) return

        for(let item in this.invalid) {
          if(item == 'gameName' || item == 'languageId') {
            this.invalid[item] = []
            
            this.gameName.forEach((i) => { 
              this.invalid[item].push(false)
            })
          }
          else this.invalid[item] = false            
        }
      },
    },  

    active: {
      handler: function(newValue, oldValue) {
        if(newValue == 'disable' && !this.active_confirm && this.modeEditor !== 'create') {
          this.message = i18n.t('遊戲開通綁定如有綁定此遊戲，則該開通綁定也將一併停用，且將影響正式線上遊戲進行，請確認是否繼續停用 ?')
          this.modeMessage = 'confirm'
          this.showMessage = true
        }
        if(this.active_confirm) this.active_confirm = false
      },
    },
    '$i18n.locale'() {
      this.changeLocale()
    },
  },

  async mounted() {
    let _err = await this.REQUEST_LANGUAGE()
    if(_err) {
      this.SHOW_MESSAGE(_err, Message[_err])
      return
    }

    await this.changeLocale()

    this.listLanguage.forEach(lang => {
      if(lang.code == 'en-US') lang.selected = true
      else lang.selected = false
    }) 

    if (window.history && window.history.pushState) {
      window.addEventListener('popstate', this.goBack, false)
    }    
  },

  beforeRouteLeave(to, from, next) {
    window.removeEventListener('popstate', this.goBack, false)
    next()
  }
}
</script>

<style lang="scss">
  .gameNameGroup,
  .languageGroup {
    display: flex;
  }

  .gameInfo .topGroup {
    display: flex;
    align-items: center;
  }

  .gameInfo .searchGroup {
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

  .gameInfo .searchInput {
    height: 31.5px;
    border: 0;
    font-size: 14px;

    &:focus {
      border: 0;
      outline: none;
    }
  }

  .Group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .languageGroup {
    margin-top: 8px;
  }

  .gameNameGroup .groupText{
    font-weight: normal;
    padding-left: 0;
    line-height: 49px;
  }
 
  .gameNameGroup .languageList {
    min-width: 200px;
    width: 200px;
  }
 
  .gameNameGroup .languageInput {
    margin-left: 8px;
    width: 100%;
  }
 
  .gameNameGroup .fa-trash-o::before,
  .gameNameGroup .fa-plus-circle::before {
    margin-left: 16px;
    font-size: 24px;
    line-height: 34px;
    cursor: pointer;
  }

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
</style>