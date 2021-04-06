const { acceptTerms } = require('./utils/common')
const { exitSaveData } = require('./utils/util')
App({
  /** 小程序入口 */
  onLaunch: function () {
    //设置导航栏数据
    this.setNavgition()
    //更新配置
    this.updateConfigRequest()
    this.setFileUrl()
    //检查更新
    this.checkVersion()

  },

  /** 全局变量 */
  globalData:{
    isDebug:true,
    isTest:false,
    isLocal:false,
    themeColor: '#1380ff',
    xdebug:"?XDEBUG_SESSION_START=14473",
    domain:'https://www.yunxiaozhi.cn/v1/public/api/',
    key:'ihzoaixnuy4f8835032505e8a45ac102c52d58593e',
    markers_json: "markers.json",
    adTime: 24,//小时出现一次
  },
  updateConfigRequest:function(){
    let time = parseInt((new Date()).getTime() / 1000)
    this.promiseRequest({
      url: 'config/getMiniConfig',
      needLogin: false,
      data:{
        stu_id : wx.getStorageSync('user_id') || ''
      }
    }).then((data) => {
      if (data.status == 0) {
        wx.setStorageSync('config_update_time', time)
        wx.setStorageSync('configs', data.data)
        acceptTerms()
      } else {
        console.log('get config error')
      }
    }).catch((error) => {
      console.log(error.message)
    })
  },
  //设置存储文件地址
  setFileUrl:function(){
    let url = this.getConfig('fileUrl')
    if(url){
      this.globalData.fileDomain = url + '/mini/'
      this.globalData.fileUrl = url + '/mini/'
      this.globalData.headImgUrl = url + '/user_imgs/'
    }else{
      this.globalData.fileDomain = 'http://file.yunxiaozhi.cn/mini/'
      this.globalData.fileUrl = 'http://file.yunxiaozhi.cn/mini'
      this.globalData.headImgUrl = 'http://file.yunxiaozhi.cn/user_imgs/'
    }
  },
  //设置导航栏数据
  setNavgition:function(){
    wx.getSystemInfo({
      success: e => {
        this.globalData.statusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.custom = capsule;
          this.globalData.customBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.customBar = e.statusBarHeight + 50;
        }
      }
    })
  },
  //检查版本更新
  checkVersion:function(){
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {})
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，请重启应用',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },

  //获取请求domain
  getDomain:function(){
    if(this.globalData.isDebug){
      return this.globalData.isTest ? 'https://www.yunxiaozhi.cn/test/public/api/' : 'http://danbaixi.cn.utools.club/yxz_v1/public/index.php/api/'
    }
    return 'https://www.yunxiaozhi.cn/v1/public/api/'
  },

  //封装request 
  httpRequest: function (datas){
    datas.data = datas.data == undefined ? {} : datas.data
    datas.redirect = datas.redirect || ''
    if (datas.needLogin == undefined || datas.needLogin == true){
      let session = this.getLoginStatus()
      if(session == ""){
        this.msg('请先登录')
        return
      }
      datas.data.session = session
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
        switch(res.data.status){
          default:
            datas.success(res);break;
          case 4001:
            that.msg('请先登录');break;
          case 4002:
            that.msg('请先绑定账号'); break;
          case 4003:
            //登陆已过期
            that.msg(res.data.message)
            exitSaveData()
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/login/login?redirect=' + datas.redirect,
              })
            }, 1000)
            break;
          case 4004:
            that.msg('您已修改了教务系统密码，请重新绑定账号');
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/bind/bind?rebind=true',
              })
            }, 1000);
            break;
        }
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

  //toast
  msg:function(text,type){
    var type = typeof type === "undefined" ? '' : type
    var icon = 'none'
    if(type != ''){
      icon = type
    }
    wx.showToast({
      title: text,
      icon: icon,
      duration:2000
    })
  },

  //分享
  share: function (title, img, path){
    if(typeof title == "undefined"){
      return {
        title:"课表成绩考勤校历都在这里",
        imageUrl: this.globalData.fileDomain + 'share/v1/index.png',
        path: 'pages/index/index'
      }
    }
    return {
      title: title,
      path: typeof path === "undefined" ? 'pages/index/index' : path,
      imageUrl: this.globalData.fileDomain + 'share/v1/' + img,
    }
  },

  //强制需要登录
  isLogin:function(route){
    let _this = this
    var route = route || ''
    return new Promise((resolve) => {
      let session = wx.getStorageSync('login_session')
      if(session == ''){
        _this.msg('请先登录')
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login?redirect=' + route,
          })
        }, 1000);
        return resolve(false)
      }
      return resolve(true)
    })
    
  },

  //获取登录状态
  getLoginStatus:function(){
    let session = wx.getStorageSync('login_session')
    return session == '' ? false : session
  },

  //获取绑定状态
  getUserId:function(){
    let user_id = wx.getStorageSync('user_id')
    return user_id == '' ? false : user_id
  },

  //登录or绑定提示
  isBind:function(){
    let _this = this
    return new Promise((resolve) => {
      let session = wx.getStorageSync('login_session')
      if(session == ''){
        _this.msg('请先登录')
        return resolve(false)
      }
      let user_id = wx.getStorageSync('user_id')
      if(user_id == ''){
        _this.msg('请先绑定教务系统账号')
        return resolve(false)
      }
      return resolve(true)
    })
  },

  //promise封装请求
  promiseRequest: function (datas){
    datas.data = datas.data == undefined ? {} : datas.data
    datas.redirect = datas.redirect || ''
    if (datas.needLogin == undefined || datas.needLogin == true){
      let session = this.getLoginStatus()
      if(session == ""){
        this.msg('请先登录')
        return
      }
      datas.data.session = session
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
    let promise = new Promise((resolve,reject) => {
      wx.request({
        url: domain + datas.url + (isDebug?this.globalData.xdebug:""),
        data: typeof datas.data == undefined ? '': datas.data,
        method: datas.method,
        header: {
          'content-type': contentType
        },
        success:function(res){
          wx.hideLoading()
          if(res.data.status == 0){
            resolve(res.data)
          }else if(res.data.status == 4003){
            //登陆已过期
            that.msg(res.data.message)
            exitSaveData()
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/login/login?redirect=' + datas.redirect,
              })
            },1000)
          }else{
            reject(res.data.message || '服务器开小差了 ╯﹏╰')
          }
        },
        fail:function(res){
          wx.showToast({
            title: '请求超时，请重试',
            icon:'none',
            duration:2000
          })
        }
      })
    })
    
    return promise
  },

  //获取配置，支持使用“.”
  //key为空，返回全部
  getConfig:function(key){
    let configs = wx.getStorageSync('configs')
    if(key){
      let keyArr = key.split('.')
      let result = ""
      if(configs.hasOwnProperty(keyArr[0])){
        result = configs[keyArr[0]]
      }
      if(keyArr.length == 1){
        return result
      }
      for(let i=1;i<keyArr.length;i++){
        if(result.hasOwnProperty(keyArr[i])){
          result = result[keyArr[i]]
        }else{
          return false
        }
      }
      return result
    }
    return configs
  },
})