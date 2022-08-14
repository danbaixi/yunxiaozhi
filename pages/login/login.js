const app = getApp()
import {
  wechatLogin
} from '../api/login.js'
const {
  loginRedirect,
  updateAndGetCourseList
} = require('../../utils/common')
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
      winWidth: info.windowWidth,
      winHeight: info.windowHeight,
      redirect: redirect
    })
  },
  getCode: function () {
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

  //执行登录
  doWechatLogin: function () {
    let _this = this
    //通过微信接口获取用户基本&加密信息
    if (!wx.getUserProfile) {
      wx.showToast({
        title: '微信版本过低，请先升级微信版本',
        icon: 'none',
        duration: 4000
      })
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
        if (!wechatInfo.encryptedData || !wechatInfo.iv) {
          wx.showToast({
            title: '微信版本过低，请先升级微信版本',
            icon: 'none',
            duration: 4000
          })
          return
        }
        wechatLogin({
          code: _this.data.code,
          encryptedData: wechatInfo.encryptedData,
          iv: wechatInfo.iv
        }).then((resolve) => {
          if (resolve.status == 0) {
            app.msg("登录成功", "success")
            wx.setStorageSync('login_session', resolve.data.session)
            wx.setStorageSync('user_id', resolve.data.stu_id)
            wx.setStorageSync('user_info', resolve.data.info)
            if (!resolve.data.stu_id) {
              wx.redirectTo({
                url: '/pages/bind/bind?redirect=' + _this.data.redirect,
              })
              setTimeout(() => {
                app.msg('请绑定教务系统账号')
              }, 500);
              return
            }
            //更新获取课表 不更新课表
            // updateAndGetCourseList()
            setTimeout(() => {
              loginRedirect(_this.data.redirect)
            }, 1000)
          }
        }).catch((error) => {
          _this.getCode()
          app.msg(error.message)
        })
      },
      fail: (err) => {
        console.error(err)
        app.msg("您拒绝了授权，无法正常登录")
      }
    })
  }
})