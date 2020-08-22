const app = getApp()
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
    let soul = options.id
    this.getSoul()
    this.display()
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
      app.requestSouls().then((data) => {
        list = data.data
        wx.setStorageSync('souls', list)
        wx.setStorageSync('soul_update', time)
        soul = list[Math.floor(Math.random() * list.length)]
        that.setData({
          soul: soul
        })
      }).catch((message) => {
        app.msg(message)
      })
    }else{
      soul = list[Math.floor(Math.random() * list.length)]
      that.setData({
        soul: soul
      })
    }
  },
  
  //点赞
  likeSoul: function (e) {
    let that = this
    if (this.data.likeSoul) {
      app.msg("你已经点过赞啦")
      return
    }
    let id = e.currentTarget.dataset.id
    let stu_id = wx.getStorageSync('user_id')
    app.likeSoul(id,stu_id).then((data) => {
      let soul = that.data.soul
      soul.like_count = soul.like_count + 1;
      that.setData({
        likeSoul: true,
        soul: soul
      })
    }).catch((message) => {
      app.msg(res.data.message)
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
    let config = wx.getStorageSync('configs')
    this.setData({
      display:!config.auditing
    })
  }
})