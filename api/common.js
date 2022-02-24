// 公共请求

const R = require('../utils/request')

// 获取公告
function getNotice(data){
  return R({
    url: 'notice/getnotice',
    data
  })
}

// 获取上传文件的key
function getCosTempKey(){
  return R({
    url: 'cos/getTempKey'
  })
}

module.exports = {
  getNotice,
  getCosTempKey
}