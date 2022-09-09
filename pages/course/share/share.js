const app = getApp()
const { getCourseByClassname } = require('../../api/course')
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
    let class_name = options.class_name || ''
    let term = options.term || 0
    let term_name = options.term_name || ''
    let term_date = options.term_date || ''
    if (class_name == '' || term == '') {
      app.msg('分享已失效')
      app.back()
      return
    }
    this.setData({
      class_name,
      term: term,
      term_name,
      term_date
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  viewCourse:function(){
    let that = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getCourseByClassname({
      term: that.data.term,
      class_name: that.data.class_name
    }).then((res) => {
      wx.hideLoading()
      if (res.data.length == 0) {
        app.msg('此课表不存在！')
        return
      }
      const tmpClass = {
        number: '',
        name: that.data.class_name
      }
      const term = {
        name: that.data.term_name,
        term: that.data.term,
        term_date: that.data.term_date
      }
      //清空course_stu
      wx.removeStorageSync('course_stu')
      wx.setStorageSync('tmp_class', tmpClass)
      wx.setStorageSync('course', res.data)
      wx.setStorageSync('refrsh_course', true)
      wx.setStorageSync('course_term', term)
      wx.switchTab({
        url: '/pages/course/course',
      })
    })
  }
})