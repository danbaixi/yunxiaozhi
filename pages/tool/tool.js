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
        color: 'blue',
        badge: 0,
        name: '成绩查询',
        icon: 'score',
        needLogin:true,
        url: '../tools/score/score?from=index',
      }, {
        color: 'green',
        badge: 0,
        name: '绩点排行',
        icon: 'gpa',
        needLogin: true,
        url: '../tools/rank/rank?from=index',
      }, {
        color: 'green',
        badge: 0,
        name: '学业分析',
        icon: 'ana',
        needLogin: true,
        url: '../tools/score/ana/ana?from=index',
      }, {
        color: 'green',
        badge: 0,
        name: '已修科目',
        icon: 'score_list',
        needLogin: true,
        url: '/pages/tools/credit/credit',
      }, {
        color: 'green',
        badge: 0,
        name: '挂科率榜',
        icon: 'score_fail',
        needLogin: true,
        url: '/pages/tools/score/fail/fail',
      }, {
        color: 'orange',
        badge: 0,
        name: '考勤记录',
        icon: 'attendance',
        needLogin: true,
        url: '../tools/attendance/attendance?from=index',
      }, {
        color: 'olive',
        badge: 0,
        name: '考试安排',
        icon: 'exam',
        needLogin: true,
        url: '../tools/exam/exam?from=index',
      }, {
        color: 'red',
        badge: 0,
        name: '一键评教',
        icon: 'assess',
        needLogin: true,
        url: '../tools/assess/assess?from=index',
      }, 
      {
        color: 'red',
        badge: '',
        name: '课程管理',
        icon: 'course_list',
        needLogin: true,
        url: '/pages/tools/course/category/category?from=index',
      },
    ],
    life:[
      {
        color: 'olive',
        badge: 0,
        name: '新生必看',
        icon: 'new_student',
        needLogin: false,
        url: '/pages/tools/newstudent/newstudent',
      },
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
        needLogin: true,
        url: '/pages/tools/clockin/clockin',
      }, 
      {
        icon: 'time',
        color: 'pink',
        badge: 0,
        name: '离校倒计时',
        icon: 'time',
        needLogin: true,
        url: '../my/time/time?from=tools',
      },
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '毕业报告',
        icon: 'summary',
        needLogin: true,
        url: '/pages/tools/summary/summary',
      }, 
      {
        color: 'red',
        badge: '',
        name: '523现状',
        icon: '523',
        needLogin: false,
        appid: "wxb036cafe2994d7d0",
        path: "/portal/topic-profile/topic-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&topic_id=14&fromScene=bizArticle",
        url: '/pages/tools/summary/summary',
      },
      {
        color: 'red',
        badge: '',
        name: '闲置转让',
        icon: 'xianzhi',
        needLogin: false,
        appid: "wxb036cafe2994d7d0",
        path: "/portal/topic-profile/topic-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&topic_id=3&fromScene=bizArticle",
        url: '/pages/tools/summary/summary',
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
        name: '电话本',
        icon: 'dianhua',
        needLogin: false,
        url: '/pages/tools/phone/phone',
      },
      {
        color: 'red',
        badge: '新',
        name: '运动排行',
        icon: 'run',
        needLogin: true,
        url: '/pages/tools/sport/sport',
      },
    ],
    query:[
      {
        icon: 'home',
        color: 'theme',
        badge: 0,
        name: '录取查询',
        icon: 'matriculate',
        needLogin: false,
        auditing: true,
        url: '../tools/matriculate/matriculate?from=index',
      },
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
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002002&idx=1&sn=79069994b1793c33e8ce49431c1d0bd6&chksm=6a35b2d65d423bc097f66072ce82aa4aecc9a1b12da127418eb273f43ce16b4b68f8cde2afc4#rd' + "&title=云小智邀请你加入群聊"),
      }, 
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '找同乡',
        icon: 'tongxiang',
        needLogin: false,
        url: '/pages/tools/city/city'
      },   
    ],
    huzhu:[
      {
        color: 'red',
        badge: '',
        name: '云小圈',
        icon: 'quanzi',
        needLogin: false,
        appid: "wxb036cafe2994d7d0",
        path: "/portal/group-profile/group-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&fromScene=bizArticle",
        url: '/pages/tools/summary/summary',
      },
      {
        color: 'red',
        badge: '',
        name: '523现状',
        icon: '523',
        needLogin: false,
        appid: "wxb036cafe2994d7d0",
        path: "/portal/topic-profile/topic-profile?group_id=13104375827371700&invite_ticket=BgAARwqnU-49GW8g92KH3E7WFA&topic_id=14&fromScene=bizArticle",
        url: '/pages/tools/summary/summary',
      },
    ],
    play:[
      {
        icon: 'expressman',
        color: 'mauve',
        badge: 0,
        name: '谁去拿外卖',
        icon: 'paotui',
        needLogin: false,
        url: '../tools/who/who?from=index',
      },
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '毒鸡汤',
        icon: 'soul',
        needLogin: false,
        url: '/pages/soul/soul',
      },
      {
        icon: 'bad',
        color: 'red',
        badge: '',
        name: '舔狗日记',
        icon: 'tiangou',
        needLogin: false,
        url: '/pages/tools/tiangou/tiangou',
      },
      {
        color: 'red',
        badge: '',
        name: '外卖红包',
        icon: 'waimai',
        needLogin: false,
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002861&idx=1&sn=bc55ac93a14feb1025bbe9e93d74d8d5&chksm=6a35b6295d423f3f5ee553af9eed5f63582bf5853db8c8cfa9e17cf9aba27647d745a0c9137c#rd'),
      },
      {
        color: 'red',
        badge: '新',
        name: '出行优惠',
        icon: 'travel',
        needLogin: false,
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100003692&idx=1&sn=c21e5155ab32ea4de14ffe0f8904d743&chksm=6a35b5685d423c7e6c527975257db09bda09f2062d1e9fb1c1b8a875c77f3dc6372397a5cb2a#rd'),
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let auditing = app.getConfig('auditing')
    this.setData({
      auditing: auditing
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },
  /** 打开应用 */
  openTool: function (e) {
    var url = e.currentTarget.dataset.url;
    var user_id = wx.getStorageSync('user_id');
    var appid = e.currentTarget.dataset.appid
    var path = e.currentTarget.dataset.path
    var needLogin = e.currentTarget.dataset.needlogin
    if (user_id == '' && needLogin) {
      app.msg("请先登录")
      return
    }
    if (needLogin && !app.getUserId()) {
      app.msg("请先绑定教务系统账号")
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