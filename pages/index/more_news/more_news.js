var app = getApp();
const { $Toast } = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getNewsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /** 获取新闻列表 */
  getNewsList: function () {
    $Toast({content:'加载中',type:'loading',duration:0})
    var that = this;
    var last_date;
    if (that.data.news_last_date) {
      last_date = that.data.news_last_date;
    } else {
      last_date = 0;
    }
    wx.request({
      url: app.globalData.domain + 'news/getlist',
      data: {
        last_date: last_date,
        num: 20,
      },
      success: function (res) {
        $Toast.hide();
        if (res.data.status == 1001 || res.data.status == 1002) {
          that.setData({
            news_list: res.data.data
          })
        } else if (res.data.status == 1004 || res.data.status == 1005) {
          $Toast({ content: "加载失败", type: 'error' })
          wx.navigateBack({
            
          })
        }
      }
    })
  }, 
  /** 打开新闻 */
  display: function (e) {
    var that = this;
    var num = e.currentTarget.dataset.num;
    var title = e.currentTarget.dataset.title;
    var date = e.currentTarget.dataset.date;
    wx.navigateTo({
      url: '../news/news?num=' + num + '&title=' + title + '&date=' + date,
    })
  },
})