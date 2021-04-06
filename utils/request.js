/**
 * 封装wx.request
 */

const { isDebug, isTest, xdebugID } = require('./config')
const { checkNetWortStatus, exitSaveData } = require('./common') 

//请求路径
function getDomain(){
  if(isDebug){
    if(isTest){
      return 'https://www.yunxiaozhi.cn/test/public/api/'
    }
    return 'http://danbaixi.cn.utools.club/yxz_v1/public/index.php/api/'
  }
  return 'https://www.yunxiaozhi.cn/v1/public/api/'
}

//请求完整URL
function getUrl(path){
  const domain = getDomain()
  return `${domain}${path}${isDebug ? '?XDEBUG_SESSION_START=' + xdebugID : ''}`
}

//封装返回Promise对象的请求API
function R(datas){
  datas.data = datas.data == undefined ? {} : datas.data
  datas.redirect = datas.redirect || ''
  let session = ''
  if (datas.needLogin == undefined || datas.needLogin == true){
    session = wx.getStorageSync('login_session')
    if(session == ""){
      wx.showToast({
        icon: 'none',
        title: '请先登录'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login?redirect=' + datas.redirect,
        })
      },1000)
      return new Promise((resolve) => {
        return resolve('请先登录')
      })
    }
  }
  var url = getUrl(datas.url),
      data = typeof datas.data == undefined ? '': datas.data,
      contentType = 'application/json'

  if (typeof datas.method == undefined){
    datas.method = "GET"
  }
  if(datas.method == "POST"){
    contentType = 'application/x-www-form-urlencoded'
  }
  return new Promise((resolve,reject) => {
    wx.request({
      url: url,
      data: data,
      method: datas.method,
      header: {
        'content-type': contentType,
        'session-token': session
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.status == 0){
          return resolve(res.data)
        }
        if(res.data.status == 4003){
          //登陆已过期
          wx.showToast({
            icon: 'none',
            title: res.data.message,
          })
          //重新登录清除一些缓存
          exitSaveData()
          //待解决：重复重定向到登录页面的问题
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login?redirect=' + datas.redirect,
            })
          },1000)
        }else{
          const err = res.data.message || '服务器开小差了 ╯﹏╰'
          wx.showToast({
            title: err,
            icon: 'none'
          })
          return reject(err)
        }
      },
      fail:function(res){
        //检查是否是网络问题
        let message = '请求超时，请重试'
        checkNetWortStatus().then((result) => {
          if(result !== true){
            message = result
          }
          wx.showToast({
            title: message,
            icon:'none',
            duration:2000
          })
        })
      }
    })
  })
}

module.exports = R