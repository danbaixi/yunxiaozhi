import { reNew, cancelCollect, collect } from '../../api/library'

Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    info: Object,
    img: String,
    reNew: {
      type: Boolean,
      value: false
    },
    collect: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 查看详情
    viewDetail() {
      wx.navigateTo({
        url: `/pages/tools/library/detail/index?id=${this.properties.info.recordId}&img=${this.properties.img ? encodeURIComponent(this.properties.img) : ''}`,
      })
    },
    // 续借
    reNew() {
      const that = this
      reNew({
        ids: JSON.stringify([this.properties.info.loanId]),
        cookie: wx.getStorageSync('lib_cookie')
      }).then(res => {
        that.triggerEvent('success',{
          data: res.data
        })
      }).catch(err => {
        wx.showToast({
          title: err.message || '续借失败，请联系小智助手',
        })
      })
    },
    // 取消收藏
    cancelCollect() {
      const that = this
      cancelCollect({
        id: that.properties.info.recordId,
        cookie: wx.getStorageSync('lib_cookie')
      }).then(res => {
        if (res.status == -1) {
          wx.showToast({
            title: err.message || '操作失败，请联系小智助手',
          })
          return
        }
        wx.showToast({
          title: '取消成功',
        })
        that.triggerEvent('cancel')
      })
    }
  }
})