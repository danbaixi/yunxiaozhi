const app = getApp()
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area:0
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
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url:'user/getareainfo',
      data:{
        sign:sign,
        stu_id:user_id
      },
      success:function(res){
        if(res.data.status != 0){
          app.msg(res.data.message)
          return
        }
        that.setData({
          area:res.data.data.area,
          areas:res.data.data.areas,
          status:res.data.data.display,
        })
      }
    })
  },

  //设置校区
  setArea:function(e){
    var that = this
    var area = Number(e.detail.value) + 1
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'user/setArea',
      data: {
        sign: sign,
        stu_id: user_id,
        area: area
      },
      success: function (res) {
        app.msg(res.data.message)
        if (res.data.status == 0) {
          that.setData({
            area: area
          })
          wx.setStorageSync('user_area', area)
        }
      }
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
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'user/setCourseTimeStatus',
      data: {
        sign: sign,
        stu_id: user_id,
        status: status
      },
      success: function (res) {
        app.msg(res.data.message)
        if (res.data.status == 0) {
          that.setData({
            status: status
          })
          wx.setStorageSync('display_course_time', status)
        }
      }
    })
  }
})