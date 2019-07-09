const md5 = require('/utils/md5.js');
App({
  onLoad: function () {
    //检查是否登录
    if (!wx.getStorageSync('user_id')) {
      wx.reLaunch({
        url: '../login/login',
      })
    }
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  /** 全局变量 */
  globalData:{
    isDebug:false,
    xdebug:"?XDEBUG_SESSION_START=10885",
    domain:'https://www.yunxiaozhi.cn/v1/public/api/',
    key:'ihzoaixnuy4f8835032505e8a45ac102c52d58593e',
    start_year: 2019,
    start_month: 2,
    start_day: 25,
  },

  /**
   * 获取请求domain
   */
  getDomain:function(){
    return this.globalData.isDebug ? 'https://danbaixi.utools.club/yxz_v1/public/api/' : 'https://www.yunxiaozhi.cn/v1/public/api/'
  },

  getSign:function(){
    var uid = wx.getStorageSync('user_id')
    var key = this.globalData.key
    var sign = md5.hexMD5(key + uid)
    return sign
  },

  /**
   *  封装request 
   */
  httpRequest:function(datas){
    if(datas.page != 'bind'){
      var uid = wx.getStorageSync('user_id')
      if(uid == ""){
        app.msg('请先登录')
        return
      }else{
        datas.data.stu_id = uid
      }
    }
    var that = this,
        isDebug = this.globalData.isDebug,
        domain = this.getDomain(),
        contentType = 'application/json'

    if (typeof datas.method == undefined){
      datas.method = "GET"
    }
    if(datas.method == "POST"){
      contentType = 'application/x-www-form-urlencoded'
    }
    wx.request({
      url: domain + datas.url + (isDebug?this.globalData.xdebug:""),
      data: typeof datas.data == undefined ? '': datas.data,
      method: datas.method,
      header: {
        'content-type': contentType
      },
      success:function(res){
        if(res.data.code == 1101){
          app.msg('请求失败')
        }
        datas.success(res)
      },
      fail:function(res){
        wx.showToast({
          title: '请求超时',
          icon:'none',
          duration:2000
        })
      }
    })
  },

  //自定义Toast
  showToast: function (text, o, count) {
    var _this = o;
    count = parseInt(count) ? parseInt(count) : 2000;
    _this.setData({
      toastText: text,
      isShowToast: true,
    });
    setTimeout(function () {
      _this.setData({
        isShowToast: false
      });
    }, count);
  },

  //toast
  msg:function(text){
    wx.showToast({
      title: text,
      icon:'none',
      duration:2000
    })
  }
})