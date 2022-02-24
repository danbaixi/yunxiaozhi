/**
 * 存放登录相关逻辑
 */

const R = require('../utils/request')

// 获取sessionKey，存储在服务器redis备用
function getOpenidFromCode(code){
  return R({
    url: 'wechat/getOpenidFromCode',
    data: {
      code:code
    },
    needLogin:false
  })
}

// 微信登录
function wechatLogin(code,res){
  return R({
    url: 'wechat/wechatLoginV2',
    data: {
      code: code,
      encryptedData:res.encryptedData,
      iv:res.iv,
    },
    needLogin:false
  })
}

// 绑定青果
function bindQingguoAccount(data){
  return R({
    url: 'login/bindQingGuoAccount',
    needLogin: false,
    data,
    method: 'POST'
  })
}

module.exports = {
  getOpenidFromCode,
  wechatLogin,
  bindQingguoAccount,
}