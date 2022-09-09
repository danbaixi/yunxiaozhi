const app = getApp()
const {
  likeSoul
} = require('../api/soul')
const {
  getExamList,
  getIsHideSoul
} = require('../api/other')
const {
  getCourseList
} = require('../api/course')
const {
  checkCourseInWeek,
  getConfig
} = require('../../utils/common')
const dayjs = require('../../utils/dayjs.min')
Page({
  data: {
    tools: [{
        name: '成绩查询',
        icon: 'score',
        needLogin: true,
        url: '../tools/score/score?from=index',
      }, {
        name: '绩点排行',
        icon: 'gpa',
        needLogin: true,
        url: '/subPages/score-rank/index?from=index',
      }, {
        name: '学业分析',
        icon: 'ana',
        needLogin: true,
        url: '/subPages/score-ana/index?from=index',
      }, {
        name: '考勤记录',
        icon: 'attendance',
        needLogin: true,
        url: '../tools/attendance/attendance?from=index',
      }, {
        name: '空教室',
        icon: 'classroom',
        needLogin: false,
        url: '../tools/emptyroom/emptyroom?from=index',
      }, {
        name: '校历',
        icon: 'calendar',
        needLogin: false,
        url: '../tools/calendar/calendar?from=index',
      }, {
        name: '羊城通',
        icon: 'yct',
        needLogin: true,
        url: '../tools/yct/yct?from=index',
      },
      {
        name: '新生必看',
        icon: 'new_student',
        needLogin: false,
        url: '/pages/tools/newstudent/newstudent',
      },
      {
        name: '早起打卡',
        icon: 'clockin',
        needLogin: true,
        url: '/pages/tools/clockin/clockin',
      },
      {
        name: '小智助手',
        icon: 'zhushou',
        needLogin: false,
        url: '../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=2247488770&idx=1&sn=f7d7747e97ab377bd5f915c506d7a7e7&chksm=ea35af06dd42261028b0b3554e22111d7f8c312e0d7ed34f1679a2b15c2cb287f62287503cb6#rd'),
      },
    ],
    loading: false,
    gridCol: 5,
    news_loading: false,
    course_loading: false,
    message_loading: false,
    message: '暂无公告',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 10001,
    displayExam: false,
    tmpClass: '',
    imgDomain: app.globalData.fileDomain,
    likeSoul: false,
    hideSoul: 1,
    soul: '',
    banner: [{
      img_src: '/pages/assets/imgs/other/bgImage.jpg',
      display: 1,
      type: 0
    }],
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
    bgHeight: 180, //背景高度
    bgFix: false, //是否固定背景
    newVersionTip: false, //新版本提示,
    showNewsList: true,
    showNewStudentTips: false,
    articleBanners: []
  },

  onLoad: function () {
    //新版本更新提示
    let login_session = wx.getStorageSync('login_session')
    let user_id = wx.getStorageSync('user_id')
    if (user_id && !login_session) {
      this.setData({
        newVersionTip: true
      })
    }
    this.newStudentTips()
    if (!wx.getStorageSync('add_my_tips')) {
      this.setData({
        add_tips: true
      })
    }
    this.getMyExam()
    this.setData({
      loading: false
    })
  },

  onShow: function () {
    var that = this;
    let session = app.getLoginStatus()
    let user_id = app.getUserId()
    that.setData({
      session: session,
      user_id: user_id
    })
    if (wx.getStorageSync('news')) {
      that.setData({
        news_list: wx.getStorageSync('news')
      })
    }
    //是否隐藏毒鸡汤
    var hide_soul = wx.getStorageSync('hide_soul')
    if (session != "" && user_id && !hide_soul) {
      getIsHideSoul().then((res) => {
        that.setData({
          hideSoul: res.data
        })
        wx.setStorageSync('hide_soul', res.data)
      })
    } else {
      that.setData({
        hideSoul: hide_soul
      })
    }

    that.getNowWeek(); //获取第几周
    that.getWeekday(); //获取星期几
    that.getCourse(that.data.now_week); //获取课表
    that.getArticleBanner()
    //判断是否为本班课表
    var tmpClass = wx.getStorageSync('tmp_class')
    that.setData({
      tmpClass: tmpClass
    })
  },

  /** 下拉刷新 */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      news_list: [],
    });
    wx.removeStorageSync('news')
    that.getMyExam();
    var user_id = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
    });
    //模拟加载
    setTimeout(function () {
      wx.hideNavigationBarLoading(); //完成停止加载
      wx.stopPullDownRefresh(); //停止下拉刷新
    })
  },
  onShareAppMessage: function () {
    return app.share('课表成绩考勤校历都在这里', 'index.png', this.route)
  },
  /** 打开应用 */
  openTool: function (e) {
    var url = e.currentTarget.dataset.url
    var needLogin = e.currentTarget.dataset.needlogin
    var tab = e.currentTarget.dataset.tab
    var path = e.currentTarget.dataset.path
    var appid = e.currentTarget.dataset.appid
    if (needLogin && !app.getLoginStatus()) {
      app.msg("请先登录")
      return;
    }
    if (needLogin && !app.getUserId()) {
      app.msg("请先绑定教务系统账号")
      return;
    }
    if (appid) {
      wx.navigateToMiniProgram({
        appId: appid,
        path: path
      })
      return
    }
    if (tab === true) {
      wx.switchTab({
        url: url,
      })
      return
    }
    wx.navigateTo({
      url: url,
    })
  },

  /** 获取当前周 */
  getNowWeek: function () {
    var that = this;
    var date = new Date();
    let termDate = app.getConfig('nowTerm.date')
    if (termDate === false) {
      termDate = '2020-03-02' // 配置过渡
      that.setData({
        now_week: 1,
        now_week_text: '第1周'
      })
      return
    }
    let data = termDate.split('-')
    let [year, month, day] = [data[0], data[1], data[2]]
    var start = new Date(year, month - 1, day);
    //计算时间差
    var left_time = parseInt((date.getTime() - start.getTime()) / 1000);
    var days = parseInt(left_time / 3600 / 24);
    var week = Math.floor(days / 7) + 1;

    if (week <= 0 || week > 20) {
      var now_week_text = '假期'
    } else {
      var now_week_text = '第' + week + '周';
    }
    that.setData({
      now_week: week,
      now_week_text: now_week_text
    })
  },

  /** 获取课表 */
  getCourse: function (week) {
    var that = this;
    var data = wx.getStorageSync('course');
    //将之前的课表清空
    var courses = [];
    if (data.length > 0) {
      var i = 0;
      for (var a = 0; a < data.length; a++) {
        if (typeof data[a]['course_weekly'] == "undefined" || typeof data[a]['course_danshuang'] == "undefined") {
          continue
        }
        if (checkCourseInWeek(week, data[a]) && data[a]['course_week'] == that.data.weekday) {
          var jie = data[a]['course_section'].split("-")[0];
          var jieshu = data[a]['course_section'].split("-")[1] - data[a]['course_section'].split("-")[0] + 1;
          //格式化上课地点
          data[a]['full_address'] = data[a]['course_address']
          data[a]['course_address'] = data[a]['course_address'].replace('-', '_') //把-换成_
          var temp = data[a]['course_address'].split('_');
          var address;
          if (temp.length > 1) {
            address = temp[0] + temp[1];
          } else {
            address = temp[0];
          }
          var course = [{
            indexNum: i++,
            week: data[a]['course_week'],
            jie: jie,
            jieshu: jieshu,
            jie_end: parseInt(jie) + parseInt(jieshu) - 1,
            name: data[a]['course_name'],
            address: address,
            fullAddress: data[a]['full_address'],
            num: data[a]['num'],
            zhoushu: data[a]['course_weekly'],
            teacher: data[a]['course_teacher'],
            credit: data[a]['course_credit'],
            method: data[a]['course_method'],
            category: data[a]['course_category']
          }];
          if (courses.length > 0 && course[0].num == courses[courses.length - 1].num && courses[courses.length - 1].end - course[0].jie_end == 1) {
            if (course[0].jie_end > courses[courses.length - 1].jie_end) {
              courses[courses.length - 1].jie_end = course[0].jie_end;
            } else {
              courses[courses.length - 1].jie = course[0].jie;
            }

          } else {
            courses = courses.concat(course);
          }
        }
      }
      for (var i = 0; i < courses.length; i++) {
        for (var j = i + 1; j < courses.length; j++) {
          if (Number(courses[i]['jie']) > Number(courses[j]['jie'])) {
            var temp = courses[i];
            courses[i] = courses[j];
            courses[j] = temp;
          }
        }
      }

    }
    that.setData({
      course: courses
    });

    //获取毒鸡汤
    if (that.data.hideSoul == 0 && (that.data.course == null || that.data.course.length == 0)) {
      that.getSoul()
    }
    // that.getTrain(week);
  },

  /** 获取星期几 */
  getWeekday: function () {
    var that = this;
    var weekday = (new Date()).getDay();
    var WEEKDAY;
    switch (weekday) {
      case 0:
        WEEKDAY = '日';
        break;
      case 1:
        WEEKDAY = '一';
        break;
      case 2:
        WEEKDAY = '二';
        break;
      case 3:
        WEEKDAY = '三';
        break;
      case 4:
        WEEKDAY = '四';
        break;
      case 5:
        WEEKDAY = '五';
        break;
      case 6:
        WEEKDAY = '六';
        break;
    }
    that.setData({
      weekday: weekday,
      WEEKDAY: WEEKDAY,
    })
  },

  /** 跳转登录页面 */
  goLogin: function () {
    wx.navigateTo({
      url: '../login/login?redirect=' + this.route,
    })
    this.hideVersionTips()
  },

  goBind: function () {
    wx.navigateTo({
      url: '../bind/bind',
    })
  },

  /** 跳转课表页面 */
  goCourse: function () {
    wx.switchTab({
      url: '../course/course',
    })
  },

  /** 跳转课表页面 */
  goMoreNews: function () {
    wx.navigateTo({
      url: 'more_news/more_news',
    })
  },

  /** 跳转公告页面 */
  goMessage: function () {
    wx.navigateTo({
      url: 'message/message',
    })
  },

  /** 显示课表详细内容 */
  displayCourseInfo: function (e) {
    var indexNum = e.currentTarget.dataset.num;
    var data = this.data.course;
    var course = null
    for (let i = 0; i < data.length; i++) {
      if (data[i].indexNum == indexNum) {
        course = data[i]
      }
    }
    if (course == null) {
      app.msg("获取信息失败")
      return
    }
    wx.navigateTo({
      url: "/pages/course/info/info?data=" + encodeURIComponent(JSON.stringify(course)),
    })
  },

  //获取考试列表
  getMyExam: function () {
    if (!app.getUserId()) {
      this.setData({
        my_exams: [],
        displayExam: false
      })
      return
    }
    const that = this
    let displayExam = false
    let now = dayjs()
    getExamList().then((res) => {
      let data = res.data
      for (let i = 0; i < data.length; i++) {
        let days = dayjs(data[i].exam_date).diff(now, 'day')
        data[i].days = days
        if (days > 0) {
          displayExam = true
        }
      }
      that.setData({
        my_exams: data,
        displayExam: displayExam
      });
    })
  },

  goExam: function (e) {
    wx.navigateTo({
      url: '../tools/exam/exam?currentTab=1',
    })
  },

  closeAddTip() {
    var time = (new Date).getTime()
    this.setData({
      add_tips: false
    })
    wx.setStorageSync('add_my_tips', time)
  },

  //获取毒鸡汤
  getSoul: function () {
    const list = wx.getStorageSync('souls')
    if (list) {
      let soul = list[Math.floor(Math.random() * list.length)]
      this.setData({
        soul: soul,
        likeSoul: false
      })
    }
  },

  likeSoul: function (e) {
    let that = this
    if (this.data.likeSoul) {
      app.msg("你已经点过赞啦")
      return
    }
    let id = e.currentTarget.dataset.id
    let stu_id = app.getUserId()
    if (!stu_id) {
      app.msg("登录才能点赞")
      return
    }
    likeSoul({
      id,
      stu_id
    }).then((data) => {
      let soul = that.data.soul
      soul.like_count = soul.like_count + 1;
      that.setData({
        likeSoul: true,
        soul: soul
      })
    }).catch((message) => {
      app.msg(message)
    })
  },

  goSoul: function () {
    wx.navigateTo({
      url: '/pages/soul/soul',
    })
  },

  //切换课表为本班
  restore: function () {
    let _this = this
    app.isBind().then((resolve) => {
      if (resolve) {
        wx.showLoading({
          title: '正在切换',
          mask: true
        })
        getCourseList().then((res) => {
          wx.hideLoading()
          app.msg('切换成功', 'success')
          _this.setData({
            tmpClass: ''
          })
          wx.removeStorageSync('tmp_class')
          wx.setStorageSync('course', res.data.course)
          wx.setStorageSync('refresh_course', true)
          wx.setStorageSync('train', res.data.train_course)
          _this.getCourse(_this.data.now_week); //获取课
        })
      }
    })
  },

  hideVersionTips: function () {
    this.setData({
      newVersionTip: false
    })
  },

  //获取文章轮播
  getArticleBanner: function () {
    if (this.data.articleBanners.length > 0) {
      return
    }
    let banners = getConfig('banners')
    if (!banners) {
      return
    }
    const audit = getConfig('auditing')
    if (audit == 1) {
      banners = [{
        title: '',
        img: 'https://mmbiz.qpic.cn/mmbiz_jpg/YWKTC18p77JNk4Iyh99tsRmnHLUFunCcic5ZqFABFAtmqfT4DBuAH4sDsbTCugj9o8JJsRoBfbotQLgAllHAfDQ/0?wx_fmt=jpeg',
        src: ''
      }]
    }
    this.setData({
      articleBanners: banners
    })
  },

  //点击轮播的文章
  viewArticle: function (e) {
    if (this.data.articleBanners.length <= 1) {
      return
    }
    let index = e.currentTarget.dataset.index
    let article = this.data.articleBanners[index]
    wx.navigateTo({
      url: '/pages/news/news?src=' + encodeURIComponent(article.src),
    })
  },

  //展示新生专题提示
  newStudentTips: function () {
    let audit = app.getConfig('auditing')
    let user_id = app.getUserId()
    let setting = wx.getStorageSync('hide_new_studnet_tips')
    //不再弹出
    setting = 1
    if (audit == 0 && !user_id && !setting) {
      this.setData({
        showNewStudentTips: true
      })
    }
  },

  hideNewStudentTips: function () {
    this.setData({
      showNewStudentTips: false
    })
  },

  goNewStudent: function () {
    wx.navigateTo({
      url: '/pages/tools/newstudent/newstudent',
    })
  },

  closeNewStudentTips: function () {
    wx.setStorageSync('hide_new_studnet_tips', true)
    app.msg("已设置不再弹出")
  },

  closeNewStudentFloat: function () {
    this.setData({
      hideNewStudentFloat: true
    })
  }
})