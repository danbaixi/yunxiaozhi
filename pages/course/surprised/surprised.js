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
    var that = this;
    wx.request({
      url: app.globalData.domain + '/wx/surprised.php',
      success:function(res){
        that.setData({
          pic:res.data.data.pic,
          title:res.data.data.title,
          text:res.data.data.text,
          center:res.data.data.center,
        })
      }
    })
  },
  /**
   * 预览图片
   */
  preImg:function(e){
    
  }
})