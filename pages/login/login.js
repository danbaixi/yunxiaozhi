const app = getApp()
const loginApi = require('../api/login')
const { loginRedirect,updateAndGetCourseList } = require('../../utils/common')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    _this.getCode()
    var redirect = options.redirect || ''
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: app.globalData.themeColor,
    })
    let info = wx.getSystemInfoSync()
    _this.setData({
      winWidth:info.windowWidth,
      winHeight:info.windowHeight,
      redirect:redirect
    })
  },
  getCode:function(){
    const _this = this
    wx.login({
      success: (res) => {
        _this.setData({
          code: res.code
        })
      },
      fail: () => {
        reject('初始化失败，请重试')
      }
    })
  },
  //获取sessionKey，存储在redis
  getSessionKey:function(code){
    return new Promise((resolve) => {
      app.httpRequest({
        url: 'wechat/wechatLogin',
        data: {
          code:code
        },
        needLogin:false,
        success:function(res){
          resolve(res.data)
        }
      })
    })
  },
  //获取授权用户信息
  getUserInfo:function(code,res){
    return new Promise((resolve) => {
      app.httpRequest({
        url: 'wechat/getWechatUserInfo',
        data: {
          code: code,
          encryptedData:res.encryptedData,
          iv:res.iv,
        },
        needLogin:false,
        success:function(res){
          resolve(res.data)
        }
      })
    })
  },
  //执行登录
  doWechatLogin:function(){
    let _this = this
    //通过微信接口获取用户基本&加密信息
    if(!wx.getUserProfile){
      app.msg("微信版本过低，请先升级微信")
      return
    }
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '获取您的头像和昵称',
      success: (wechatInfo) => {
        wx.showLoading({
          title: '正在登录',
          mask: true
        })
        //获取SessionKey
        loginApi.getOpenidFromCode(_this.data.code).then((res) => {
          if(res.status == 0){
            return loginApi.wechatLogin(_this.data.code,wechatInfo)
          }
          //刷新code
          _this.getCode()
        }).then((resolve) => {
          if(resolve.status == 0){
            app.msg("登录成功","success")
            wx.setStorageSync('login_session', resolve.data.session)
            wx.setStorageSync('user_id', resolve.data.stu_id)
            wx.setStorageSync('user_info', resolve.data.info)
            if(!resolve.data.stu_id){
              wx.redirectTo({
                url: '/pages/bind/bind?redirect=' + _this.data.redirect,
              })
              setTimeout(() => {
                app.msg('请绑定教务系统账号')
              }, 500);
              return
            }
            //更新获取课表
            updateAndGetCourseList()
            setTimeout(() => {
              loginRedirect(_this.data.redirect)
            },1000)
          }
        }).catch((error) => {
          _this.getCode()
          app.msg(error.message)
        })
      },
      fail: () => {
        app.msg("您拒绝了授权，无法正常登录")
      }
    })
  }
})