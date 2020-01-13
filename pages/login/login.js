const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //微信登录
  wechatLogin:function(code){
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
    wx.getUserInfo({
      success: (userInfo) => {
        wx.login({
          success:function(res){
            if(res.code){
              _this.wechatLogin(res.code).then((resolve) => {
                if(resolve.status == 0){
                  return _this.getUserInfo(res.code,userInfo)
                }
                throw new Error(resolve.message)
              }).then((resolve) => {
                if(resolve.status == 0){
                  app.msg('登录成功','success')
                  wx.setStorageSync('login_session', resolve.data.session)
                  wx.setStorageSync('user_id', resolve.data.stu_id)
                  wx.setStorageSync('user_info', resolve.data.info)
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                }
                throw new Error(resolve.message)
              }).catch((error) => {
                app.msg(error.message)
              })
            }
          }
        })
      },
    })
  },

  //微信登录
  doWechatLogin1:function(){
    wx.getUserInfo({
      success: function(userInfo) {
        wx.login({
          success (res) {
            if (res.code) {
              app.httpRequest({
                url: 'user/wechatLogin',
                data: {
                  code:code
                },
                needLogin:false,
                success:function(res){
                  wx.hideLoading({
                    complete: (res) => {},
                  })
                  if(res.data.status == 0){
                    app.httpRequest({
                      url: 'user/getWechatUserInfo',
                      data: {
                        data:res
                      },
                      needLogin:false,
                      success:function(res){
                        wx.hideLoading({
                          complete: (res) => {},
                        })
                        if(res.data.status == 0){
                          app.msg('登录成功','success')
                          wx.setStorageSync('session', res.data.data.session)
                          wx.setStorageSync('stu_info', res.data.data.info)
                          wx.switchTab({
                            url: '/pages/index/index',
                          })
                        }
                      }
                    })
                    return
                  }
                  app.msg(res.data.message)
                }
              })
            } else {
              console.log('登录失败，请重试' + res.errMsg)
            }
          }
        })
      },
      fail:(res) => {
        app.msg("获取用户信息失败，请重试")
        return
      }
    })
  }
})