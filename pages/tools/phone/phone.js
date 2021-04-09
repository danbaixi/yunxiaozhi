const app = getApp()
const { getPhoneList } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading: true,
    list: [],
    search: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '白云电话本'
    }
  },

  //获取数据
  getList:function(){
    let _this = this
    getPhoneList().then((res) => {
      if(res.status == 0){
        _this.setData({
          list: res.data,
          loading: false
        })
      }
    })
  },

  // 搜索
  search: function (e) {
    let val = e.detail.value
    let list = this.data.list
    let count = 0
    for (let i = 0; i < list.length; i++) {
      if (list[i].title.search(val) != -1 || list[i].phone.search(val) != -1) {
        list[i].isShow = true
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      list: list,
      isNull: count == 0
    })
  },

  call:function(e){
    let phone = e.currentTarget.dataset.phone
    if(phone == ''){
      app.msg("电话号码为空，无法拨打")
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  copy:function(e){
    let phone = e.currentTarget.dataset.phone
    wx.setClipboardData({
      data: phone
    })
  }
})