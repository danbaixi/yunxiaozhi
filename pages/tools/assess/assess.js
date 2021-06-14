const app = getApp()
const { getAssessList, assess } = require('../../api/other')
let videoAd = null
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    finish: false,
    finishAd: false, //观看完广告
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.isLogin('/' + that.route).then(function (res) {
      that.loadingAd()
      that.getList()
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  //激励广告
  loadingAd:function(){
    if (!this.data.finish && wx.createRewardedVideoAd) {
      console.log('广告加载...')
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-3c3771d2ae21a30f'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {
        app.msg("加载失败，请重新进入此页面")
      })
      videoAd.onClose((res) => {
        if(!res.isEnded){
          app.msg("您未观看完广告，无法使用一键评教")
          return
        }
        this.assess()
      })
    }else{
      this.setData({
        finishAd: true
      })
    }
  },

  //插屏广告
  loadingChaPing:function(){
    const that = this
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-925818f6261b9dc9'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
    if (interstitialAd) {
      setTimeout(function(){
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      },1200)
    }
  },

  getList:function(){
    var that = this
    getAssessList().then((res) => {
      if(res.status == 0){
        res.data.loading = false
        that.setData(res.data)
        return
      }
    })
  },

  start:function(){
    let _this = this
    // _this.assess()
    if (videoAd && !_this.data.finishAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
    app.msg("正在评教中，等待过程将会播放广告，感谢您的理解。")
  },

  // 评教
  assess: function () {
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    var that = this;
    app.isBind()
    if(that.data.finish){
      app.msg("你已经完成评教啦！")
      return
    }
    wx.showLoading({
      title: '努力评教中...',
      mask: true
    })
    assess({
      aid:that.data.assess.id
    }).then((res) => {
      if (res.status == 0) {
        wx.showToast({
          title: res.message,
          icon: res.message == '评教成功' ? 'success' : 'none',
          duration: res.message == '评教成功' ? 1500 : 5000
        })
        setTimeout(function () {
          that.getList()
        }, 1000)
      }
    })
  },

})