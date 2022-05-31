import moment from 'moment'

/**
 * @param val 數值
 * @param decimal 到小數第幾位
 * @description 數字加上千分位
 */
export function numberFormat(val, decimal) {
  let regex = /^(-?\d+)(\.\d+)?$/
  if(!regex.test(val) || 
    typeof (parseFloat(removeComma(val))) !== 'number' || 
    isNaN(parseFloat(removeComma(val))) ||
    decimal < 0) return val

  let temp = new Intl.NumberFormat('en-us', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: 2
  })

  return temp.format(parseFloat(removeComma(val)))
}

/**
 * @param obj 傳入物件
 * @param exception 例外 obj ex: { round_id: -1, round_string: 0 } -1=不做format 0=不顯示小數
 * @description 將傳入obj所有的value做numberFormat
 */
export function objNumberFormat(obj, exception) {
  if(typeof obj !== 'object') return obj
  let temp = []
  for(let item of obj) {
    // j = obj幾個key
    for(let objKey of Object.keys(item)) {
      // 全部例外的key
      const exceptionKey = exception ? Object.keys(exception) : []
      // 判斷key是不是物件 是的話進遞迴
      if(typeof item[objKey] === 'object') objNumberFormat(item?.[objKey], exception)
      else if(exceptionKey?.length > 0 && exceptionKey.includes(objKey)) {
        let min = exception?.[objKey]
        item[objKey] = numberFormat(item?.[objKey], min)
      } else {
        item[objKey] = numberFormat(item?.[objKey], 2)
      }
    }
    temp = obj
  }
  return temp
}

/**
 * @param str 傳入字串
 * @description 字串去除逗號
 */
export function removeComma(str) {
  if(typeof str !== 'string') return str
  str = str.replace(/,/g, "")
  return str
}

/**
 * @param path 頁面path
 * @description 取得menu id
 */
export function getMenuId(path) {
  let temp = path.split('/')[1]
  let menuList = Object.values(JSON.parse(sessionStorage.getItem('permit'))) ?? []

  return menuList?.find(node => {
    return node.name === temp
  })?.id ?? ''
}

/**
 * @param path 頁面path
 * @description 取得取得subMenu id
 */
export function getSubMenuId(path) {
  let temp = path.split('/')[path.split('/').length - 1]
  let subMenuId = 0
  let menuList = Object.values(JSON.parse(sessionStorage.getItem('permit'))) ?? []

  menuList?.find(node => {
    return node?.child?.find(menu => {
      if(menu.name === temp) subMenuId = menu?.id
      menu?.child?.find(child => {
        if(child?.name === temp) subMenuId = child?.id
        return child.name === temp
      })
      return menu?.name === temp
    })
  })

  return subMenuId
}

/**
 * @param value YYYY-MM-DD string
 * @description 新舊會員押注統計 圖表 變更x軸 
 */
export function setXaxis(value) {
  if(value) {
    let temp = value.split('-')
    return temp.length>2 ? moment(value).format('DD.MMM') : moment(value).format('MMM')
  }
}

/**
 * @param val number
 * @description 10000 => 10K
 */
export function numberToSiNumber(val) {
  if(val === Number.MIN_VALUE) val = 0
  else if(val >= 10 ** 3 && val < 10 ** 6) {
    val = (val / 1000) + 'K'
  } else if (val >= 10 ** 6 && val < 10 ** 9) {
    val = (val / 1000000) + 'M'
  } else if (val >= 10 ** 9 && val < 10 ** 12) {
    val = (val / 1000000000) + 'G'
  } else if (val >= 10 ** 12 && val < 10 ** 15) {
    val = (val / 1000000000000) + 'T'
  } else if (val >= 10 ** 15) {
    val = (val / 1000000000000000) + 'P'
  }
  return val
}
