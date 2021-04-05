const app = getApp()
const { getSoulList, likeSoul } = require('../api/soul')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    likeSoul:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSoul()
    this.display()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "这鸡汤太毒了...",
    }
  },

  //获取毒鸡汤
  getSoul: function () {
    var list = wx.getStorageSync('souls')
    var soulsUpdate = wx.getStorageSync('soul_update')
    var that = this
    var soul = false
    var time = Math.floor((new Date).getTime() / 1000)
    that.setData({
      likeSoul:false
    })

    if(!list || time > soulsUpdate + 60 * 60){
      getSoulList().then((data) => {
        list = data.data
        wx.setStorageSync('souls', list)
        soul = list[Math.floor(Math.random() * list.length)]
        that.setData({
          soul: soul
        })
      }).catch((message) => {
        app.msg(message)
      })
      return
    }
    soul = list[Math.floor(Math.random() * list.length)]
    that.setData({
      soul: soul
    })
  },
  
  //点赞
  likeSoul: function (e) {
    let that = this
    if (this.data.likeSoul) {
      app.msg("你已经点过赞啦")
      return
    }
    let id = e.currentTarget.dataset.id
    let stu_id = app.getUserId()
    if(!stu_id){
      app.msg("登录后才能点赞")
      return
    }
    likeSoul({
      id,
      stu_id
    }).then((data) => {
      let soul = that.data.soul
      soul.like_count = soul.like_count + 1;
      that.setData({
        likeSoul: true,
        soul: soul
      })
    }).catch((message) => {
      app.msg(message)
    })
  },

  //贡献毒鸡汤
  create:function(){
    if(!app.getUserId()){
      app.msg("需要登录后才能提交")
      return
    }
    wx.navigateTo({
      url: 'submit/submit',
    })
  },
  display:function(){
    this.setData({
      display: app.getConfig('auditing') == 1 ? false : true
    })
  }
})