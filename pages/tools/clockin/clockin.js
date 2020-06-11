const app = getApp()
import WxCountUp from '../../../utils/wxCountUp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayCount:0,
    times:{
      start:'05:30',
      end: '08:30'
    },
    p:1,
    length:10,
    type:'today',
    tabs:['今日','全校','学院','班级'],
    tabCur:0,
    customBar:app.globalData.customBar,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let info = wx.getSystemInfoSync()
    this.setData({
      winHeight:info.windowHeight,
      winWidth:info.windowWidth
    })
    this.getData()
    this.getInfo()
    this.getRanks()
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
  //获取数据
  getData:function(){
    let _this = this
    app.httpRequest({
      url:'clockin/getData',
      success:function(res){
        if(res.data.status == 0){
          _this.setData(res.data.data)
          _this.todayCountUp()
          return
        }
        app.msg(res.data.message)
      }
    })
  },
  //打卡
  clockIn:function(){
    let _this = this
    app.httpRequest({
      url:'clockin/clockIn',
      success:function(res){
        if(res.data.status == -1){
          app.msg(res.data.message)
          return
        }
        _this.clockInSuccess()
        _this.setData(res.data.data)
        _this.getData()
      }
    })
  },
  //人数滚动
  todayCountUp:function(number){
    this.countUp = new WxCountUp('todayCount', this.data.todayCount, {decimalPlaces:0}, this)
    this.countUp.start()
  },
  //打卡成功
  clockInSuccess:function(){
    this.setData({
      modalName:'success'
    })
  },
  //关闭窗口
  close:function(){
    this.setData({
      modalName:''
    })
  },

  //获取海报
  getPoster:function(){
    wx.navigateTo({
      url:'/pages/tools/clockin/poster/poster'
    })
    this.close()
  },
  getInfo:function(){
    var _this = this;
    app.promiseRequest({
      url: 'user/getInfo'
    }).then((result) => {
      _this.setData({
        userInfo:result.data
      })
    }).catch((message) => {
      app.msg(message)
    })
  },
  //获取排名
  getRanks:function(){
    let _this = this
    app.httpRequest({
      url:'clockin/getRank',
      data:{
        p:_this.data.p,
        length:_this.data.length,
        type:_this.data.type
      },
      success:function(res){
        console.log(res)
      }
    })
  },
  //切换排名
  tabSelect:function(e){
    let _this = this
    if(_this.data.tabCur == e.currentTarget.dataset.id){
      return
    }
    _this.setData({
      tabCur: e.currentTarget.dataset.id,
    })
  },
  swpierSelect:function(e){
    let _this = this
    _this.setData({
      tabCur: e.detail.current 
    });
  }
})