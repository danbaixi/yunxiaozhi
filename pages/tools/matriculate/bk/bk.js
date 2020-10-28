const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    display:false,
    result:{},
    status:0,
    tips:'正在加载...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    return {
      title: "白云学院录取结果查询"
    }
  },
  //初始化
  init:function(){
    let _this = this
    app.httpRequest({
      url:'matriculate/initBk',
      needLogin:false,
      success:function(res){
        if(res.data.status == -1){
          app.msg("初始化失败")
          return
        }
        _this.setData(res.data.data)
      }
    })
  },
  input:function(e){
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    let data = {}
    data[key] = value
    this.setData(data)
  },
  query:function(){
    let _this = this
    let params = _this.data.params
    let data = {}
    for(let i=0;i<params.length;i++){
      if(!_this.data[params[i].key] || _this.data[params[i].key] == ''){
        app.msg(`请输入${params[i].name}`)
        return
      }
      data[params[i].key] = _this.data[params[i].key]
    }
    wx.showLoading({
      title: '查询中...',
      mask: true
    })
    _this.setData({
      result: {}
    })
    app.httpRequest({
      url:'matriculate/bk',
      needLogin: false,
      data:data,
      success:function(res){
        wx.hideLoading()
        if(res.data.status == -1){
          app.msg(res.data.message)
          return
        }
        _this.setData({
          display: true,
          result: res.data.data
        })
      }
    })
  }

})