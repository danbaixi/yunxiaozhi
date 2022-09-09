const { getAreaInfo, setAreaInfo, setDisplayTime } = require('../../api/user')
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

  getData:function(){
    var that = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getAreaInfo().then((data) => {
      wx.hideLoading()
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
    setAreaInfo({area})
      .then((data) =>{
        app.msg(data.message,'success')
        that.setData({
          area: area
        })
        wx.setStorageSync('refresh_course_time', true)
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
    setDisplayTime({status})
      .then((data) => {
        app.msg(data.message,'success')
        that.setData({
          status: status
        })
        wx.setStorageSync('refresh_course_time', true)
        wx.setStorageSync('display_course_time', status)
      })
      .catch((message) => {
        app.msg(message)
      })
  },
})