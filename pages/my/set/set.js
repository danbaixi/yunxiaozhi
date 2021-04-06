const app = getApp();
const { exitSaveData } = require('../../../utils/util')
const { getUserConfig,setUserConfig, getUntieCount, untieWechat } = require('../../api/user')
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
    getUserConfig().then((data) => {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
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
    setUserConfig({field,value}).then(() => {
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
      title: '正在加载',
      mask: true
    });
    (async function(){
      const countData = await getUntieCount()
      const {total,level} = countData.data
      if(level <= 0){
        app.msg(`今年${total}次解绑已用完`)
        return
      }
      wx.showModal({
        title: '温馨提示',
        content: `每年可解绑${total}次，您还可以解绑${level}次，确定要解绑吗？`,
        success:function(res){
          if(res.confirm){
            app.msg('正在解绑','loading')
            untieWechat().then((res) => {
                if(res.status != 0){
                  app.msg(res.message)
                  return
                }
                exitSaveData()
                wx.navigateTo({
                  url: '/pages/login/login',
                })
            })
          }
        }
      })
    })()
  }
})