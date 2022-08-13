const app = getApp()
import {
  search,
  getBookImgList,
  getDict
} from '../../../api/library'
import {
  debounce
} from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    searchContent: '',
    oldSearchContent: '',
    page: 1,
    rows: 10,
    list: [],
    bookImgList: [],
    filterList: [],
    showFilter: false,
    loading: false,
    finish: false,
    firstSearch: true,
    scrollTop: 0,
    filterStatusList: {
      locationId: true,
      author: false,
      publisher: false,
      subject: false,
      discode1: false
    },
    filterSelectList: {
      locationId: [],
      author: [],
      publisher: [],
      subject: [],
      discode1: []
    },
    filterSelectDisplayList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const from = options.from
    this.getDictList()
    this.getHistory()
    this.setData({
      autoFocus: from === 'library'
    })
  },

  onShow: function () {
    const scrollTop = this.data.scrollTop
    if (scrollTop > 0) {
      setTimeout(() => {
        wx.createSelectorQuery()
          .select('#scrollview')
          .node()
          .exec((res) => {
            const scrollView = res[0].node;
            console.log(scrollView)
            scrollView.scrollTo({
              top: scrollTop,
              duration: 0
            })
          })
      }, 500);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('云小智支持查询图书馆书籍啦！')
  },

  reload() {
    this.setData({
      page: 1,
      list: [],
      bookImgList: [],
      finish: false
    })
    this.search()
  },

  loadMore() {
    if (this.data.finish) {
      return
    }
    this.setData({
      page: this.data.page + 1
    })
    this.search()
  },

  // 获取配置项
  getDictList() {
    const that = this
    const cacheKey = 'library_dict'
    let options = wx.getStorageSync(cacheKey)
    if (options) {
      let dict = {
        locationId: {},
        discode1: {}
      }
      // 获取馆藏地
      for (let item of options['locationId']) {
        dict['locationId'][item['code']] = item
      }
      // 获取学科
      for (let item of options['discode1']) {
        dict['discode1'][item['code']] = item
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

  // 获取筛选条件
  getFileter() {
    const result = {}
    const filterSelectDisplayList = []
    for (let key in this.data.filterSelectList) {
      if (this.data.filterSelectList[key].length > 0) {
        result[key] = JSON.stringify(this.data.filterSelectList[key])
        for (let i = 0; i < this.data.filterSelectList[key].length; i++) {
          let item = this.data.filterSelectList[key][i]
          let obj = {
            index: i,
            type: key,
            name: item
          }
          if (key == 'locationId' || key == 'discode1') {
            obj.name = this.data.dict[key][item].name
          }
          filterSelectDisplayList.push(obj)
        }
      }
    }
    this.setData({
      filterSelectDisplayList
    })
    return result
  },

  // 搜索
  search() {
    const that = this
    if (that.data.searchContent == '') {
      app.msg('请输入搜索内容')
      return
    }
    that.setData({
      loading: true
    })
    let filterList = []
    if (that.data.searchContent == that.data.oldSearchContent) {
      filterList = that.getFileter()
    } else {
      // 保存历史记录
      that.saveHistory(that.data.searchContent)
      that.setData({
        filterSelectDisplayList: []
      })
    }
    search({
      search: that.data.searchContent,
      page: that.data.page,
      rows: that.data.rows,
      ...filterList
    }).then(res => {
      that.getBookImg(res.data.imgData)
      let finish = false
      if (res.data.searchResult.length == 0 || res.data.searchResult.length < that.data.rows) {
        finish = true
      }
      that.setData({
        firstSearch: false,
        loading: false,
        finish,
        list: [...that.data.list, ...res.data.searchResult]
      })
      if (that.data.searchContent != that.data.oldSearchContent) {
        that.reset()
        that.setData({
          oldSearchContent: that.data.searchContent,
          filter: [],
          filterList: res.data.facetResult
        })
      }
    }).catch(err => {
      app.msg(err.message || '搜索失败')
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

  // 显示筛选
  showFilter() {
    if (this.data.filterList.length == 0) {
      app.msg('请先搜索书籍')
      return
    }
    this.setData({
      showFilter: true
    })
  },

  // 隐藏筛选
  hideFilter() {
    this.setData({
      showFilter: false
    })
  },

  // 显示/隐藏筛选条件
  switchFilter(e) {
    const type = e.mark.type
    const filterStatusList = this.data.filterStatusList
    filterStatusList[type] = !filterStatusList[type]
    this.setData({
      filterStatusList
    })
  },

  // 选择/取消筛选条件
  selectFilter(e) {
    const type = e.mark.type
    const val = e.currentTarget.dataset.val
    const filterSelectList = this.data.filterSelectList
    const index = filterSelectList[type].indexOf(val)
    if (index > -1) {
      filterSelectList[type].splice(index, 1)
    } else {
      filterSelectList[type].push(val)
    }
    this.setData({
      filterSelectList
    })
  },

  // 重置
  resetFileter() {
    const that = this
    wx.showModal({
      title: '确认要重置筛选条件吗？',
      success(res) {
        if (res.confirm) {
          that.reset()
          that.hideFilter()
          that.reload()
        }
      }
    })
  },

  confirmFilter() {
    this.hideFilter()
    this.reload()
  },

  reset() {
    this.setData({
      filterSelectDisplayList: [],
      filterSelectList: {
        locationId: [],
        author: [],
        publisher: [],
        subject: [],
        discode1: []
      }
    })
  },

  delFilter(e) {
    const index = e.currentTarget.dataset.index
    const filterSelectDisplayList = this.data.filterSelectDisplayList
    const filterSelectList = this.data.filterSelectList
    const filter = filterSelectDisplayList[index]
    filterSelectList[filter['type']].splice(filter['index'], 1)
    this.setData({
      filterSelectList
    })
    this.reload()
  },

  // 滚动
  pageScroll: debounce(function (e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    })
  }, 100),

  toTop() {
    wx.createSelectorQuery()
      .select('#scrollview')
      .node()
      .exec((res) => {
        const scrollView = res[0].node;
        scrollView.scrollTo({
          top: 0,
          duration: 300
        })
      })
  },

  // 保存历史记录
  saveHistory(content) {
    const cacheKey = 'lib_search_list'
    const list = wx.getStorageSync(cacheKey) || []
    if (list.length > 0 && content == list[0]) {
      return
    }
    const index = list.indexOf(content)
    if (index > -1) {
      list.splice(index, 1)
    }
    list.unshift(content)
    wx.setStorageSync(cacheKey, list)
  },

  // 获取历史记录
  getHistory() {
    const historyList = wx.getStorageSync('lib_search_list') || []
    this.setData({
      historyList
    })
  },

  // 清空历史记录
  clearHistory() {
    this.setData({
      historyList: []
    })
    wx.setStorageSync('lib_search_list', [])
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      firstSearch: true,
      searchContent: '',
      oldSearchContent: '',
      page: 1,
      list: [],
      bookImgList: [],
      finish: false,
      filterList: [],
      filterSelectList: {
        locationId: [],
        author: [],
        publisher: [],
        subject: [],
        discode1: []
      },
      filterSelectDisplayList: []
    })
    this.getHistory()
  },

  searchHistory(e) {
    const index = e.currentTarget.dataset.index
    const content = this.data.historyList[index]
    this.setData({
      firstSearch: false,
      searchContent: content
    })
    this.search()
  }
})