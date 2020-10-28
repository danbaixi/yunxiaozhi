const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    display:false,
    name:'',
    sfz:'',
    result:{}
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
    return {
      title: "白云专插本录取查询"
    }
  },
  nameInput:function(e){
    this.setData({
      name: e.detail.value
    })
  },
  sfzInput: function (e) {
    this.setData({
      sfz: e.detail.value
    })
  },
  query:function(){
    let _this = this
    if(_this.data.name == ''){
      app.msg("请输入姓名")
      return
    }
    if (_this.data.sfz == '') {
      app.msg("请输入身份证")
      return
    }
    wx.showLoading({
      title: '查询中...',
      mask: true
    })
    _this.setData({
      result: {}
    })
    app.httpRequest({
      url:'matriculate/zcb',
      needLogin: false,
      method: 'POST',
      data:{
        name:_this.data.name,
        sfz:_this.data.sfz,
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.status == -1){
          app.msg(res.data.message)
          return
        }
        _this.setData({
          display: true,
          result: res.data.data
        })
      }
    })
  }

})