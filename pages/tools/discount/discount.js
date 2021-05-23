const { getDiscountList, getDiscountTypes } = require('../../api/other')
const { openArticle } = require('../../../utils/common')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    labels: [
      {
        id: 0,
        title: '全部'
      }
    ],
    label: 0,
    list: [],
    p: 1,
    loading: true,
    finish: false,
    length: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTypes()
    this.getList()
  },

  onReachBottom: function(){
    if(this.data.finish){
      return
    }
    this.setData({
      p: this.data.p + 1
    })
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "你要找的优惠券，这里都有！"
    }
  },
  //分类
  getTypes: function(){
    const _this = this
    getDiscountTypes().then((res) => {
      let labels = _this.data.labels.concat(res.data.list)
      _this.setData({
        labels
      })
    })
  },
  // 列表
  getList: function(){
    const _this = this
    _this.setData({
      loading: true
    })
    getDiscountList({
      p: _this.data.p,
      label: _this.data.label
    }).then((res) => {
      let list = _this.data.list
      list = list.concat(res.data.list)
      let finish = false
      if(res.data.list.length < _this.data.length){
        finish = true
      }
      _this.setData({
        list,
        loading: false,
        finish
      })
    })
  },
  tabSelect: function(e){
    this.setData({
      label: e.target.dataset.id,
      p:1,
      list: [],
      finish: false
    })
    this.getList()
  },
  get: function(e){
    const index = e.currentTarget.dataset.index
    const discount = this.data.list[index]
    if(discount.type == 1){
      //推文
      openArticle(discount.url)
    }else if(discount.type == 2){
      //口令
      wx.setClipboardData({
        data: discount.url,
        success: function(){
          if(discount.mark){
            app.msg(discount.mark)
          }
        }
      })
    }else if(discount.type == 3){
      //小程序
    }else if(discount.type == 4){
      //图片
      wx.previewImage({
        urls: [
          discount.url
        ]
      })
    }
  }
})