const app = getApp()
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
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: app.globalData.themeColor,
    })
    let _this = this
    let info = wx.getSystemInfoSync()
    _this.setData({
      winWidth:info.windowWidth,
      winHeight:info.windowHeight
    })
    wx.login({
      success: (res) =>{
        _this.setData({
          code: res.code
        })
      },
      fail:() => {
        app.msg('初始化失败，请重试')
      }
    })
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
        wx.showLoading({
          title: '正在登录'
        })
        if(_this.data.code){
          _this.wechatLogin(_this.data.code).then((resolve) => {
            if(resolve.status == 0){
              return _this.getUserInfo(_this.data.code,userInfo)
            }
            throw new Error(resolve.message)
          }).then((resolve) => {
            if(resolve.status == 0){
              wx.setStorageSync('login_session', resolve.data.session)
              wx.setStorageSync('user_id', resolve.data.stu_id)
              wx.setStorageSync('user_info', resolve.data.info)
              if(!resolve.data.stu_id){
                wx.redirectTo({
                  url: '/pages/bind/bind',
                })
                setTimeout(() => {
                  app.msg('请绑定教务系统账号')
                }, 500);
                return
              }else{
                app.promiseRequest({
                  url: 'course/getList'
                }).then((result) => {
                  if (result.status == 0) {
                    app.msg("登录成功", "success")
                    wx.setStorageSync('course', result.data.course);
                    wx.setStorageSync('train', result.data.train_course);
                  } else {
                    app.msg("登录成功，获取课表失败，请手动更新课表")
                  }
                })
                setTimeout(()=> {
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                },1000)
              }
              return
            }
            throw new Error(resolve.message)
          }).catch((error) => {
            app.msg(error.message)
          })
        }
      },
    })
  }

})