const app = getApp()
import WxCountUp from '../../../utils/wxCountUp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayStep:0,
    updateTime: '',
    updateInterval: 60 // 更新间隔
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

  },
  init:function(){
    let _this = this 
    app.promiseRequest({
      url:'sport/init'
    }).then((data) => {
      _this.setData(data.data)
      _this.numberRun(data.data.todayStep)
    }).catch((error) => {
      app.msg(error)
    })
  },
  login:function(){
    return app.promiseRequest({
      url: ''
    })
  },
  getData:function(){
    if(!app.getUserId()){
      app.msg("登录后才能参与运动排名")
      return
    }
    let _this = this
    let sport_update_time = wx.getStorageSync('sport_update_time')
    let now_time = parseInt(new Date().getTime() / 1000)
    let times = now_time - sport_update_time
    if(sport_update_time &&  times < _this.data.updateInterval){
      app.msg(`请在${_this.data.updateInterval - times}秒后刷新`)
      return
    }
    wx.login({
      success: (res) => {
        let code = res.code
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.werun']) {
              wx.authorize({
                scope: 'scope.werun',
                success () {
                  _this.getWeRunData(code)
                }
              })
            }else{
              _this.getWeRunData(code)
            }
          }
        })
      },
      fail: () => {
        app.msg('初始化失败，请重试')
      }
    })
    
  },
  getWeRunData:function(code){
    let _this = this
    app.msg("正在刷新...","loading")
    wx.getWeRunData({
      success (res) {
        app.promiseRequest({
          url: 'sport/updateData',
          method: 'POST',
          data:{
            code: code,
            iv: res.iv,
            encryptedData: res.encryptedData
          }
        }).then((data) => {
          app.msg(data.message)
          if(data.status == 0){
            //刷新
            _this.setData(data.data)
            _this.numberRun(data.data.todayStep)
            let now_time = parseInt(new Date().getTime() / 1000)
            wx.setStorageSync('sport_update_time', now_time)
          }
        }).catch((error) => {
          app.msg(error)
        })
      }
    })
  },
  //数字滚动
  numberRun:function(number){
    this.countUp = new WxCountUp('todayStep', number, {separator:''}, this)
    this.countUp.start()
  }
})