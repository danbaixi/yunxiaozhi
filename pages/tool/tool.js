var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gridCol: 4,
    study: [
      {
        icon: 'form',
        color: 'blue',
        badge: 0,
        name: '成绩',
        needLogin:true,
        url: '../tools/score/score?from=index',
      }, {
        icon: 'rank',
        color: 'green',
        badge: 0,
        name: '报告',
        needLogin: true,
        url: '../tools/score/ana/ana?from=index',
      }, {
        icon: 'list',
        color: 'orange',
        badge: 0,
        name: '考勤',
        needLogin: true,
        url: '../tools/attendance/attendance?from=index',
      }, {
        icon: 'remind',
        color: 'olive',
        badge: 0,
        name: '考试',
        needLogin: true,
        url: '../tools/exam/exam?from=index',
      }, {
        icon: 'evaluate',
        color: 'red',
        badge: 0,
        name: '评教',
        needLogin: true,
        url: '../tools/assess/assess?from=index',
      }, 
    ],
    life:[
      {
        icon: 'delete',
        color: 'yellow',
        badge: 1,
        name: '垃圾分类',
        needLogin: false,
        appid: "wx4a10dd9594992a0d",
        path: "pages/home/home",
        url: '../tools/calendar/calendar?from=index',
      },
      {
        icon: 'home',
        color: 'theme',
        badge: 1,
        name: '校园导览',
        needLogin: false,
        url: '../tools/guide/index?from=index',
      },
      {
        icon: 'calendar',
        color: 'cyan',
        badge: 0,
        name: '校历',
        needLogin: false,
        url: '../tools/calendar/calendar?from=index',
      }, {
        icon: 'vipcard',
        color: 'purple',
        badge: 0,
        name: '羊城通',
        needLogin: true,
        url: '../tools/yct/yct?from=index',
      }, {
        icon: 'time',
        color: 'pink',
        badge: 0,
        name: '时光',
        needLogin: true,
        url: '../my/time/time?from=index',
      }, {
        icon: 'expressman',
        color: 'mauve',
        badge: 0,
        name: '拿外卖',
        needLogin: false,
        url: '../tools/who/who?from=index',
      }, 
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /** 打开应用 */
  openTool: function (e) {
    var that = this;
    var url = e.currentTarget.dataset.url;
    var user_id = wx.getStorageSync('user_id');
    var appid = e.currentTarget.dataset.appid
    var path = e.currentTarget.dataset.path
    var needLogin = e.currentTarget.dataset.needLogin
    if (!user_id && needLogin) {
      app.msg("请先登录")
      return;
    }
    if(appid){
      wx.navigateToMiniProgram({
        appId:appid,
        path: path
      })
      return
    }
    wx.navigateTo({
      url: url,
    })
  },
})