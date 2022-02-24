// 用户相关请求
const R = require('../utils/request')

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

// 获取个人设置
function getUserConfig(){
  return R({
    url: 'user/getUserConfig'
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

// 修改昵称
function setNickname(data){
  return R({
    url: 'user/alternickname',
    method: 'POST',
    data
  })
}

// 修改头像
function setAvatar(data){
  return R({
    url:'user/alterUserImg',
    method: 'POST',
    data
  })
}

// 获取本年解绑微信的次数
function getUntieCount(){
  return R({
    url: 'user/getUntieLevel'
  })
}

// 解绑微信
function untieWechat(){
  return R({
    url: 'user/unTieWechat'
  })
}

// 同步学籍信息
function updateUserInfo(){
  return R({
    url: 'user/updateInfo'
  })
}

// 获取用户校区信息
function getAreaInfo(){
  return R({
    url: 'user/getareainfo'
  })
}

// 设置校区信息
function setAreaInfo(data){
  return R({
    url: 'user/setArea',
    method: 'POST',
    data
  })
}

// 设置是否显示上课时间
function setDisplayTime(data){
  return R({
    url: 'user/setCourseTimeStatus',
    method: 'POST',
    data
  })
}

// 获取用户宿舍信息
function getDormitory(){
  return R({
    url: 'dormitory/getDormitory'
  })
}

// 获取宿舍楼列表
function getRoomList(){
  return R({
    url:'dormitory/getRoom',
    needLogin: false
  })
}

// 获取楼层列表
function getLevelList(data){
  return R({
    url:'dormitory/getLevelsList',
    needLogin: false,
    data
  })
}

// 获取宿舍列表
function getDormitoryList(data){
  return R({
    url:'dormitory/getDormitoryList',
    needLogin: false,
    data
  })
}

// 设置宿舍信息
function setDormitory(data){
  return R({
    url:'dormitory/setRoom',
    method:'POST',
    data
  })
}

// 获取通讯录列表
function getFriendList(){
  return R({
    url: 'user/getClassStudent'
  })
}

module.exports = {
  getUserData,
  getCountDatas,
  getUserConfig,
  setUserConfig,
  setNickname,
  setAvatar,
  getUntieCount,
  untieWechat,
  updateUserInfo,
  getAreaInfo,
  setAreaInfo,
  setDisplayTime,
  getDormitory,
  getRoomList,
  getLevelList,
  getDormitoryList,
  setDormitory,
  getFriendList
}