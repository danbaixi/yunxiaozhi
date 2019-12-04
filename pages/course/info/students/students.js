const app = getApp()
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
    if (!this.data.finish) {
      this.setData({
        p: this.data.p + 1
      })
      this.getList(this.data.data)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getList: function (data) {
    var that = this
    var section = data.jie + '-' + (parseInt(data.jie) + parseInt(data.jieshu) - 1)
    that.setData({
      loading: true
    })
    app.httpRequest({
      url: "course/getSameCourseStudent",
      data: {
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
      },
      success: function (res) {
        if (res.data.status == 0) {
          var list = that.data.list
          var finish = false
          list = list.concat(res.data.data)
          if (res.data.data.length < that.data.length) {
            finish = true
          }
          that.setData({
            list: list,
            finish: finish
          })
        }
      }
    })
  }
})