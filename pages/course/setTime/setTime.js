const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areas:['西校区','北校区']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  getData:function(){
    var that = this
    app.promiseRequest({
      url:'user/getareainfo'
    }).then((data) => {
      that.setData({
        area:data.data.area,
        areas:data.data.areas,
        status:data.data.display,
      })
    }).catch((message) => {
      app.msg(message)
    })
  },

  //设置校区
  setArea:function(e){
    var that = this
    var area = Number(e.detail.value) + 1
    app.promiseRequest({
      url: 'user/setArea',
      data: {
        area: area
      },
      method: 'POST'
    }).then((data) =>{
      app.msg(data.message,'success')
      that.setData({
        area: area
      })
      wx.setStorageSync('user_area', area)
    }).catch((message) => {
      app.msg(message)
    })
  },

  switchStatus:function(e){
    var that = this
    if(that.data.area == 0){
      app.msg("请先设置校区")
      that.setData({
        status:that.data.status
      })
      return
    }
    var status = e.detail.value ? 1 : 0
    app.promiseRequest({
      url: 'user/setCourseTimeStatus',
      data: {
        status: status
      },
      method: 'POST'
    }).then((data) => {
      app.msg(data.message,'success')
      that.setData({
        status: status
      })
      wx.setStorageSync('display_course_time', status)
    }).catch((message) => {
      app.msg(message)
    })
  }
})