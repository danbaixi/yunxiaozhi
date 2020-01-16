const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    settings:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserConfig()
  },

  onPullDownRefresh: function(){
    this.getUserConfig()
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
  },

  onShareAppMessage: function () {
    return app.share()
  },

  getUserConfig:function(){
    var that = this;
    wx.showLoading({
      title:"加载中"
    })
    app.promiseRequest({
      url: 'user/getUserConfig'
    }).then((data) => {
      wx.hideLoading()
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      that.setData({
        settings:data.data
      })
    })
  },

  //设置是否隐藏名字
  displayName: function (e) {
    let field = e.currentTarget.dataset.field
    let value = e.detail.value ? 1 : 0
    app.updateSetting(field,value).then((data) => {
      app.msg("设置成功","success")
    }).catch((message) => {
      app.msg(message)
    })
  },

  //隐藏毒鸡汤
  hideSoul:function(e){
    let field = e.currentTarget.dataset.field
    let value = e.detail.value ? 1 : 0
    app.updateSetting(field,value).then((data) => {
      app.msg("设置成功","success")
      wx.setStorageSync("hide_soul", value)
    }).catch((message) => {
      app.msg(message)
    })
  },

  //设置校区和上课时间
  setTime:function(){
    wx.navigateTo({
      url: '/pages/course/setTime/setTime',
    })
  }
})