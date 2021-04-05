/**
 * 成绩相关请求
 */

const R = require('../../utils/request')

//获取成绩列表
function getScoreList(redirect){
  return R({
    url: 'score/getscorelist',
    redirect
  })
}

module.exports = {
  getScoreList,
}
