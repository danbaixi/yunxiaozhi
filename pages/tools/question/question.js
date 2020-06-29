const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    display: true,
    clip: true,
    auto: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    this.init()
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
    this.getClip()
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
  
  //初始化
  init:function(){
    let _this = this
    app.httpRequest({
      url:'question/init',
      success:function(res){
        if(res.data.status == -1){
          app.msg(res.data.status)
          _this.setData({
            display: false
          })
          return
        }
        let display = true
        if(res.data.data.notice != ''){
          display = false
        }
        res.data.data.display = display
        _this.setData(res.data.data)
      }
    })
  },
  //看广告增加次数
  add:function(){
    this.addCount()
  },
  //增加次数
  addCount:function(){
    let _this = this
    app.httpRequest({
      url:'question/addCount',
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }
      }
    })
  },
  //自动获取开关
  switchClip:function(e){
    this.setData({
      clip: e.detail.value
    })
  },
  //自动查询开关
  switchAuto:function(e){
    this.setData({
      auto: e.detail.value
    })
  },
  //获取剪贴板内容
  getClip:function(){
    if(!this.data.clip){
      return
    }
    let _this = this
    wx.getClipboardData({
      success: (res) => {
        _this.setData({
          question:res.data
        })
      },
      fail:(res) => {
        console.log('获取剪贴板内容失败')
      }
    })
  },
  //查题
  query:function(){
    let _this = this
    if(_this.data.info.stock <= 0){
      app.msg("你的查题次数不足，请先增加")
      return
    }
    //TODO 查题

  },
  //请求
  apiQuery:function(){
    let _this = this
    let promise = new Promise((resolve,reject) => {
      wx.request({
        url: _this.data.url + _this.data.question,
        method: 'GET',
        success:function(res){
          console.log(res)
          return res
        },
        fail:function(res){
          app.msg('请求超时，请重试')
          return false
        }
      })
    })
    return promise
  },

})