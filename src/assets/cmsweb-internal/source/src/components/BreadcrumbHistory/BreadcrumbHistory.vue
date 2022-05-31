<template>
  <div v-if="!excluded">
    <b-breadcrumb :items="tree"></b-breadcrumb>
  </div>
</template>
<script>

import i18n from '../../locales'

export default {
    name: 'BreadcrumbHistory',
    props: {
        exclude: {type: Array, default: () => []},
    },
    computed: {
        excluded() {
            return this.exclude.indexOf(this.$route.path.split('/').pop()) > -1;
        },
        routeToDisp() {
            return {
                '/dashboard/analytics': [i18n.t('圖表'), i18n.t('資料分析')],
                '/manufacturer/basicInfo': [i18n.t('營運管理'), i18n.t('基本資訊')],
                '/manufacturer/subAccount': [i18n.t('營運管理'), i18n.t('子帳號管理')],
                '/manufacturer/roleInfo': [i18n.t('營運管理'), i18n.t('角色管理')],
                '/gameCenter/gameInfo': [i18n.t('遊戲中心'), i18n.t('遊戲資訊')],
                '/gameCenter/gameMapping': [i18n.t('遊戲中心'), i18n.t('遊戲開通綁定')],
                '/gameCenter/notify/info': [i18n.t('遊戲中心'), i18n.t('通報管理'), i18n.t('通報綁定')],
                '/gameCenter/notify/group': [i18n.t('遊戲中心'), i18n.t('通報管理'), i18n.t('群組設定')],
                '/gameCenter/notify/rule': [i18n.t('遊戲中心'), i18n.t('通報管理'), i18n.t('規則設定')],
                '/gameCenter/whiteList': [i18n.t('遊戲中心'), i18n.t('API 白名單設定')],
                '/gameCenter/apiDocment': [i18n.t('遊戲中心'), i18n.t('API 串接文件')],
                '/history/betRecord': [i18n.t('紀錄查詢'), i18n.t('押注紀錄(注單)')],
                '/history/roundRecord': [i18n.t('紀錄查詢'), i18n.t('押注紀錄(局)')],
                '/history/apiRecord': [i18n.t('紀錄查詢'), i18n.t('API傳遞紀錄')],
                '/history/loginRecord': [i18n.t('紀錄查詢'), i18n.t('遊戲登錄紀錄')],
                '/history/executeRecord': [i18n.t('紀錄查詢'), i18n.t('管理操作紀錄')],
                '/history/boardGameRecord': [i18n.t('紀錄查詢'), i18n.t('開桌遊戲紀錄')],
                '/history/refund': [i18n.t('紀錄查詢'), i18n.t('沖銷紀錄')],
                '/history/chatLog': [i18n.t('紀錄查詢'), i18n.t('對話紀錄')],
                '/reportCenter/monthlyReport': [i18n.t('報表中心'), i18n.t('輸贏報表(月)')],
                '/reportCenter/dailyReport': [i18n.t('報表中心'), i18n.t('輸贏報表(日)')],
                '/reportCenter/monthlyBoardGameRevenue': [i18n.t('報表中心'), i18n.t('開桌營收報表 (月)')],
                '/reportCenter/dailyBoardGameRevenue': [i18n.t('報表中心'), i18n.t('開桌營收報表 (日)')],
                '/reportCenter/playerStock': [i18n.t('報表中心'), i18n.t('遊戲玩家庫存')],
                '/analysisCenter/revenueSummary/revenueSummaryMonthly': [i18n.t('數據分析中心'), i18n.t('營收彙總/預估'), i18n.t('營收彙總/預估 (月)')],
                '/analysisCenter/revenueSummary/revenueSummaryDaily': [i18n.t('數據分析中心'), i18n.t('營收彙總/預估'), i18n.t('營收彙總 (日)')],
                '/analysisCenter/gamePopularity/gamePopularityMonthly': [i18n.t('數據分析中心'), i18n.t('遊戲熱門度'), i18n.t('遊戲熱門度 (月)')],
                '/analysisCenter/gamePopularity/gamePopularityDaily': [i18n.t('數據分析中心'), i18n.t('遊戲熱門度'), i18n.t('遊戲熱門度 (日)')],
                '/analysisCenter/betAreaPopularity/betAreaPopularityMonthly': [i18n.t('數據分析中心'), i18n.t('遊戲下注區熱門度'), i18n.t('遊戲下注區熱門度 (月)')],
                '/analysisCenter/betAreaPopularity/betAreaPopularityDaily': [i18n.t('數據分析中心'), i18n.t('遊戲下注區熱門度'), i18n.t('遊戲下注區熱門度 (日)')],
                '/analysisCenter/bettingArea/superNumberMonthly': [i18n.t('數據分析中心'), i18n.t('遊戲超級號碼熱門區'), i18n.t('遊戲超級號碼熱門區 (月)')],
                '/analysisCenter/bettingArea/superNumberDaily': [i18n.t('數據分析中心'), i18n.t('遊戲超級號碼熱門區'), i18n.t('遊戲超級號碼熱門區 (日)')],
                '/analysisCenter/riskControl': [i18n.t('數據分析中心'), i18n.t('風險控管')],
                '/analysisCenter/activeUser/activeUserMonthly': [i18n.t('數據分析中心'), i18n.t('活躍用戶統計'), i18n.t('月活躍用戶 (MAU)')],
                '/analysisCenter/activeUser/activeUserDaily': [i18n.t('數據分析中心'), i18n.t('活躍用戶統計'), i18n.t('日活躍用戶 (DAU)')],
                '/analysisCenter/oANMembersBetCount/oANMembersBetCountMonthly': [i18n.t('數據分析中心'), i18n.t('新舊會員押注統計'), i18n.t('新舊會員押注統計 (月)')],
                '/analysisCenter/oANMembersBetCount/oANMembersBetCountDaily': [i18n.t('數據分析中心'), i18n.t('新舊會員押注統計'), i18n.t('新舊會員押注統計 (日)')],
            }
        },
        tree() {
            return [i18n.t('現在位置')].concat(this.routeToDisp[this.$route.path]);
        }
    }
}
</script>
