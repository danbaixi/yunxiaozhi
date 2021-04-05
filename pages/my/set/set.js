const app = getApp();
const { exitSaveData } = require('../../../utils/common')
const { setUserConfig } = require('../../api/user')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    settings:[],
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    app.isLogin('/' + that.route).then(function (res) {
      that.getUserConfig()
    })
  },

  onPullDownRefresh: function(){
    let that = this
    app.isLogin('/' + that.route).then(function (res) {
      that.getUserConfig()
    })
    wx.showNavigationBarLoading({
      complete: (res) => {},
    })
  },

  onShareAppMessage: function () {
    return app.share()
  },

  getUserConfig:function(){
    var that = this;
    app.promiseRequest({
      url: 'user/getUserConfig'
    }).then((data) => {
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      that.setData({
        loading: false,
        settings:data.data
      })
    })
  },

  //设置是否隐藏名字
  displayName: function (e) {
    let field = e.currentTarget.dataset.field
    let value = e.detail.value ? 1 : 0
    setUserConfig({
      field,
      value
    }).then().catch((message) => {
      app.msg(message)
    })
  },

  //隐藏毒鸡汤
  hideSoul:function(e){
    let field = e.currentTarget.dataset.field
    let value = e.detail.value ? 1 : 0
    setUserConfig({field,value}).then((data) => {
      wx.setStorageSync("hide_soul", value)
    }).catch((message) => {
      app.msg(message)
    })
  },

  //设置校区和上课时间
  setTime:function(){
    wx.navigateTo({
      url: '/pages/course/setTime/setTime',
    })
  },

  //设置宿舍
  setDormitory:function(){
    wx.navigateTo({
      url: '/pages/my/dormitory/dormitory',
    })
  },
  //解绑微信
  untieWechat:function(){
    if(!app.getUserId()){
      app.msg("你还没绑定账号呢")
      return
    }
    wx.showLoading({
      title: '正在加载...',
    })
    app.httpRequest({
      url: 'user/getUntieLevel',
      success:function(res){
        wx.hideLoading()
        let level = res.data.data.level
        let total = res.data.data.total
        if(level <= 0){
          app.msg("本年解绑次数已用完")
          return
        }
        wx.showModal({
          title: '温馨提示',
          content: `每年可解绑${total}次，您还可以解绑${level}次，确定要解绑吗？`,
          success:function(res){
            if(res.confirm){
              app.msg('正在解绑...','loading')
              app.httpRequest({
                url: 'user/unTieWechat',
                success:function(res){
                  wx.hideLoading()
                  if(res.data.status != 0){
                    app.msg(res.data.message)
                    return
                  }
                  exitSaveData()
                  wx.navigateTo({
                    url: '/pages/login/login',
                  })
                }
              })
            }
          }
        })
      }
    })
  }
})