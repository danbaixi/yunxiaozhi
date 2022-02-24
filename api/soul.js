// 毒鸡汤

const R = require('../utils/request')

// 获取毒鸡汤列表
function getSoulList(){
  return R({
    url: 'soul/getList',
    needLogin: false
  })
}

// 点赞
function likeSoul(data){
  return R({
    url: 'soul/like',
    needLogin: false,
    data: data
  })
}

// 创建
function createSoul(data){
  return R({
    url:'soul/create',
    method:'POST',
    data
  })
}

module.exports = {
  getSoulList,
  likeSoul,
  createSoul
}