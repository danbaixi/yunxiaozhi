const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    time: 2 //30秒阅读时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton()
    this.getUserTerms()
    this.getSetting()
    this.runTime()
  },
  onUnload: function(){
    if(this.data.is_accept == 0){
      app.msg("请先阅读并接受用户条款")
      wx.navigateTo({
        url: '/pages/terms/terms',
      })
      return
    }
  },
  //加载条款和个人设置
  getUserTerms:function(){
    let _this = this
    wx.showLoading({
      title: '正在加载',
    })
    app.httpRequest({
      url: 'data/getContent',
      needLogin: false,
      data:{
        key: 'user_terms'
      },
      success:function(res){
        wx.hideLoading({
          success: (res) => {},
        })
        if(res.data.status === 0){
          _this.setData(res.data.data)
          return
        }
        app.msg(res.data.message)
      }
    })
  },
  //获取状态
  getSetting(){
    let setting = app.getConfig('accept_terms') || 0
    this.setData({
      is_accept: setting
    })
  },
  runTime:function(){
    let is_accept = app.getConfig('accept_terms') || 0
    if(is_accept == 1){
      this.setData({
        time:0
      })
      return
    }
    let timeRun = setInterval(()=>{
      let time = this.data.time - 1
      this.setData({
        time: time
      })
      if(time == 0){
        clearInterval(timeRun)
      }
    },1000)
  },
  acceptTerms:function(){
    let _this = this
    app.httpRequest({
      url: 'user/acceptTerms',
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          _this.setData({
            is_accept: 1
          })
          let configs = wx.getStorageSync('configs')
          configs.accept_terms = 1
          wx.setStorageSync('configs', configs)
          setTimeout(()=>{
            wx.switchTab({
              url: '/pages/index/index',
            })
          },2000)
        }
      }
    })
  }
})