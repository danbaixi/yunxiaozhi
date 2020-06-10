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
    }
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
  }
})