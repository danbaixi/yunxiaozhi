// 用户相关请求
const R = require('../../utils/request')
// 获取用户信息
function getUserData(){
  return R({
    url: 'user/getInfo'
  })
}

// 获取用户零散数据
function getCountDatas(){
  return R({
    url:'user/getCountData'
  })
}

// 获取全局配置
function getGlobalConfig(data = {stu_id : ''}){
  return R({
    url: 'config/getMiniConfig',
    needLogin: false,
    data
  })
}

// 修改个人设置
function setUserConfig(data){
  if(wx.getStorageSync('user_id') == 'test'){
    return true
  }
  return R({
    url: 'user/alterUserConfig',
    method: 'POST',
    data
  })
}

module.exports = {
  getUserData,
  getCountDatas,
  getGlobalConfig,
  setUserConfig
}