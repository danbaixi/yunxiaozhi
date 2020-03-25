const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    name: '',
    did: '',
    area_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    this.getData()
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

  //获取宿舍信息和水电余额
  getData:function(){
    let _this = this
    app.httpRequest({
      url: 'dormitory/getQuantityDetail',
      success:function(res){
        _this.setData({
          loading: false
        })
        if(res.data.data != []){
          _this.setData(res.data.data)
        }
      }
    })
  },
  setDormitory:function(){
    wx.navigateTo({
      url: '/pages/my/dormitory/dormitory',
    })
  }
})