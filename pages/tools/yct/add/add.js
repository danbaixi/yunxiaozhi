var md5 = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
var app = getApp();
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  formSubmit: function (e) {
    var that = this;
    if(e.detail.value['number']==""){
      wx.showToast({title: '卡号不能为空', icon: 'loading',})
    }else if(e.detail.value['remark']==""){
      wx.showToast({ title: '卡号不能为空', icon: 'loading', })
    }else{
      wx.showLoading({title:"加载中"})
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'yct/addlist',
        data: {
          sign: sign,
          stu_id: user_id,
          account: e.detail.value['number'],
          remark: null,
        },
        success: function (res) {
          wx.hideLoading()
          if(res.data.status == 1001){
            app.msg("添加成功","success")
            setTimeout(function(){
              wx.hideToast();
              //返回后刷新
              var pages = getCurrentPages();
              var currPage = pages[pages.length - 1];  //当前页面
              var prevPage = pages[pages.length - 2]; //上一个页面
              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                isFresh: true
              })
              wx.navigateBack({
              })
            },1000)
          }else{
            app.msg("添加失败")
          }
        }
      });
    }
  }
})