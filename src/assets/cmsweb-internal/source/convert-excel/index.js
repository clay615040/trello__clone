// depenicies
const excelToJson = require('convert-excel-to-json')
const fs = require('fs')
const path = require('path')

// auto get excel file name type:string
const XLSX_FILE_NAME = require('./auto-xlsx-name-helper')()
console.log('Convert file name:', XLSX_FILE_NAME)

// configs
const EXCEL_PATH = path.join(__dirname, XLSX_FILE_NAME) // excel檔位置
const EXCEL_SHEET = [] // 需要被轉換的表單 type: sring[]
const LANGUAGE_NEED_TO_CONVERT = [ 'zh-TW', 'en-US', 'ms-MY', 'vi-VN', 'th-TH', 'zh-CN'] // 需要的語言 type: sring[]
const EXPORT_PATH = 'src/locales' // 輸出資料夾 type: sring
const ASSIGN_OBJECTS = true
/**
 *  ASSIGN_OBJECTS type: boolean
  * 用來控制輸出的資料結構
  * Example:
  * ### When true, expect output:
  * {
  *   "SHEET_NAME1":{
  *     "DATA_KEY1":"DATA_VALUE1",
  *     ...
  *   },
  *   "SHEET_NAME2":{
  *     "DATA_KEY10":"DATA_VALUE10",
  *     ...
  *   },
  * }
  * ### When false:
  * {
  *   "DATA_KEY1":"DATA_VALUE1",
  *   ...
  *   "DATA_KEY999": "DATA_VALUE999"
  * }
  * */

// all support languages
const KEY_COLUMN = 'A'
const LANGUAGE_SETTINGS = {
  'zh-TW': [KEY_COLUMN],
  'en-US': ['B'],
  'ms-MY': ['C'],
  'vi-VN': ['D'],
  'th-TH': ['E'],
  'zh-CN': ['F'],
}

// functions
function convert () {
  const convertedResult = excelToJson({ sourceFile: EXCEL_PATH })

  let finalResult = []
  if (ASSIGN_OBJECTS) {
    let filterData = []
    // EXCEL_SHEET有資料則根據相對應的做篩選 若無則全部存入
    if (!EXCEL_SHEET.length) for (const key in convertedResult) filterData.push(...convertedResult[key])
    else for (const key of EXCEL_SHEET) if (convertedResult.hasOwnProperty(key)) filterData.push(...convertedResult[key])
    // 篩選語言
    for (const language of LANGUAGE_NEED_TO_CONVERT) finalResult.push(filterLanguage(filterData, language, ASSIGN_OBJECTS))
  } else {
    let filterData = {}
    // EXCEL_SHEET有資料則根據相對應的做篩選 若無則全部存入
    if (!EXCEL_SHEET.length) filterData = { ...convertedResult }
    else for (const key of EXCEL_SHEET) if (convertedResult.hasOwnProperty(key)) filterData[key] = convertedResult[key]
    // 篩選語言
    for (const language of LANGUAGE_NEED_TO_CONVERT) finalResult.push(filterLanguage(filterData, language))
  }
  return finalResult
}

function filterLanguage (data, language, assignObjects) {
  const valueColumn = LANGUAGE_SETTINGS[language][0]
  if (!valueColumn) return
  let result = {}
  if (assignObjects) {
    for (const child of data) if (child[valueColumn]) result[child[KEY_COLUMN]] = `${child[valueColumn]}`
  } else {
    for (const key in data) {
      result[key] = {}
      for (const child of data[key]) if (child[valueColumn]) result[key][child[KEY_COLUMN]] = `${child[valueColumn]}`
    }
  }
  return result
}

function exportJSON (data) {
  const targetPath = `${EXPORT_PATH}/package`
  fs.mkdirSync(targetPath, { recursive: true })
  for (let i = 0; i < LANGUAGE_NEED_TO_CONVERT.length; i++) {
    const lang = LANGUAGE_NEED_TO_CONVERT[i]
    try {
      fs.writeFileSync(`${targetPath}/${lang}.json`, JSON.stringify(data[i]))
      console.log(`${lang} 轉換成功`)
    } catch (err) {
      console.log('語系轉換錯誤')
    }
  }
}

function exportMessageJS () {
  let importString = ''
  let languageObjectString = ''
  for (let i = 0; i < LANGUAGE_NEED_TO_CONVERT.length; i++) {
    const camelCaseString = toCamelCase(LANGUAGE_NEED_TO_CONVERT[i])

    importString += `import ${camelCaseString} from './package/${LANGUAGE_NEED_TO_CONVERT[i]}.json'\n`
    languageObjectString += `'${LANGUAGE_NEED_TO_CONVERT[i]}': ${camelCaseString}${i === LANGUAGE_NEED_TO_CONVERT.length - 1 ? '' : ','} `
  }

  // 輸出message.js (vue-i18n引入用)
  fs.writeFileSync(`${EXPORT_PATH}/message.js`, `${importString}\n` + `export default {` + ` ${languageObjectString}` + `}\n`)
  console.log(`成功生成 message.js`)
}

// run
exportJSON(convert())
exportMessageJS()

// 將字串轉換成駝峰式
function toCamelCase (string) {
  return string.split('-').map(node => node[0].toUpperCase() + node.substring(1, node.length)).join('')
}
