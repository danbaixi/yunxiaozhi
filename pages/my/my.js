var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    user_name:"请先登录",
    user_img:"http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png",
    visible:false,
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    credit:0,
    attendance:0,
    exam:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow:function(){
    this.onPullDownRefresh();
  },

  onPullDownRefresh: function () {
    this.getUserInfo();
    this.getCountData();
    setTimeout(() => {
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
    }, 1000);
  },

  onShareAppMessage:function () {
    return app.share()
  },

  bind:function(){
    if(!app.getLoginStatus()){
      app.msg('请先登录')
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    if (!app.getUserId()){
      wx.navigateTo({
        url: '/pages/bind/bind',
      })
      return
    }

    app.msg("暂不支持解绑")

  },
  login:function(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  //获取用户信息
  getUserInfo:function(){
    let that = this
    let user_name = that.data.user_name
    let user_img = that.data.user_img

    let userInfo = wx.getStorageSync('user_info')
    let session = app.getLoginStatus()
    let user_id = app.getUserId()
    if (userInfo){
      user_name = userInfo.nickName
      user_img = userInfo.avatarUrl
    }
    if (user_id){
      let start = user_id.substring(0, 3);
      let end = user_id.substring(8);
      user_id = start + "*****" + end;
    }

    this.setData({
      user_name: user_name,
      user_img: user_img,
      session: session,
      user_id: user_id
    });
  },

  showModal(e) {
    this.setData({
      modalName: 'kefu'
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  handleClose:function(){
    this.setData({
      visible: false
    });
  },

  goPage:function(e){
    if(!app.getLoginStatus()){
      app.msg("请先登录")
      return
    }
    if (!app.getUserId()) {
      app.msg("请先绑定账号")
      return
    }
    var page = e.currentTarget.dataset.page
    wx.navigateTo({
      url: page
    })
  },

  //退出登录
  exit:function(){
    if(!app.getLoginStatus()){
      app.msg("你还没有登录呢")
      return
    }
    wx.showModal({
      title:'温馨提示',
      content: '确定要退出账号吗？',
      success:function(res){
        if(res.confirm){
          app.exitSaveData()
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },

  //获取汇总数据
  getCountData:function(){
    let _this = this
    app.httpRequest({
      url:'user/getCountData',
      success:function(res){
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }
      }
    })
  }
})