const app = getApp()
import {
  getHotBooks,
  getNewBooks,
  getBookImgList
} from '../../../api/library'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    rows: 10,
    list: [],
    bookImgList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const type = options.type || ''
    if (type == '') {
      app.msg('页面不存在')
      app.back()
      return
    }
    this.setData({
      type
    })
    this.getList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.finish) {
      return
    }
    this.setData({
      page: this.data.page + 1
    })
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const title = type == 'hot' ? '热读推荐' : '新书速递'
    return app.share({
      title: `图书馆${title}！`
    })
  },

  reload() {
    this.setData({
      page: 1,
      list: [],
      bookImgList: [],
      finish: false
    })
    this.getList()
  },

  getList() {
    const that = this
    const data = {
      page: that.data.page,
      rows: that.data.rows
    }
    that.setData({
      loading: true
    })
    let r = null
    let resultKey = ''
    if (that.data.type == 'hot') {
      r = getHotBooks(data)
      resultKey = 'result'
    } else if (that.data.type == 'new') {
      r = getNewBooks(data)
      resultKey = 'searchResult'
    }
    r.then(res => {
      that.getBookImg(res.data.imgData)
      let finish = false
      if (res.data.length < that.data.rows) {
        finish = true
      }
      that.setData({
        finish,
        loading: false,
        finish,
        list: [...that.data.list, ...res.data[resultKey]]
      })
    })
  },
  // 获取封面
  getBookImg(data) {
    const that = this
    getBookImgList({
      info: data
    }).then(res => {
      that.setData({
        bookImgList: [...that.data.bookImgList, ...res.data]
      })
    }).catch(err => {
      console.log('获取封面失败', err)
      const bookImgList = that.data.bookImgList
      for (let i = 0; i < that.data.rows; i++) {
        bookImgList.push('')
      }
      that.setData({
        bookImgList
      })
    })
  },
})