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
    wx.request({
      url: app.globalData.domain + 'user/getUserConfig',
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
    wx.request({
      url: app.globalData.domain + 'user/alteruserconfig',
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
  },
  //设置消息推送
  setPush:function(e){
    var that = this;
    var set;
    var push_type = e.currentTarget.dataset.type;
    var user_id = wx.getStorageSync('user_id');
    if (e.detail.value) set = '1';
    else set = '0';
    wx.request({
      url: app.globalData.domain + '/wx/setUserPush.php',
      data:{
        user_id:user_id,
        push_type:push_type,
        value:set,
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 1002) {
          wx.showToast({
            title: '设置成功',
            icon: 'success',
          })
        } else {
          wx.showToast({
            title: '设置失败',
            icon: 'loading',
          })
        }
      }
    })
  },
  //设置开始推送时间
  setPushTime:function(e){
    var that =this;
    var setType = e.currentTarget.dataset.type;
    var value = e.detail.value;
    var user_id = wx.getStorageSync('user_id');
    wx.request({
      url: app.globalData.domain + '/wx/setUserPush.php',
      data: {
        user_id: user_id,
        push_type: setType,
        value: e.detail.value,
      },
      success:function(res){
        if(res.data.code == 1002){
          wx.showToast({
            title: '设置成功',
            icon:'success',
          })
          if (setType == 'startTime'){
            that.setData({
              pushStartTime: value,
            })
          }else{
            that.setData({
              pushEndTime: value,
            })
          }
        }else{
          wx.showToast({
            title: '网络异常',
            icon:'loading'
          })
        }
        
      }
    })
  }
})