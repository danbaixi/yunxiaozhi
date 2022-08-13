const app = getApp()
import {
  getDict,
  getDetail,
  getBookImgList,
  collect,
  cancelCollect,
} from '../../../api/library'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
    otherImgList: [],
    likeImgList: [],
    showLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const id = options.id || ''
    const img = options.img ? decodeURIComponent(options.img) : '/pages/assets/imgs/other/book_default.png'
    if (id == '') {
      app.msg('书籍不存在')
      setTimeout(() => {
        app.back()
      }, 1500);
      return
    }
    this.setData({
      id,
      img
    })
    this.getDictList()
    this.getDetail()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const title = `《${this.data.detail.detail.baseMarcInfoDto.title}》`
    const path = `/subPages/library/detail/index?id=${this.data.id}&img=${encodeURIComponent(this.data.img)}`
    return app.share(title,'',path)
  },

  // 获取配置项
  getDictList() {
    const that = this
    const cacheKey = 'library_dict'
    let options = wx.getStorageSync(cacheKey)
    if (options) {
      let dict = {
        circAttr: {}
      }
      // 借阅属性
      for (let item of options['circAttr']) {
        dict['circAttr'][item['code']] = item.name
      }
      that.setData({
        dict
      })
      return
    }
    getDict().then(res => {
      wx.setStorageSync(cacheKey, res.data)
      that.getDictList()
    }).catch(err => {
      app.msg('初始化失败，请重试')
      wx.navigateBack({
        delta: 1,
      })
      console.log(err)
    })
  },

  async getDetail() {
    wx.showLoading({
      title: '加载中',
    })
    try {
      const {
        data: detail
      } = await getDetail({
        id: this.data.id,
        cookie: wx.getStorageSync('lib_cookie') || ''
      })
      wx.hideLoading()
      // 获取封面
      if (detail.other && detail.other['numFound'] > 0) {
        this.getBookImgList(detail.other.imgData, 'otherImgList')
      }
      if (detail.like && detail.like['numFound'] > 0) {
        this.getBookImgList(detail.like.imgData, 'likeImgList')
      }
      this.setData({
        detail
      })
    } catch (err) {
      app.msg(err.message || '获取书籍失败')
      app.back()
    }
  },

  // 获取封面
  getBookImgList(info, name) {
    const that = this
    getBookImgList({
      info
    }).then(res => {
      that.setData({
        [name]: res.data
      })
    }).catch(err => {
      console.log('获取封面失败', err)
    })
  },

  viewDetail(e) {
    const type = e.currentTarget.dataset.type
    const id = this.data.detail[type]['searchResult'][e.currentTarget.dataset.index]['recordId']
    const img = this.data[`${type}ImgList`][e.currentTarget.dataset.index]
    const url = `/subPages/library/detail/index?id=${id}&img=${img ? encodeURIComponent(img) : ''}`
    const pages = getCurrentPages()
    if (pages.length > 5) {
      // 页面数 > 5就关闭当前页面跳转
      wx.redirectTo({
        url
      })
      return
    }
    wx.navigateTo({
      url
    })
  },

  viewAllText(e) {
    if (e.target.dataset.val) {
      app.msg(e.target.dataset.val)
    }
  },

  collect() {
    const that = this
    const {
      id,
      detail
    } = that.data
    const cookie = wx.getStorageSync('lib_cookie')
    if (cookie == '') {
      that.setData({
        showLogin: true
      })
      return
    }
    const data = {
      cookie,
      id
    }
    if (detail.detail.baseMarcInfoDto.myFav) {
      cancelCollect(data).then(res => {
        if (res.status == 5001) {
          // 重新登录
          that.setData({
            showLogin: true
          })
          return
        }
        app.msg('取消成功')
        detail.detail.baseMarcInfoDto.myFav = false
        that.setData({
          detail
        })
      }).catch(err => {
        app.msg(err.message || '操作失败')
      })
      return
    }
    collect(data).then(res => {
      if (res.status == 5001) {
        // 重新登录
        that.setData({
          showLogin: true
        })
        return
      }
      app.msg('收藏成功')
      detail.detail.baseMarcInfoDto.myFav = true
      that.setData({
        detail
      })
    }).catch(err => {
      app.msg(err.message || '操作失败')
    })
  },

  // 登录成功
  loginSuccess() {
    this.hideLogin()
    this.getDetail()
  },
  hideLogin() {
    this.setData({
      showLogin: false
    })
  }
})