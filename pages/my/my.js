var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus_article:"http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001363&idx=1&sn=67d2da535e60c9cb0f6e14d6064fd343&chksm=6a35bc575d423541201186f77e8203f6d5318a073a69e614967edf4ebf207381690812f0f08d#rd",
    question_article: "http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001694&idx=1&sn=9309f576dc890a02095509553122519d&chksm=6a35bd9a5d42348c22fd657bc2014f805f7559b536fd3da8eb661697636345aa4e9fbeb6029c#rd",
    userInfo: null,
    user_name:"请先登录",
    user_img:"http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png",
    visible:false,
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    credit:0,
    attendance:0,
    exam:0,
    gridCol:4,
    tools:[
      {
        badge: 0,
        name: '通讯录',
        icon: 'students',
        needLogin: true,
        url: '../tools/friends/friends?from=index',
      },
      {
        badge: 0,
        name: '理论课',
        icon: 'theory',
        needLogin: true,
        url: '../tools/course/theory/theory?from=index',
      },
      {
        badge: 0,
        name: '选修课',
        icon: 'public',
        needLogin: true,
        url: '../tools/course/public/public?from=index',
      },
      {
        badge: 0,
        name: '实训周',
        icon: 'train',
        needLogin: true,
        url: '../tools/course/train/train?from=index',
      }
    ],
    electricity:0,
    water: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getQuantityData()
  },

  onShow:function(){
    this.onPullDownRefresh();
  },

  onPullDownRefresh: function () {
    if (!app.getUserId()) {
      return
    }
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
      app.promiseRequest({
        url: 'user/getInfo'
      }).then((result) => {
        let data = result.data
        user_name = app.isDefaultNickname(data.user_name) ? data.nickname : data.user_name
        user_img = data.user_img ? app.globalData.headImgUrl + data.user_img : data.avatar
        that.setData({
          user_name: user_name,
          user_img: user_img,
        })
      })
    }
    if (user_id){
      let start = user_id.substring(0, 3);
      let end = user_id.substring(8);
      user_id = start + "*****" + end;
    }

    this.setData({
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
  },
  //打开应用
  openTool:function(e){
    let index = e.currentTarget.dataset.index
    let tool = this.data.tools[index]
    if(tool.needLogin){
      app.isBind().then((result)=>{
        if(result){
          wx.navigateTo({
            url: tool.url,
          })
        }
      })
      return
    }
    wx.navigateTo({
      url: tool.url,
    })
  },
  focus_me:function(){
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent(this.data.focus_article),
    })
  },

  //获取水电
  getQuantityData: function () {
    if (!app.getUserId()) {
      return
    }
    let _this = this
    app.httpRequest({
      url: 'dormitory/getQuantityDetail',
      success: function (res) {
        if (res.data.data != []) {
          _this.setData(res.data.data)
        }
      }
    })
  },
  question:function(){
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent(this.data.question_article),
    })
  },
  showAddTip:function(){
    this.setData({
      add_tips: true
    })
  },
  closeAddTip:function(){
    this.setData({
      add_tips: false
    })
  }
})