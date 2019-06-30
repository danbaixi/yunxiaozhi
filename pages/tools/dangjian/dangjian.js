var app = new getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    info:"该功能正在测试中\n仅向大数据与计算机学院入党积极分子开放"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this;
    var user_id = wx.getStorageSync('user_id');
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: app.globalData.domain + '/wx/getDJdata.php',
      data:{
        user_id:user_id,
      },
      success:function(res){
        wx.hideLoading();
        if(res.data.code == 1001){
          var total = res.data.data.total;
          var jilu = res.data.data.jilu;
          that.setData({
            jilu:jilu,
            total:total,
            user_id:user_id,
            num: jilu.length,
          })
        }

      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //进入详情页
  item:function(res){
    var that = this;
    var index = res.currentTarget.dataset.index;
    var data = JSON.stringify(that.data.jilu[index]);
    wx.navigateTo({
      url: 'item/item?data='+data,
    })
  }
})