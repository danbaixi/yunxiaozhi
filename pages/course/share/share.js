const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share:true, //分享页面 or 查看分享页面
    stu_id: '',
    term: 0,
    termIndex:0,
    terms:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let stu_id = options.stu_id || ''
    let term = options.term || 0
    let term_name = options.term_name || ''
    this.getTerms()
    this.setData({
      stu_id: stu_id,
      term: term,
      term_name: term_name
    })
    if (stu_id && term) {
      this.setData({
        share:false
      })
      this.getUserInfo()
    }
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
  //获取分享人的信息
  getUserInfo:function(){
    let _this = this
    app.promiseRequest({
      url:'data/getNameByStuId',
      data:{
        stu_id: _this.data.stu_id
      },
      needLogin:false
    }).then((result) => {
      _this.setData(result.data)
    }).catch((error) =>{
      app.msg(error.message)
    })
  },
  //获取学期
  getTerms: function () {
    let _this = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.promiseRequest({
      url: 'data/getTermsByClassname',
      data: {
        stu_id: wx.getStorageSync('user_id'),
        classname: ''
      },
      needLogin: false,
    }).then((result) => {
      wx.hideLoading()
      let terms = result.data
      let termIndex = 0
      if (_this.data.courseTerm) {
        terms.forEach((element, index) => {
          if (element.term == _this.data.courseTerm.term) {
            termIndex = index
          }
        });
      }
      _this.setData({
        terms: result.data,
        termIndex: termIndex
      })
    })
  },
})