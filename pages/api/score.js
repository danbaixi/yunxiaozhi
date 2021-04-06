/**
 * 成绩相关请求
 */

const R = require('../../utils/request')

// 获取成绩列表
function getScoreList(redirect){
  return R({
    url: 'score/getscorelist',
    redirect
  })
}

// 更新成绩
function updateScore(data){
  return R({
    url: 'score/updateScoreV0',
    data
  })
}

module.exports = {
  getScoreList,
  updateScore
}
