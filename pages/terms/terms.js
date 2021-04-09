const app = getApp()
const { getContentByKey, acceptTerms } = require('../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    time: 30 //阅读时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton()
    this.getUserTerms()
    this.getSetting()
    this.runTime()
  },

  onUnload: function(){
    if(this.data.is_accept == 0){
      app.msg("请先阅读并接受用户条款")
      wx.navigateTo({
        url: '/pages/terms/terms',
      })
      return
    }
  },

  // 加载条款和个人设置
  getUserTerms:function(){
    let _this = this
    wx.showLoading({
      title: '正在加载',
    })
    getContentByKey({
      key: 'user_terms'
    }).then((res) => {
      if(res.status === 0){
        _this.setData(res.data)
        return
      }
    })
  },

  // 获取状态
  getSetting(){
    let setting = app.getConfig('accept_terms') || 0
    this.setData({
      is_accept: setting
    })
  },

  // 倒计时
  runTime:function(){
    let is_accept = app.getConfig('accept_terms') || 0
    if(is_accept == 1){
      this.setData({
        time:0
      })
      return
    }
    let timeRun = setInterval(()=>{
      let time = this.data.time - 1
      this.setData({
        time: time
      })
      if(time == 0){
        clearInterval(timeRun)
      }
    },1000)
  },

  // 接受条款
  acceptTerms:function(){
    let _this = this
    acceptTerms().then((res) => {
      app.msg(res.message)
      if(res.status == 0){
        _this.setData({
          is_accept: 1
        })
        let configs = wx.getStorageSync('configs')
        configs.accept_terms = 1
        wx.setStorageSync('configs', configs)
        setTimeout(()=>{
          wx.switchTab({
            url: '/pages/index/index',
          })
        },1000)
      }
    })
  }
})