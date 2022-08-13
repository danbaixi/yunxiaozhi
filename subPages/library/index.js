const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabCur: 'index'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onUnload() {
    wx.setStorageSync('lib_index_data', null)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('查书籍，还支持一键续借！')
  },
  navChange(e) {
    this.setData({
      tabCur: e.currentTarget.dataset.cur
    })
  }
})