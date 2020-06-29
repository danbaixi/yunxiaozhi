const md5 = require('/utils/md5.js');
App({
  onLaunch: function () {
    let updateTime = 3 * 60 * 1000 // 3分钟更新一次config
    let time = (new Date()).getTime()
    let configUpdateTime = wx.getStorageSync('config_update_time')
    if (!configUpdateTime || time - configUpdateTime >= updateTime) {
      this.httpRequest({
        url: 'config/getMiniConfig',
        needLogin: false,
        success: function (res) {
          if (res.data.status == 0) {
            wx.setStorageSync('config_update_time', time)
            wx.setStorageSync('configs', res.data.data)
          } else {
            console.log('get config error')
          }
        }
      })
    }

    //导航栏位置
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
    
    //检查更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
    })
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
  /** 全局变量 */
  globalData:{
    isDebug:true,
    isTest:false,
    isLocal:false,
    themeColor: '#1380ff',
    xdebug:"?XDEBUG_SESSION_START=18446",
    domain:'https://www.yunxiaozhi.cn/v1/public/api/',
    key:'ihzoaixnuy4f8835032505e8a45ac102c52d58593e',
    amap_key: "67c20c2c7db08923379123500b656adf",
    markers_json: "https://www.yunxiaozhi.cn/v1/resource/markers.json",
    adTime: 24,//小时出现一次
    fileDomain:"http://file.yunxiaozhi.cn/mini/",
    fileUrl: "https://yunxiaozhi-1251388077.cos.ap-guangzhou.myqcloud.com/mini"
  },

  goLogin:function(url){
    wx.navigateTo({
      url: '/pages/bind/bind?url=/'+ url,
    })
  },

  /**
   * 获取请求domain
   */
  getDomain:function(){
    return this.globalData.isDebug ? (this.globalData.isTest ? 'https://www.yunxiaozhi.cn/test/public/api/' : 'http://localhost/yxz_v1/public/index.php/api/') : 'https://www.yunxiaozhi.cn/v1/public/api/'
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
            that.exitSaveData()
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
          if(res.data.status == 0){
            resolve(res.data)
          }else if(res.data.status == 4003){
            //登陆已过期
            that.msg(res.data.message)
            that.exitSaveData()
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

  //更新毒鸡汤
  requestSouls: function(){
    return this.promiseRequest({
      url: 'soul/getList',
      needLogin: false
    })
  }, 

  //点赞毒鸡汤
  likeSoul: function(id,stu_id){
    return this.promiseRequest({
      url: 'soul/like',
      needLogin: false,
      data: {
        id: id,
        stu_id: stu_id
      }
    })
  },

  //修改设置
  updateSetting:function(field,value){
    return this.promiseRequest({
      url: 'user/alterUserConfig',
      method: 'POST',
      data: {
        field: field,
        value: value
      }
    })
  },
  //退出保存的数据
  exitSaveData:function(){
    //保留配置信息
    let configs = wx.getStorageSync('configs')
    let bg_imgs = wx.getStorageSync('bg_imgs')
    let bg_img = wx.getStorageSync('bg_img')
    wx.clearStorageSync()
    wx.setStorageSync('configs', configs)
    wx.setStorageSync('bg_imgs', bg_imgs)
    wx.setStorageSync('bg_img', bg_img)
  },
  getTouchData: function(endX, endY, startX, startY) {
    let turn = "";
    let length = 50
    if (endX - startX > length && Math.abs(endY - startY) < length) {
      turn = "right";
    } else if (endX - startX < -length && Math.abs(endY - startY) < length) {
      turn = "left";
    }
    return turn;
  },
  //星期几转换
  num2Week:function(num){
    let weeks = ['日','一','二','三','四','五','六']
    return weeks[num]
  },
  //格式化课表地址
  formatAddress:function(address){
    address = address.replace('-', '_')//把-换成_
    var temp = address.split('_');
    if (temp.length > 1) {
      address = temp[0] + temp[1];
    } else {
      address = temp[0];
    }
    return address
  }
})