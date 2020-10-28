const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content:'',
    receiver:'',
    sended:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  receiverInput(e) {
    this.setData({
      receiver: e.detail.value
    })
  },
  contentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },
  senderInput(e) {
    this.setData({
      sender: e.detail.value
    })
  },
  submit:function(){
    let _this = this
    var receiver = _this.data.receiver
    var sender = _this.data.sender
    var content = _this.data.content
    if(receiver == ''){
      app.msg("你想跟谁表白？")
      return
    }
    if(content == ''){
      app.msg("不说点什么吗？")
      return
    }
    wx.showLoading({
      title: '正在提交',
      mask: true
    })
    app.httpRequest({
      url:'confession/add',
      data:{
        receiver:receiver,
        sender:sender,
        content:content
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.status == 0){
          //弹窗
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          })
          _this.setData({
            content:'',
            receiver: '',
            sender: ''
          })
        }else{
          app.msg(res.data.message)
        }
      }
    })
  }
})