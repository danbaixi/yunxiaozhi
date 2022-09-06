const app = getApp()
const {
  getClubList,
  getClubCategory,
  starClub
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
    category: [{
      value: 0,
      text: "全部分类"
    }],
    cid: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
    this.getCategory()
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
      title: '找社团，上云小智'
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
    let stu_id = wx.getStorageSync('user_id')
    _this.setData({
      loading: true
    })
    getClubList({
      search: _this.data.search,
      cid: _this.data.category[_this.data.cid].value,
      p: _this.data.p,
      length: _this.data.length,
      stu_id: stu_id
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

  //获取分类
  getCategory: function () {
    let _this = this
    getClubCategory().then((res) => {
      if (res.status == 0) {
        const list = res.data.map(item => {
          return {
            value: item.id,
            text: item.name
          }
        })
        let category = _this.data.category
        category = category.concat(list)
        _this.setData({
          category: category
        })
      }
    })
  },

  //选择分类
  selectCategory: function (e) {
    let select = e.detail
    if (select == this.data.cid) {
      return
    }
    this.setData({
      p: 1,
      list: [],
      cid: select
    })
    this.getList()
  },

  // 详情
  showItem: function (e) {
    let index = e.currentTarget.dataset.index
    let club = this.data.list[index]
    wx.navigateTo({
      url: '/pages/tools/club/item/item?id=' + club.id + '&stared=' + club.stared,
    })
  },

  //点赞
  star: function (e) {
    let _this = this
    let stu_id = wx.getStorageSync('user_id')
    let index = e.currentTarget.dataset.index
    let cid = _this.data.list[index].id
    if (stu_id == '') {
      app.msg("登录后才能点赞哦")
      return
    }
    if (_this.data.list[index].stared == 1) {
      app.msg("你已经点过赞啦！")
      return
    }
    starClub({
      cid: cid,
      stu_id: stu_id
    }).then((res) => {
      if (res.status == 0) {
        app.msg(res.message)
        let list = _this.data.list
        list[index].star++
        list[index].stared = 1
        _this.setData({
          list: list
        })
      }
    })
  }
})