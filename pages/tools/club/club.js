const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:false,
    list:[],
    p:1,
    length:10,
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

  },
  searchInput:function(e){
    let oldSearch = this.data.search
    let search = e.detail.value
    if(oldSearch == search){
      return
    }
    this.setData({
      search: search,
      p:1
    })
    this.getList()
  },
  getList:function(){
    let _this = this 
    _this.setData({
      loading: true
    })
    app.httpRequest({
      url:'club/getList',
      needLogin: false,
      data:{
        search:_this.data.search,
        p: _this.data.p,
        length: _this.data.length
      },
      success:function(res){
        _this.setData(res.data.data)
      }
    })
  }
})