const app = getApp()
const { addYct } = require('../../../api/other')
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

  formSubmit: function (e) {
    if(e.detail.value['number']==""){
      app.msg('卡号不能为空')
      return
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    addYct({
      account: e.detail.value['number'],
      remark: null,
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 0) {
        app.msg("添加成功", "success")
        setTimeout(function () {
          var pages = getCurrentPages()
          var prevPage = pages[pages.length - 2]
          prevPage.setData({
            isFresh: true
          })
          wx.navigateBack()
        }, 1000)
      }
    })
  }
})