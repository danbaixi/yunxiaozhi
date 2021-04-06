// 公共请求

const R = require('../../utils/request')

// 获取公告
function getNotice(data){
  return R({
    url: 'notice/getnotice',
    data
  })
}

module.exports = {
  getNotice,
}