const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading: true,
    list: [],
    search: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
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
      title: '白云电话本'
    }
  },
  //获取数据
  getList:function(){
    let _this = this
    app.httpRequest({
      url: 'phone/getList',
      needLogin: false,
      success:function(res){
        _this.setData({
          list: res.data.data,
          loading: false
        })
      }
    })
  },
  search: function (e) {
    let val = e.detail.value
    let list = this.data.list
    let count = 0
    for (let i = 0; i < list.length; i++) {
      if (list[i].title.search(val) != -1 || list[i].phone.search(val) != -1) {
        list[i].isShow = true
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      list: list,
      isNull: count == 0
    })
  },
  call:function(e){
    let phone = e.currentTarget.dataset.phone
    if(phone == ''){
      app.msg("电话号码为空，无法拨打")
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  copy:function(e){
    let phone = e.currentTarget.dataset.phone
    wx.setClipboardData({
      data: phone
    })
  }
})