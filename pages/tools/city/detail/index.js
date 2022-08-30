const app = getApp()
import {
  getSameCityDetail
} from '../../../api/other'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id || ''
    if (id == '') {
      app.msg('页面不存在')
      return
    }
    this.setData({
      id
    })
    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '白云xxx同乡会信息'
    }
  },

  getData() {
    const that = this
    wx.showLoading({
      title: '加载中',
    })
    getSameCityDetail({
      id: that.data.id
    }).then(res => {
      wx.hideLoading()
      that.setData({
        ...res.data,
        loading: false
      })
    }).catch(err => {
      console.error(err)
      app.msg('获取失败')
    })
  },

  viewQrcode() {
    wx.previewImage({
      urls: [this.data.qrcode],
    })
  },

  viewNotice() {
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=2247488770&idx=1&sn=f7d7747e97ab377bd5f915c506d7a7e7&chksm=ea35af06dd42261028b0b3554e22111d7f8c312e0d7ed34f1679a2b15c2cb287f62287503cb6#rd'),
    })
  }
})