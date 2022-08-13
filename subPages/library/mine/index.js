const app = getApp()
import {
  getMineList,
  checkLogin,
  getBookImgList,
  reNew
} from '../../../api/library'
Component({
  options: {
    addGlobalClass: true
  },

  lifetimes: {
    attached() {
      const cookie = wx.getStorageSync('lib_cookie')
      const {windowHeight: winHeight} = wx.getSystemInfoSync()
      this.setData({
        winHeight,
        cookie,
        showLogin: !cookie
      })
      if (cookie) {
        this.getList()
      }
    }
  },

  data: {
    customBar: app.globalData.customBar,
    tabCur: 'now',
    cookie: '',
    showLogin: false,
    verifyLogin: false, // 是否已验证登录状态
    reNewResult: {},
    showResult: false,
    loading: false,
    loadings: {
      now: false,
      history: false,
      collect: false
    },
    pages: {
      now: 1,
      history: 1,
      collect: 1
    },
    finish: {
      now: false,
      history: false,
      collect: false
    },
    list: {
      now: [],
      history: [],
      collect: []
    },
    bookImgList: {
      now: [],
      history: [],
      collect: []
    },
    rows: 10,
    labels: [{
        name: '当前借阅',
        key: 'now'
      },
      {
        name: '历史借阅',
        key: 'history'
      },
      {
        name: '收藏记录',
        key: 'collect'
      },
    ]
  },

  methods: {
    loginSuccess() {
      this.setData({
        cookie: wx.getStorageSync('lib_cookie'),
        showLogin: false
      })
      this.getList()
    },
    hideLogin() {
      this.setData({
        showLogin: false
      })
    },
    tabSelect(e) {
      const key = e.currentTarget.dataset.key
      this.setData({
        tabCur: key
      })
      if (!this.data.loadings[key]) {
        this.getList()
      }
    },
    reload() {
      const type = this.data.tabCur
      const {
        list,
        pages,
        finish,
        bookImgList
      } = this.data
      list[type] = []
      pages[type] = 1
      finish[type] = false
      bookImgList[type] = []
      this.setData({
        list,
        pages,
        finish
      })
      this.getList()
    },
    getList() {
      const that = this
      const type = that.data.tabCur
      const page = that.data.pages[type]
      const cookie = that.data.cookie
      if (cookie == '') {
        that.setData({
          showLogin: true
        })
        return
      }
      that.setData({
        loading: true
      })
      getMineList({
        cookie,
        type,
        page,
        rows: that.data.rows
      }).then(res => {
        that.setData({
          loading: false
        })
        // 判断登录状态是否过期
        if (res.data.searchResult.length == 0 && page == 1 && !that.data.verifyLogin) {
          checkLogin({
            cookie: that.data.cookie
          }).then(res => {
            if (res.data.status == 0) {
              // 已过期
              wx.setStorageSync('lib_cookie', null)
              app.msg('登录已过期，需要重新登录')
              that.setData({
                showLogin: true
              })
              return
            }
            that.setData({
              verifyLogin: true
            })
          }).catch(err => {
            console.log('验证登录状态失败', err)
          })
        }
        // 获取封面
        if (res.data.searchResult.length > 0) {
          that.getBookImg(res.data.imgData, type)
        }
        const list = that.data.list
        const loadings = that.data.loadings
        loadings[type] = true
        let finish = that.data.finish
        list[type] = [...list[type], ...res.data.searchResult]
        if (res.data.searchResult.length < that.data.rows) {
          finish[type] = true
        }
        that.setData({
          list,
          finish,
          loadings
        })
      })
    },
    // 获取封面
    getBookImg(data, type) {
      const that = this
      getBookImgList({
        info: data
      }).then(res => {
        const bookImgList = that.data.bookImgList
        bookImgList[type] = [...bookImgList[type], ...res.data]
        that.setData({
          bookImgList
        })
      }).catch(err => {
        console.log('获取封面失败', err)
        const bookImgList = that.data.bookImgList
        for (let i = 0; i < that.data.rows; i++) {
          bookImgList[type].push('')
        }
        that.setData({
          bookImgList
        })
      })
    },
    reNewSuccess(e) {
      this.showRenewResult(e.detail.data)
    },
    // 显示续借结果
    showRenewResult(result) {
      if (result.result) {
        const list = {}
        for (let key in result.result) {
          const newKey = key.split(' ')[1] // 去空格
          list[newKey] = result.result[key] == '超过关联规则最大续借次数' ? '不可重复续借' : result.result[key]
        }
        result.result = list
      }
      this.setData({
        showResult: true,
        reNewResult: result
      })
    },
    hideResult() {
      this.setData({
        showResult: false
      })
      if (this.data.reNewResult.success > 0) {
        this.reload()
      }
    },
    // 一键续借
    reNew() {
      const that = this
      const ids = that.data.list.now.map(item => {
        return item.loanId
      })
      reNew({
        cookie: that.data.cookie,
        ids: JSON.stringify(ids)
      }).then(res => {
        that.showRenewResult(res.data)
      }).catch(err => {
        app.smg(err.message || '续借失败，请联系客服')
      })
    },
    loadMore() {
      const {
        tabCur: type,
        pages,
        finish
      } = this.data
      if (finish[type]) {
        return
      }
      pages[type] = pages[type] + 1
      this.setData({
        pages
      })
      this.getList()
    },
    showLogin() {
      this.setData({
        showLogin: true
      })
    }
  }
})