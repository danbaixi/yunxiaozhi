var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yzmUrl: "",
    cookie: "",
    __VIEWSTATE: "",
    user_id: "",
    user_password: "",
    code: "",
    password_display: false,
    loading: false,
    systemType: 1, // 1为青果，2为强智
    needValidate: false,
    customBar:app.globalData.customBar
  },

  /**
   * 生命周期函数--监听页面 加载
   */
  onLoad: function(options) {

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: app.globalData.themeColor,
    })
    let that = this;
    app.isLogin().then((resolve) =>{
      if(!resolve){ 
        return
      }
    })
    let rebind = options.rebind || false
    this.setData({
      url: options.url ? options.url : '/pages/index/index',
      rebind: rebind
    })

    let configs = wx.getStorageSync('configs')
    if(this.data.systemType == 1 && configs.bindNeedValidate == 1){
      this.setData({
        needValidate:true
      })
      this.initQingGuo().then((resolve) => {
        that.setData({
          cookie: resolve.data.cookie,
          __VIEWSTATE: resolve.data.__VIEWSTATE,
        })
        that.freshYzm();
      }).catch((error) => {
        app.msg(error.message)
      })

    }else if(this.data.systemType == 2){
      that.setData({
        cookie: res.data.data.cookie,
      }).catch((error) => {
        app.msg(error.message)
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getCourseList:function(){
    return app.promiseRequest({
      url: 'course/getList'
    })
  },

  /**
   * 绑定教务系统
   */
  login: function(e) {
    var that = this;
    var user_id = that.data.user_id;
    var password = that.data.user_password;
    var code = that.data.code;
    if (user_id == "") {
      app.msg('请输入学号')
      return
    }
    if (password == "") {
      app.msg('请输入密码')
      return
    }
    if (that.data.systemType == 1 && that.data.needValidate && code == "") {
      app.msg('请输入验证码')
      return
    }
    wx.showLoading({
      title: '正在绑定...',
    })

    if(that.data.systemType == 1){
      that.bindQingGuo().then((resolve) => {
        wx.hideLoading()
        if (resolve.status == 0) {
          wx.setStorageSync('user_id', that.data.user_id)
          that.getCourseList().then((result)=>{
            if (result.status == 0){
              app.msg("绑定成功", "success")
              wx.setStorageSync('course', result.data.course);
              wx.setStorageSync('train', result.data.train_course);
            }else{
              app.msg("绑定成功，获取课表失败，请手动更新课表")
            }
          })
          setTimeout(()=>{
            wx.switchTab({
              url: '/pages/index/index',
            })
          },1000)
          return
        }
        that.freshYzm()
        app.msg(resolve.message)
      })
    }else if (that.data.systemType == 2) {
      var cookie = that.data.cookie;
      var encoded = util.encodeInp(user_id) + "%%%" + util.encodeInp(password);
      app.httpRequest({
        url: app.globalData.domain + 'login/Login',
        needLogin:false,
        data: {
          stu_id: user_id,
          password: password,
          cookie: cookie,
          encoded: encoded,
        },
        method: "POST",
        success: function (res) {
          wx.hideLoading()
          if (res.data.status == 1002) {
            var str = app.globalData.key + user_id;
            var sign = md5.hexMD5(str);
            wx.request({
              url: app.globalData.domain + 'course/getList',
              data: {
                stu_id: user_id,
                sign: sign,
              },
              success: function (res) {
                if (res.data.status == 1001) {
                  wx.setStorageSync('course', res.data.data.course);
                } else {
                  app.msg("获取课表失败")
                }
              },
            });
            wx.setStorageSync('user_id', user_id);
            wx.setStorageSync('user_password', password);
            wx.setStorageSync('user_old_password', res.data.data);
            wx.setStorageSync('user_new_password', password);
            wx.setStorageSync('system_type', that.data.systemType);
            setTimeout(function () {
              if(that.data.url !=''){
                wx.redirectTo({
                  url: that.data.url,
                })
                return
              }
              wx.switchTab({
                url: '/pages/index/index'
              })
            }, 1000);
            app.msg("登录成功","success")
          } else if (res.data.status == 1003) {
            app.msg("学号或密码有误")
          } else {
            app.msg("登录失败")
          }
        }
      })
      return
    }

  },

  /** 刷新验证码 */
  freshYzm: function() {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      loading: true,
      yzmUrl: app.getDomain() + 'login/getValidateImg?cookie=' + this.data.cookie + '&rand=' + num,
    })
  },

  /** 输入学号 */
  inputUserId: function(e) {
    var that = this;
    that.setData({
      user_id: e.detail.value.trim()
    })
  },

  /** 输入密码 */
  inputPwd: function(e) {
    var that = this;
    that.setData({
      user_password: e.detail.value
    })
  },

  /** 输入验证码 */
  inputCode: function(e) {
    var that = this;
    that.setData({
      code: e.detail.value
    })
  },

  /** 清空学号 */
  clearUserId: function() {
    this.setData({
      user_id: ''
    })
  },

  /** 展开密码 */
  displayPwd: function() {
    this.setData({
      display_password: this.data.display_password ? false : true
    })
  },

  /** 图片预加载 */
  imageLoad: function() {
    this.setData({
      loading: false
    })
  },

  //获取青果教务系统登录cookie
  initQingGuo: function() {
    return app.promiseRequest({
      url: 'login/getLoginInitData',
      needLogin: false
    })
  },

  //获取强智教务系统cookie
  initQiangZhi: function(){
    return app.promiseRequest({
      url: 'login/getLoginCookie',
      needLogin: false
    })
  },


  loginTips:function(){
    wx.navigateTo({
      url: '/pages/loginTips/loginTips',
    })
  },

  //青果教务系统登录
  bindQingGuo:function(){
    let _this = this
    let user_info = wx.getStorageSync('user_info')
    let nickname = user_info['nickName']
    let avatar = user_info['avatarUrl']
    return new Promise((resolve => {
      app.httpRequest({
        url: 'login/bindQingGuoAccount',
        needLogin: false,
        data: {
          stu_id: _this.data.user_id,
          password: _this.data.user_password,
          cookie: _this.data.cookie,
          __VIEWSTATE: _this.data.__VIEWSTATE,
          code: _this.data.code,
          session: app.getLoginStatus(),
          nickname: nickname,
          avatar: avatar,
          rebind:_this.data.rebind ? 1 : 0
        },
        method: "POST",
        success: function(res) {
          return resolve(res.data)
        }
      })
    }))
  }
})