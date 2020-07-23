var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gridCol: 5,
    study: [
      {
        icon: 'form',
        color: 'blue',
        badge: 0,
        name: '成绩查询',
        icon: 'score',
        needLogin:true,
        url: '../tools/score/score?from=index',
      }, {
        icon: 'gpa',
        color: 'green',
        badge: 0,
        name: '绩点排行',
        icon: 'gpa',
        needLogin: true,
        url: '../tools/rank/rank?from=index',
      }, {
        icon: 'rank',
        color: 'green',
        badge: 0,
        name: '学业分析',
        icon: 'ana',
        needLogin: true,
        url: '../tools/score/ana/ana?from=index',
      }, {
        icon: 'list',
        color: 'orange',
        badge: 0,
        name: '考勤记录',
        icon: 'attendance',
        needLogin: true,
        url: '../tools/attendance/attendance?from=index',
      }, {
        icon: 'remind',
        color: 'olive',
        badge: 0,
        name: '考试安排',
        icon: 'exam',
        needLogin: true,
        url: '../tools/exam/exam?from=index',
      }, {
        icon: 'evaluate',
        color: 'red',
        badge: 0,
        name: '一键评教',
        icon: 'assess',
        needLogin: true,
        url: '../tools/assess/assess?from=index',
      }, 
      // {
      //   icon: 'question',
      //   color: 'cyan',
      //   badge: 0,
      //   name: '课本答案',
      //   icon: 'question',
      //   needLogin: false,
      //   appid: "wxea8b994be0abb105",
      //   path: "pages/index/index",
      //   url: "",
      // }, 
      {
        icon: 'evaluate',
        color: 'red',
        badge: '',
        name: '课程管理',
        icon: 'course_list',
        needLogin: true,
        url: '/pages/tools/course/category/category?from=index',
      },
      {
        icon: 'evaluate',
        color: 'red',
        badge: '',
        name: '光速搜题',
        icon: 'question',
        needLogin: true,
        url: '../tools/question/question?from=index',
      },
    ],
    life:[
      {
        icon: 'search',
        color: 'olive',
        badge: 0,
        name: '空教室',
        icon: 'classroom',
        needLogin: false,
        url: '../tools/emptyroom/emptyroom?from=index',
      },
      // {
      //   icon: 'delete',
      //   color: 'yellow',
      //   badge: 0,
      //   name: '垃圾分类',
      //   icon: 'rubbish',
      //   needLogin: false,
      //   appid: "wx4a10dd9594992a0d",
      //   path: "pages/home/home",
      //   url: '../tools/calendar/calendar?from=index',
      // },
      {
        icon: 'countdown',
        color: 'olive',
        badge: 0,
        name: '作息表',
        icon: 'rest',
        needLogin: false,
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100000581&idx=1&sn=6ef90448df9ac2d4930fa3b15aa8399e&chksm=6a35b9415d423057df293f498fe3027b2ede3fe46000e69fc1a713a90eb7f894aabe416d7fa2#rd'),
      },
      {
        icon: 'calendar',
        color: 'cyan',
        badge: 0,
        name: '校历',
        icon: 'calendar',
        needLogin: false,
        url: '../tools/calendar/calendar?from=index',
      }, {
        icon: 'vipcard',
        color: 'purple',
        badge: 0,
        name: '羊城通',
        icon: 'yct',
        needLogin: true,
        url: '../tools/yct/yct?from=index',
      }, 
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '失物招领',
        icon: 'lost',
        needLogin: false,
        url: '/pages/tools/lost/lost',
      },  
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '毒鸡汤',
        icon: 'soul',
        needLogin: false,
        url: '/pages/soul/soul',
      }, {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '水电查询',
        icon: 'quantity',
        needLogin: true,
        url: '/pages/tools/quantity/quantity',
      }, 
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '早起打卡',
        icon: 'clockin',
        needLogin: false,
        url: '/pages/tools/clockin/clockin',
      }, 
      {
        icon: 'time',
        color: 'pink',
        badge: 0,
        name: '拾光',
        icon: 'time',
        needLogin: true,
        url: '../my/time/time?from=index',
      },
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '毕业报告',
        icon: 'summary',
        needLogin: false,
        url: '/pages/tools/summary/summary',
      },  
      {
        icon: 'expressman',
        color: 'mauve',
        badge: 0,
        name: '拿外卖',
        icon: 'paotui',
        needLogin: false,
        url: '../tools/who/who?from=index',
      },
      // {
      //   icon: 'bad',
      //   color: 'red',
      //   badge: '新',
      //   name: '云小圈',
      //   icon: 'quanzi',
      //   needLogin: false,
      //   appid: "wxb036cafe2994d7d0",
      //   path: "/portal/group-profile/group-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&fromScene=bizArticle",
      //   url: '/pages/tools/summary/summary',
      // },
    ],
    query:[
      {
        icon: 'home',
        color: 'theme',
        badge: 0,
        name: '校园导览',
        icon: 'guide',
        needLogin: false,
        url: '../tools/guide/index?from=index',
      },
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '找社团',
        icon: 'club',
        needLogin: false,
        url: '/pages/tools/club/club',
      },  
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '找群聊',
        icon: 'qunliao',
        needLogin: false,
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002002&idx=1&sn=79069994b1793c33e8ce49431c1d0bd6&chksm=6a35b2d65d423bc097f66072ce82aa4aecc9a1b12da127418eb273f43ce16b4b68f8cde2afc4#rd'),
      }, 
      // {
      //   icon: 'bad',
      //   color: 'red',
      //   badge: '',
      //   name: '找同乡',
      //   icon: 'tongxiang',
      //   needLogin: false,
      //   url: '/pages/tools/club/club'
      // }, 
      // {
      //   icon: 'bad',
      //   color: 'red',
      //   badge: '',
      //   name: '找电话',
      //   icon: 'dianhua',
      //   needLogin: false,
      //   url: '/pages/tools/club/club',
      // }, 
    ]
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
    return app.share()
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