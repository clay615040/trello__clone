const fs = require('fs')

// 回傳當前資料夾抓到的最後一個xlsx檔(最後日期)
module.exports = function xlsxFile () {
  const flies = fs.readdirSync(__dirname, 'utf-8')
    .filter(file => /\.xlsx/.test(file))
  if (flies.length) return flies[flies.length - 1]
  return ''
}
