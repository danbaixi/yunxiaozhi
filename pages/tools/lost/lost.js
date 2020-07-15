const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:false,
    list:[],
    detailIndex:0
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
  getList:function(){
    let _this = this
    _this.setData({
      loading: true
    })
    app.httpRequest({
      url:'lost/getList',
      needLogin: false,
      success:function(res){
        _this.setData(res.data.data)
      }
    })
  },
  search: function (e) {
    let val = e.detail.value.toLowerCase()
    let list = this.data.list
    let total = 0, count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      let b = list[i].name.toLowerCase();
      let c = list[i].feature.toLowerCase()
      let d = list[i].address.toLowerCase()
      if (b.search(a) != -1 || c.search(a) != -1 || d.search(a) != -1) {
        list[i].isShow = true
        total += Number(list[i].credit)
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      list: list,
      total: total.toFixed(1),
      isNull: count == 0
    })
  },
  viewItem:function(e){
    let index = e.currentTarget.dataset.index
    this.setData({
      detailIndex:index,
      showDetail: true
    })
  },
  hideModal:function(){
    this.setData({
      showDetail: false
    })
  }
})