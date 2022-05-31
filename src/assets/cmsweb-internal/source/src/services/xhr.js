import axios from 'axios'
import md5 from 'js-md5'

const xhr = ({ url, data }) => {
  data.time_zone = parseInt(sessionStorage.getItem('time_zone'))
  data.language = sessionStorage.getItem('language')

  let hash = md5(JSON.stringify(data) + '698856a')

  let options = {
    method: 'post',
    url: url,
    data: {data, hash},
  }

  return axios(options)
    .then((res) => {
      let errorCode = [1002, 1004, 1005, 1012]
      
      if(errorCode.includes(res.data.code)) sessionStorage.clear()
      return res.data
    })
    .catch((error) => {
      console.error(error)
      return error
    })
  }

export default xhr