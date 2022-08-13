const app = getApp()
import {
  getIndexData,
  getUserCount
} from '../../../api/library'

Component({
  options: {
    addGlobalClass: true
  },

  lifetimes: {
    attached() {
      const cookie = wx.getStorageSync('lib_cookie')
      const stu_id = wx.getStorageSync('lib_id')
      this.setData({
        cookie,
        stu_id
      })
      this.getData()
      // this.getUserData()
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cacheKey: 'lib_index_data',
    cookie: '',
    showLogin: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    search() {
      wx.navigateTo({
        url: '/subPages/library/search/index?from=library',
      })
    },

    // 获取数据
    getData() {
      const that = this
      const cache = wx.getStorageSync(that.data.cacheKey)
      if (cache) {
        that.setData({
          ...cache
        })
        return
      }
      wx.showLoading({
        title: '加载中',
      })
      getIndexData().then(res => {
        wx.hideLoading()
        wx.setStorageSync(that.data.cacheKey, res.data)
        that.setData({
          ...res.data
        })
      }).catch(err => {
        console.log(err)
        app.msg(err.message || '获取数据失败')
      })
    },

    viewDetail(e) {
      const type = e.mark.type
      const {recordId, img} = this.data[type][e.currentTarget.dataset.index]
      const url = `/subPages/library/detail/index?id=${recordId}&img=${img ? encodeURIComponent(img) : ''}`
      wx.navigateTo({
        url
      })
    },

    viewMore(e) {
      const type = e.mark.type
      wx.navigateTo({
        url: `/subPages/library/top/index?type=${type}`,
      })
    },

    showLogin() {
      this.setData({
        showLogin: true
      })
    },

    hideLogin() {
      this.setData({
        showLogin: false
      })
    },

    loginSuccess() {
      this.hideLogin()
      this.setData({
        cookie: wx.getStorageSync('lib_cookie'),
        stu_id: wx.getStorageSync('lib_id')
      })
      // this.getUserData()
    },

    getUserData() {
      const that = this
      const { cookie } = that.data
      if (!cookie) {
        return
      }
      getUserCount({
        cookie
      }).then(res => {
        if (res.status == 5001) {
          //重新登录
          app.msg(res.message)
          that.showLogin()
          return
        }
        that.setData({
          userData: res.data
        })
      })
    },

    logout() {
      const that = this
      wx.showModal({
        title: '确定要退出当前账号吗？',
        success(res) {
          if (res.confirm) {
            wx.setStorageSync('lib_cookie', '')
            wx.setStorageSync('lib_id', '')
            that.setData({
              cookie: '',
              stu_id: '',
              showLogin: true
            })
          }
        }
      })
    }
  }
})