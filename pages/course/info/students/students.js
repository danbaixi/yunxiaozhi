const courseFn = require("../../../../utils/course")
const { getStudentList } = require('../../../api/course')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_pre: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/',
    p: 1,
    length: 15,
    list: [],
    loading: false,
    finish: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(decodeURIComponent(options.data))
    this.setData({
      data: data
    })
    this.getList(data)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.finish) {
      this.setData({
        p: this.data.p + 1
      })
      this.getList(this.data.data)
    }
  },

  getList: function (data) {
    var that = this
    var section = data.jie + (data.jieshu > 1 ? ('-' + (parseInt(data.jie) + parseInt(data.jieshu) - 1)) : '')
    let courseTerm = courseFn.getNowCourseTerm()
    that.setData({
      loading: true
    })
    getStudentList({
      term: courseTerm.term,
      name: (data.fullName || data.name),
      weekly: data.zhoushu,
      section: section,
      teacher: data.teacher,
      address: data.fullAddress,
      week: data.week,
      category: data.category,
      p: that.data.p,
      length: that.data.length,
      count: 0
    }).then((res) => {
      if (res.status == 0) {
        var list = that.data.list
        var finish = false
        list = list.concat(res.data)
        if (res.data.length < that.data.length) {
          finish = true
        }
        that.setData({
          list: list,
          finish: finish
        })
      }
    })
  }
})