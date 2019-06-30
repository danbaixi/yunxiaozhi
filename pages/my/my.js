var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
const { $Toast } = require('../../dist/base/index');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_id:"点击登录",
    bind:0,
    userInfo: null,
    user_name:"",
    user_img:"defalut.png",
    img_pre:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/',
    visible:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (wx.getStorageSync('user_id') != ""){
      var start = wx.getStorageSync('user_id').substring(0, 3);
      var end = wx.getStorageSync('user_id').substring(8);
      var user_id = start + "*****" + end + "（点击退出）";
      this.setData({
        bind:1,
        user_id: user_id
      });
      if (wx.getStorageSync('user_name') == ""){
        that.onPullDownRefresh();
      }
    }
  },
  onShow:function(){
    var that = this;
    var isFresh = that.data.isFresh;
    that.onPullDownRefresh();
    if (isFresh) {
      that.onPullDownRefresh();
      that.setData({
        isFresh: false,
      })
    }
  },
  onPullDownRefresh: function () {
    var that = this;
    if (wx.getStorageSync('user_id') != "") {
      var start = wx.getStorageSync('user_id').substring(0, 3);
      var end = wx.getStorageSync('user_id').substring(8);
      var user_id = start + "*****" + end + "（点击退出）";
      that.setData({
        bind: 1,
        user_id: user_id
      });
      //wx.showNavigationBarLoading() //在标题栏中显示加载
      //模拟加载
      that.getUserInfo();
      if (that.data.user_img != "") {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    }else{
      that.pleaseLogin();
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }
    
  },
  /**
   * 解绑帐号
   */
  exit:function(){
    wx.showModal({
      title: '提示',
      content: '确定退出此账号吗？',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.reLaunch({url: '../bind/bind'});
        }
      }
    })
  },
  /**
   * 绑定帐号
   */
  bind:function(){
    wx.navigateTo({url: '../bind/bind',})
  },
  //个人信息页
  toUserInfo:function(){
    var that = this;
    that.getUserInfo();
    var img = that.data.user_img;
    var name = that.data.user_name;
    var xueji = JSON.stringify(that.data.xueji);
    wx.navigateTo({
      url: 'userInfo/userInfo?img='+img+'&name='+name+'&xueji='+xueji,
    })
  },
  //获取用户信息
  getUserInfo:function(){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    wx.request({
      url: app.globalData.domain + 'user/getInfo',
      data: {
        sign: sign,
        stu_id: user_id,
      },
      success: function (res) {
        if (res.data.status == 1001) {
          //处理班级，去掉括号后的
          var stu_class = res.data.data.stu_class.split('（')[0];
          //时间戳转换
          var date = new Date(parseInt(res.data.data.user_regTime) * 1000);
          var regTime = util.formatTime2(date);
          //如果头像为空，设为默认头像
          var user_img = "defalut.png";
          if (res.data.data.user_img != null && res.data.data.user_img != "") {
            user_img = res.data.data.user_img;
          }
          var xueji = [
            { 'title': '姓名', 'data': res.data.data.name },
            { 'title': '年级', 'data': res.data.data.stu_schoolday },
            { 'title': '学号', 'data': user_id },
            { 'title': '学院', 'data': res.data.data.stu_department },
            { 'title': '班级', 'data': stu_class },
            { 'title': '注册时间', 'data': regTime },
          ];
          that.setData({
            user_img: user_img,
            user_name: res.data.data.user_name,
            xueji: xueji
          });
          //存储昵称
          wx.setStorageSync('user_nickName', res.data.data.user_name);
          //存储头像，更改头像可以获取文件名
          wx.setStorageSync('user_headImg', res.data.data.user_img);
        } else {
          $Toast({content:'获取个人信息失败',type:'error'})
        }
      }
    })
  },
  //请先登录
  pleaseLogin:function(){
    $Toast({content:"登录后可查看",type:"warning"});
  },
  //
  toTime:function(){
    wx.navigateTo({
      url: 'time/time',
    })
  },
  toFind:function(){
    wx.navigateTo({
      url: 'pwd/pwd',
    })
  },
  kefu:function(){
    this.setData({
      visible: true
    });
  },
  handleClose:function(){
    this.setData({
      visible: false
    });
  }
})