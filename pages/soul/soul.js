const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    soul:[],
    likeSoul:false,
    displayEgg:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var egg = wx.getStorageSync('egg')
    if(options.egg == 1 && (egg == '' || egg == 0)){
      this.setData({
        displayEgg:true
      })
      wx.setStorageSync('egg',1)
    }
    this.getSoul()
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
  getSoul: function () {
    var list = wx.getStorageSync('souls')
    var soulsUpdate = wx.getStorageSync('soul_update')
    var that = this
    var soul = false
    var time = Math.floor((new Date).getTime() / 1000)
    that.setData({
      likeSoul:false
    })
    if (!list || list == '' || list.length == 0 || time > soulsUpdate + 60 * 60) {
      app.httpRequest({
        url: 'soul/getList',
        needLogin: false,
        success: function (res) {
          if (res.data.status == 0) {
            list = res.data.data
            wx.setStorageSync('souls', list)
            wx.setStorageSync('soul_update', time)
            soul = list[Math.floor(Math.random() * list.length)]
            that.setData({
              soul: soul
            })
          }
        }
      })
    } else {
      soul = list[Math.floor(Math.random() * list.length)]
      that.setData({
        soul: soul
      })
    }
  },
  likeSoul: function (e) {
    var that = this
    if (this.data.likeSoul) {
      app.msg("你已经点过赞啦")
      return
    }
    var id = e.currentTarget.dataset.id
    var stu_id = wx.getStorageSync('user_id')
    app.httpRequest({
      url: 'soul/like',
      needLogin: false,
      data: {
        id: id,
        stu_id: stu_id
      },
      success: function (res) {
        if (res.data.status == 0) {
          var soul = that.data.soul
          soul.like_count = soul.like_count + 1;
          that.setData({
            likeSoul: true,
            soul: soul
          })
        } else {
          app.msg(res.data.message)
        }
      }
    })
  },
  create:function(){
    this.setData({
      modalName:'create'
    })
  },
  hideModal:function(){
    this.setData({
      modalName:''
    })
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  },
  submitForm:function(e){
    var title = e.detail.value.title
    var name = e.detail.value.name
    var that = this
    if(title == ""){
      app.msg("空的毒鸡汤？")
      return
    }
    app.httpRequest({
      url:'soul/create',
      needLogin:false,
      data:{
        title:title,
        name:name
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status != 0){
          return
        }
        that.setData({
          modalName: ''
        })
      }
    })
  },
  hideEgg:function(){
    this.setData({
      displayEgg:false
    })
  }
})