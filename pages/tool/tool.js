var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    study: [
      {
        name: '学业成绩',
        url: '../tools/score/score',
        icon: '../assets/imgs/apps_icon/query_score.png'
      },
      // {
      //   name: '绩点排名',
      //   url: '../tools/top/top',
      //   icon: '../assets/imgs/apps_icon/top.png'
      // },
      {
        name: '学习报告',
        url: '../tools/score/ana/ana',
        icon: '../assets/imgs/apps_icon/query_report.png'
      },
      {
        name: '考勤记录',
        url: '../tools/attendance/attendance',
        icon: '../assets/imgs/apps_icon/query_attendance.png'
      },
      {
        name: '考试安排',
        url: '../tools/exam/exam',
        icon: '../assets/imgs/apps_icon/apps_exam.png'
      },
      {
        name: '一键评教',
        url: '../tools/assess/assess',
        icon: '../assets/imgs/apps_icon/apps_assess.png'
      },
    ],
    life:[
      {
        name: '羊城通',
        url: '../tools/yct/yct',
        icon: '../assets/imgs/apps_icon/query_yct.png'
      },
      {
        name: '校历',
        url: '../tools/calendar/calendar',
        icon: '../assets/imgs/apps_icon/calender.png'
      },
      {
        name: '党建工作',
        url: '../tools/dangjian/dangjian',
        icon: '../assets/imgs/apps_icon/dangjian.png'
      },
      {
        name: '谁去拿外卖',
        url: '../tools/who/who',
        icon: '../assets/imgs/apps_icon/who.png'
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if(user_id){
      wx.request({
        url: app.globalData.domain + '/wx/isRelogin.php',
        data: {
          user_id: user_id,
        },
        header: { 'content-type': 'application/x-www-form-urlencoded'},
        method: 'POST',
        success: function (res) { 
          if(res.data.code==1001){
            wx.showToast({title: '请重新登录',icon: 'loading',});
            setTimeout(function(){
              wx.navigateTo({
                url: '../bind/bind',
              })
            },1500)
          }
        },
      })
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //收集formId
  collectFormid: function (e) {
    var that = this;
    var url = e.detail.target.dataset.url;
    // var formId = e.detail.formId;
    // var time = util.formatTime3(new Date());
    // var user_id = wx.getStorageSync('user_id');
    // wx.request({
    //   url: app.globalData.domain + '/wx_api/collectFormid.php',
    //   data: {
    //     user_id: user_id,
    //     formId: formId,
    //     time: time
    //   },
    // });
    wx.navigateTo({
      url: url,
    })
  }
})