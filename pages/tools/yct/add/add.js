var app = getApp();
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  formSubmit: function (e) {
    var that = this;
    if(e.detail.value['number']==""){
      app.msg('卡号不能为空')
      return
    }
    wx.showLoading({
      title: '提交中...',
    })
    app.httpRequest({
      url: 'yct/addlist',
      data: {
        account: e.detail.value['number'],
        remark: null,
      },
      method:'POST',
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 0) {
          app.msg("添加成功", "success")
          setTimeout(function () {
            wx.hideToast();
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1];
            var prevPage = pages[pages.length - 2];
            wx.setStorageSync('ycts','')
            prevPage.setData({
              isFresh: true
            })
            wx.navigateBack({
            })
          }, 1000)
        } else {
          app.msg("添加失败，请重试")
        }
      }
    });
  }
})