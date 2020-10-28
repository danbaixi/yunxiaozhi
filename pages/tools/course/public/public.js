const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    loading: true,
    showDetail:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from: options.from
    })
    let that = this
    app.isLogin('/' + that.route).then(function (res) {
      that.getList()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //更新
  update:function(){
    app.msg('选修课暂不支持更新')
    return
  },

  getList:function(){
    let _this = this
    app.httpRequest({
      url:'course/getPublicCourse',
      success:function(res){
        if (res.data.status == 0) {
          _this.setData({
            course: res.data.data.course,
            term: res.data.data.term,
            loading: false
          })
        }
      }
    })
  },
  backPage: function () {
    if (this.data.from == 'index') {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
  //查看详情
  viewDetail:function(e){
    let detailIndex = e.currentTarget.dataset.index
    this.setData({
      detailIndex: detailIndex,
      showDetail: true
    })
  },
  //hide
  hideModal:function(){
    this.setData({
      showDetail: false
    })
  }
})