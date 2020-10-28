const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var area = Number(options.area) + 1
    if(area == 2){
      area = 3
    }
    var floor = options.floor
    var weekly = options.weekly
    var week = Number(options.week) + 1
    var section = options.section
    var title = options.title
    app.httpRequest({
      url:'Emptyroom/getEmptyRoom',
      data:{
        area:area,
        floor:floor,
        weekly:weekly,
        week:week,
        section:section,
      },
      success:function(res){
        if(res.data.status == 0){
          that.setData({
            loading:false,
            rooms: res.data.data,
            title:title
          })
        }else{
          app.tips(res.data.message)
        }
      }
    })
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

  }
})