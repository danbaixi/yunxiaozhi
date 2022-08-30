const app = getApp()
const {
  getSameCityList
} = require('../../api/other')
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
    openStatus: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let auditing = app.getConfig('auditing')
    const functionStatus = app.getConfig('functions.city')
    if (!functionStatus || functionStatus.status == 0) {
      this.setData({
        openStatus: functionStatus.status,
        openTips: functionStatus.tips
      })
    }
    this.setData({
      auditing: auditing
    })
    this.getList()
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
      title: '快来找到你的白云同乡会'
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

  // 获取列表
  getList: function () {
    let _this = this
    _this.setData({
      loading: true
    })
    getSameCityList({
      search: _this.data.search,
      p: _this.data.p,
      length: _this.data.length,
    }).then((res) => {
      if (res.status == 0) {
        let list = _this.data.list
        if (res.data.list.length < _this.data.length) {
          res.data.notMore = true
        } else {
          res.data.notMore = false
        }
        list = list.concat(res.data.list)
        res.data.list = list
        _this.setData(res.data)
      }
    })
  },

  // 详情
  viewItem: function (e) {
    if (this.data.auditing == 1) {
      app.msg('数据同步中，请稍后再试')
      return
    }
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/tools/city/detail/index?id=${this.data.list[index].id}`,
    })
    // if(this.data.list[index].url == ''){
    //   app.msg("信息待补充")
    //   return
    // }
    // wx.navigateTo({
    //   url: '/pages/article/article?src=' + encodeURIComponent(this.data.list[index].url) + '&title=' + this.data.list[index].name + '详情',
    // })
  }
})