export const MENU_LIST = [
  { routerName: 'dashboard', name: '圖表' },
    { routerName: 'analytics', name: '資料分析' },

  { routerName: 'manufacturer', name: '營運管理' },
    { routerName: 'basicInfo', name: '基本資訊' },
    { routerName: 'subAccount', name: '子帳號管理' },
    { routerName: 'roleInfo', name: '角色管理' },

  { routerName: 'gameCenter', name: '遊戲中心' },
    { routerName: 'gameInfo', name: '遊戲資訊' },
    { routerName: 'gameMapping', name: '遊戲開通綁定' },
    { routerName: 'notify', name: '通報管理' },
      { routerName: 'notifyGroup', name: '群組設定' },
      { routerName: 'notifyRule', name: '規則設定' },
      { routerName: 'notifyInfo', name: '通報綁定' },
    { routerName: 'whiteList', name: 'API 白名單設定' },
    { routerName: 'apiDocment', name: 'API 串接文件' },

  { routerName: 'history', name: '紀錄查詢' },
    { routerName: 'betRecord', name: '押注紀錄 (注單)' },
    { routerName: 'roundRecord', name: '押注紀錄 (局)' },
    { routerName: 'apiRecord', name: 'API 傳遞紀錄' },
    { routerName: 'loginRecord', name: '遊戲登錄紀錄' },
    { routerName: 'executeRecord', name: '管理操作紀錄' },
    { routerName: 'boardGameRecord', name: '開桌遊戲紀錄' },
    { routerName: 'refund', name: '沖銷紀錄' },
    { routerName: 'chatLog', name: '對話紀錄' },

  { routerName: 'reportCenter', name: '報表中心' },
    { routerName: 'monthlyReport', name: '輸贏報表 (月)' },
    { routerName: 'dailyReport', name: '輸贏報表 (日)' },
    { routerName: 'monthlyBoardGameRevenue', name: '開桌營收報表 (月)' },
    { routerName: 'dailyBoardGameRevenue', name: '開桌營收報表 (日)' },
    { routerName: 'playerStock', name: '遊戲玩家庫存' },

  { routerName: 'analysisCenter', name: '數據分析中心' },
    { routerName: 'revenueSummary', name: '營收彙總/預估' },
      { routerName: 'revenueSummaryMonthly', name: '營收彙總/預估 (月)' },
      { routerName: 'revenueSummaryDaily', name: '營收彙總 (日)' },
    { routerName: 'gamePopularity', name: '遊戲熱門度' },
      { routerName: 'gamePopularityMonthly', name: '遊戲熱門度 (月)' },
      { routerName: 'gamePopularityDaily', name: '遊戲熱門度 (日)' },
    { routerName: 'betAreaPopularity', name: '遊戲下注區熱門度' },
      { routerName: 'betAreaPopularityMonthly', name: '遊戲下注區熱門度 (月)' },
      { routerName: 'betAreaPopularityDaily', name: '遊戲下注區熱門度 (日)' },
      { routerName: 'superNumberMonthly', name: '遊戲超級號碼熱門區 (月)' },
      { routerName: 'superNumberDaily', name: '遊戲超級號碼熱門區 (日)' },
    { routerName: 'evenBetting', name: '對押分析' },
      { routerName: 'evenBettingMonthly', name: '對押分析 (月)' },
      { routerName: 'evenBettingDaily', name: '對押分析 (日)' },
    { routerName: 'riskControl', name: '風險控管' },
    { routerName: 'activeUser', name: '活躍用戶統計' },
      { routerName: 'activeUserMonthly', name: '月活躍用戶 (MAU)' },
      { routerName: 'activeUserDaily', name: '日活躍用戶 (DAU)' },
    { routerName: 'oANMembersBetCount', name: '新舊會員押注統計' },
      { routerName: 'oANMembersBetCountMonthly', name: '新舊會員押注統計 (月)' },
      { routerName: 'oANMembersBetCountDaily', name: '新舊會員押注統計 (日)' },
]

export const STATE_LIST = [
  { id: 0, code: 'disable', name: '停用' },
  { id: 1, code: 'enable', name: '啟用' },
]

export const ACTION_LIST = [
  { code: 'edit', name: '編輯' },
  { code: 'select', name: '查詢' },
  { code: 'insert', name: '新增' },
  { code: 'update', name: '修改' },
  { code: 'delete', name: '删除' },
]

export const MAHJONG_LIST = {
  17: '33.png', 
  18: '34.png', 
  19: '35.png', 
  20: '36.png', 
  21: '37.png', 
  22: '38.png', 
  23: '39.png', 
  24: '40.png', 
  25: '41.png', 
  83: '83.png',
}