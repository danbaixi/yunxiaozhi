const app = getApp()
import {
  openArticle
} from '../../../utils/common.js'
import WxCountUp from '../../../utils/wxCountUp.js'
const {
  getQuantityDetail,
  getQuantityFromDormitory
} = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dormitory: null,
    loginStatus: false,
    loading: true,
    name: '',
    did: '',
    area_id: '',
    electricity: 0,
    water: 0,
    isFresh: false,
    waterGrade: null,
    electricityGrade: null,
    articleUrl: 'http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100003016&idx=1&sn=5d3dc0dcc63f5691c7bf98ec4146fbf8&chksm=6a35b6cc5d423fdaf32d2718d2df9c0c83ef11e08af49def86ba18300d261d587ce6bfa81a6f#rd'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      loginStatus: app.getLoginStatus()
    })
    that.getData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isFresh) {
      this.getData()
      this.setData({
        isFresh: false
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '点击查询水电费'
    }
  },

  //获取宿舍信息和水电余额
  getData: function () {
    let _this = this
    let context = null
    if (app.getLoginStatus()) {
      context = getQuantityDetail()
    } else {
      // 获取临时宿舍
      const dormitory = wx.getStorageSync('tmp_dormitory')
      if (!dormitory) {
        _this.setData({
          loading: false
        })
        return
      }
      context = getQuantityFromDormitory({
        id: dormitory.id,
        name: dormitory.name
      })
    }
    context.then((res) => {
      _this.setData({
        loading: false
      })
      if (res.status == 0 && res.data != []) {
        let data = res.data
        if (data.water !== false) {
          data.waterGrade = _this.getGrade(data.water)
          _this.startWaterUp(data.water ? data.water : 0)
        }
        if (data.electricity !== false) {
          data.electricityGrade = _this.getGrade(data.electricity)
          _this.startElectricityUp(data.electricity ? data.electricity : 0)
        }
        _this.setData(data)
      }
    })
  },

  setDormitory: function () {
    wx.navigateTo({
      url: `/pages/my/dormitory/dormitory`,
    })
  },

  //获取等级
  getGrade: function (number) {
    if (number <= 0) {
      return null
    } else if (number <= 50) {
      return 'a'
    } else if (number <= 100) {
      return 'b'
    } else if (number <= 300) {
      return 'c'
    } else {
      return 'd'
    }
  },

  //水量滚动
  startWaterUp: function (number) {
    this.countUp = new WxCountUp('water', number, {
      decimalPlaces: 2
    }, this)
    this.countUp.start()
  },

  //电量滚动
  startElectricityUp: function (number) {
    this.countUp = new WxCountUp('electricity', number, {
      decimalPlaces: 2
    }, this)
    this.countUp.start()
  },

  viewArticle: function () {
    openArticle(this.data.articleUrl)
  }
})