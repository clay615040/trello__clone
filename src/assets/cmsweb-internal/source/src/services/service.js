import xhr from './xhr'

// 取得基本資料
export const getVendorInfo = body => {
  return xhr({
    url: '/api/getVendorInfo',
    data: body.data,
  })
}

// 平台商
export const getOperatorList = body => {
  return xhr({
    url: '/api/operatorList',
    data: body.data,
  })
}

// 遊戲代碼
export const getGameList = body => {
  return xhr({
    url: '/api/getGameList',
    data: body.data,
  })
}

// 遊戲類型清單
export const getGameType = body => {
  return xhr({
    url: '/api/getGameType',
    data: body.data,
  })
}

// 遊戲開通綁定資料
export const getGameMappingData = body => {
  return xhr({
    url: '/api/getGameMapping',
    data: body.data,
  })
}

// 遊戲開通綁定 進入遊戲
export const testInGame = body => {
  return xhr({
    url: '/api/getGameUrl',
    data: body.data,
  })
}

// 遊戲開通綁定 匯入excel
export const importExcel = body => {
  return xhr({
    url: '/api/importGameMapping',
    data: body.data,
  })
}

// 查詢操作紀錄
export const getUsesApiLog = body => {
  return xhr({
    url: '/api/getUIUsesApiLog',
    data: body.data,
  })
}

// 押注記錄(注單)
export const betRecord = body => {
  return xhr({
    url: '/api/betRecord',
    data: body.data,
  })
}

// 押注記錄 細節
export const betDetail = body => {
  return xhr({
    url: '/api/betDetail',
    data: body.data,
  })
}

// 押注記錄(局)
export const roundRecord = body => {
  return xhr({
    url: '/api/roundRecord',
    data: body.data,
  })
}

// 交易紀錄
export const transactionLog = body => {
  return xhr({
    url: '/api/transactionLog',
    data: body.data,
  })
}

// 開桌遊戲紀錄
export const getPlayerRecord = body => {
  return xhr({
    url: '/api/getPlayerRecord',
    data: body.data,
  })
}

// 開桌遊戲紀錄 - 細節
export const getGameRecord = body => {
  return xhr({
    url: '/api/getGameRecord',
    data: body.data,
  })
}

// 沖銷紀錄
export const getRefund = body => {
  return xhr({
    url: '/api/getRefund',
    data: body.data,
  })
}

// 沖銷紀錄detail
export const getBetExcludeRefund = body => {
  return xhr({
    url: '/api/getBetExcludeRefund',
    data: body.data,
  })
}

// 沖銷紀錄 - 沖銷
export const refundApplication = body => {
  return xhr({
    url: '/api/refundApplication',
    data: body.data,
  })
}

// 對話紀錄
export const getChatLogs = body => {
  return xhr({
    url: '/api/getChatLogs',
    data: body.data,
  })
}

// 輸贏報表(月)
export const getMonthlyReport = body => {
  return xhr({
    url: '/api/monthlyReport',
    data: body.data,
  })
}

// 輸贏報表(日)
export const getDailyReport = body => {
  return xhr({
    url: '/api/dailyReport',
    data: body.data,
  })
}

// 開桌營收報表 (月) (日)
export const getBoardGameRevenue = body => {
  return xhr({
    url: '/api/getBoardGameRevenue',
    data: body.data,
  })
}

// 遊戲玩家庫存
export const getPlayerStock = body => {
  return xhr({
    url: '/api/playerStock',
    data: body.data,
  })
}

// 營收匯總(月)
export const getMonthlyRevenue = body => {
  return xhr({
    url: '/api/monthlyRevenue',
    data: body.data,
  })
}

// 營收匯總(日)
export const getDailyRevenue = body => {
  return xhr({
    url: '/api/dailyRevenue',
    data: body.data,
  })
}

// 超級號碼下注區
export const getSuperNumberBetList = body => {
  return xhr({
    url: '/api/getSuperNumberList',
    data: body.data,
  })
}

// 超級號碼資料 (月)
export const getMonthlySuperNumber = body => {
  return xhr({
    url: '/api/monthlySuperNumber',
    data: body.data,
  })
}

// 超級號碼資料 (日)
export const getDailySuperNumber = body => {
  return xhr({
    url: '/api/dailySuperNumber',
    data: body.data,
  })
}

// 月活躍用戶 (MAU)
export const getMonthlyActiveUser = body => {
  return xhr({
    url: '/api/getMonthlyActiveUser',
    data: body.data,
  })
}

// 日活躍用戶 (DAU)
export const getDailyActiveUser = body => {
  return xhr({
    url: '/api/getDailyActiveUser',
    data: body.data,
  }) 
}

// 新舊會員押注統計(月)
export const getMonthlyNAOBettingCount = body => {
  return xhr({
    url: '/api/getMonthlyNAOBettingCount',
    data: body.data,
  })
}

// 新舊會員押注統計(日)
export const getDailyNAOBettingCount = body => {
  return xhr({
    url: '/api/getDailyNAOBettingCount',
    data: body.data,
  })
}

// 操作紀錄
export const addVendorLog = body => {
  return xhr({
    url: '/api/addVendorLog',
    data: body.data,
  })
}