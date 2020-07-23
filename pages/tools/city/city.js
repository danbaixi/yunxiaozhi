const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading: false,
    list: [],
    p: 1,
    length: 10,
    search: '',
    oldSearch: '',
    notMore: false,
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
    if (!this.data.notMore) {
      this.setData({
        loading: true,
        p: this.data.p + 1
      })
      this.getList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '快速找到白云同乡会'
    }
  },
  searchInput: function (e) {
    this.setData({
      search: e.detail.value
    })
  },
  search: function () {
    if (this.data.search == this.data.oldSearch) {
      return
    }
    this.setData({
      oldSearch: this.data.search,
      list: [],
      p: 1
    })
    this.getList()
  },
  getList: function () {
    let _this = this
    _this.setData({
      loading: true
    })
    app.httpRequest({
      url: 'city/getList',
      needLogin: false,
      data: {
        search: _this.data.search,
        p: _this.data.p,
        length: _this.data.length,
      },
      success: function (res) {
        let list = _this.data.list
        if (res.data.data.list.length < _this.data.length) {
          res.data.data.notMore = true
        } else {
          res.data.data.notMore = false
        }
        list = list.concat(res.data.data.list)
        res.data.data.list = list
        _this.setData(res.data.data)
      }
    })
  },
  viewItem:function(e){
    let index = e.currentTarget.dataset.index
    if(this.data.list[index].qrcode == ''){
      app.msg("暂无群信息")
      return
    }
    app.msg("长按识别直接加群")
    wx.previewImage({
      current: this.data.list[index].qrcode,
      urls: [this.data.list[index].qrcode]
    })
  }
})