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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'message/getlist',
      success:function(res){
        if(res.data.status == 1001){
          that.setData({
            messages:res.data.data,
          })
        }else{
          wx.showToast({
            title: '获取失败',
            icon: 'loading',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 2000)
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})