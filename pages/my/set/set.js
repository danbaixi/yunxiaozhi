var app = getApp();
var md5 = require('../../../utils/md5.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    display_name:"0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    that.getUserConfig(user_id);
  },
  onShareAppMessage: function () {
    return app.share()
  },
  getUserConfig:function(user_id){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    wx.showLoading({title:"加载中"})
    app.httpRequest({
      url: 'user/getUserConfig',
      data:{
        sign : sign,
        stu_id:user_id,
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.status == 1001){
          if(res.data.data == null){
            that.setData({
              display_name:'0',
            })
          }else{
            that.setData({
              display_name: res.data.data.is_display_name == null ? '0' : res.data.data.is_display_name,
            })
          }
        }
      }
    })
  },
  //设置是否隐藏名字
  is_display_name: function (e) {
    var set = '';
    var user_id = wx.getStorageSync('user_id');
    if (e.detail.value) set = '1';
    else set = '0';
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'user/alteruserconfig',
      data: {
        sign : sign,
        stu_id: user_id,
        field:'is_display_name',
        value:set
      },
      success: function (res) {
        if(res.data.status == 1001){
          app.msg("设置成功","success")
        }else{
          app.msg("设置失败")
        }
      }
    })
  }
})