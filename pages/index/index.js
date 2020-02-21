var app = getApp()
var md5 = require('../../utils/md5.js');
var util = require('../../utils/util.js');
Page({
  data: {
    tools: [
      {
        icon: 'form',
        color: 'blue',
        badge: 0,
        name: '成绩查询',
        icon: 'score',
        needLogin: true,
        url: '../tools/score/score?from=index',
      }, {
        icon: 'rank',
        color: 'green',
        badge: 0,
        name: '绩点分析',
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
        icon: 'search',
        color: 'olive',
        badge: 0,
        name: '空教室',
        icon: 'classroom',
        needLogin: false,
        url: '../tools/emptyroom/emptyroom?from=index',
      }, {
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
      }, {
        icon: 'apps',
        color: 'theme',
        badge: 1,
        needLogin: false,
        tab:true,
        name: '全部应用',
        icon: 'apps',
        url: '../tool/tool?from=index',
      }],
    gridCol: 4,
    news_loading:false,
    course_loading:false,
    message_loading:false,
    message:'暂无公告',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 10001,
    displayExam:false,
    tmpClass:'',
    imgDomain:app.globalData.fileDomain,
    likeSoul:false,
    hideSoul:1,
    soul:'',
    banner:[
      {
        img_src:'/pages/assets/imgs/other/bgImage.jpg',
        display:1,
        type:0
      }
    ],
    statusBar: app.globalData.statusBar,
    customBar: app.globalData.customBar,
  },

  onLoad: function () {
    var that = this
    //that.getBanner();//获取Banner
    var add_tips = wx.getStorageSync('add_my_tips')
    var time = (new Date).getTime()
    if ((time - add_tips) / 1000 >= 7 * 24 * 60 * 60){
      this.setData({
        add_tips: true
      })
    }
  },

  onShow:function(){
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
    if (session != "" && user_id != "" && !hide_soul) {
      app.promiseRequest({
        url: 'user/isHideSoul'
      }).then((data) => {
        that.setData({
          hideSoul: data.data
        })
        wx.setStorageSync('hide_soul', data.data)
      }).catch((message) => {
        app.msg(message)
      })

    } else {
      that.setData({
        hideSoul: hide_soul
      })
    }
    
    // that.getMessage();//获取公告
    that.getNowWeek();//获取第几周
    that.getWeekday();//获取星期几
    that.getCourse(that.data.now_week);//获取课表
    // that.getNewsList();//获取新闻
    that.getMyExam();//获取我的考试

    //判断是否为本班课表
    var tmpClass = wx.getStorageSync('tmp_class')
    this.setData({
      tmpClass: tmpClass
    })
  },

  /** 下拉刷新 */
  onPullDownRefresh:function(){
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      news_list: [],
    });
    wx.removeStorageSync('news');
    //that.getBanner();
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
    return app.share('课表成绩考勤校历都在这里','index.png',this.route)
  },
  /** 打开应用 */
  openTool:function(e){
    var that = this;
    var url = e.currentTarget.dataset.url
    var needLogin = e.currentTarget.dataset.needlogin
    var tab = e.currentTarget.dataset.tab
    if (needLogin && !app.getLoginStatus()) {
      app.msg("请先登录")
      return;
    }
    if (needLogin && !app.getUserId()) {
      app.msg("请先绑定教务系统账号")
      return;
    }
    if(tab === true){
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
    let configs = wx.getStorageSync('configs')
    let termDate = configs.termDate
    let data = termDate.split('-')
    let [year, month, day] = [data[0], data[1], data[2]]  
    var start = new Date(year, month - 1, day);
    //计算时间差
    var left_time = parseInt((date.getTime() - start.getTime()) / 1000);
    var days = parseInt(left_time / 3600 / 24);
    var week = Math.floor(days / 7) + 1;
    week = 8;
    if (week <= 0 || week > 20) {
      var now_week_text = '假期'
    }else {
      var now_week_text = '第' + week + '周';
    }
    that.setData({
      now_week:week,
      now_week_text:now_week_text
    })
  },
  /** 获取课表 */
  getCourse: function (week) {
    var that = this;
    var data = wx.getStorageSync('course');
    //将之前的课表清空
    that.setData({ course: [] });
    if (data.length > 0) {
      var i = 0;
      var courses = new Array();
      for (var a = 0; a < data.length; a++) {
        if (typeof data[a]['course_weekly'] == "undefined" || typeof data[a]['course_danshuang'] == "undefined") {
          continue
        }
        if (that.ana_week(week, data[a]['course_weekly'], data[a]['course_danshuang']) && data[a]['course_week'] == that.data.weekday) {
          var jie = data[a]['course_section'].split("-")[0];
          var jieshu = data[a]['course_section'].split("-")[1] - data[a]['course_section'].split("-")[0] + 1;
          //格式化上课地点
          data[a]['full_address'] = data[a]['course_address']
          data[a]['course_address'] = data[a]['course_address'].replace('-', '_')//把-换成_
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
            jie_end:parseInt(jie) + parseInt(jieshu) -1,
            name: data[a]['course_name'],
            address: address,
            fullAddress:data[a]['full_address'],
            num: data[a]['num'],
            zhoushu: data[a]['course_weekly'],
            teacher: data[a]['course_teacher'],
            credit: data[a]['course_credit'],
            method: data[a]['course_method'],
            category: data[a]['course_category']
          }];
          if (courses.length > 0 && course[0].num == courses[courses.length - 1].num && courses[courses.length - 1].end - course[0].jie_end == 1){
            if (course[0].jie_end > courses[courses.length - 1].jie_end){
              courses[courses.length - 1].jie_end = course[0].jie_end;
            }else{
              courses[courses.length - 1].jie = course[0].jie;
            }
            
          }else{
            courses = courses.concat(course);
          }
        }
      }
      for(var i=0;i<courses.length;i++){
        for(var j=i+1;j<courses.length;j++){
          if (Number(courses[i]['jie']) > Number(courses[j]['jie'])){
            var temp = courses[i];
            courses[i] = courses[j];
            courses[j] = temp;
          }
        }
      }
      that.setData({ 
        course: courses
      });
    } else {
      that.setData({ course: null });
    }
    //获取毒鸡汤
    if (that.data.hideSoul == 0 && (that.data.course == null || that.data.course.length == 0)){
      that.getSoul()
    }
    // that.getTrain(week);
  },
  /** 解析周数 */
  ana_week: function (week, weekly, danshuang) {
    var result = new Array();
    var temp1 = weekly.split(",");
    var temp2 = new Array();
    for (var i = 0; i < temp1.length; i++) {
      temp2[i] = temp1[i].split("-");
    }
    var k = 0;//周数
    if (danshuang == 0) {
      for (var a = 0; a < temp1.length; a++) {
        if (temp2[a].length == 2) {
          for (var start = parseInt(temp2[a][0]); start <= temp2[a][1]; start++) {
            result[k++] = start;
          }
        } else {
          result[k++] = parseInt(temp2[a][0]);
        }
      }
    } else {
      for (var a = 0; a < temp1.length; a++) {
        if (temp2[a].length == 2) {
          for (var start = parseInt(temp2[a][0]); start <= temp2[a][1]; start++) {
            if (danshuang == 1) {
              if (start % 2 != 0) {
                result[k++] = start++;
              }
            } else if (danshuang == 2) {
              if (start % 2 == 0) {
                result[k++] = start++;
              }
            }
          }
        } else {
          result[k++] = parseInt(temp2[a][0]);
        }
      }
    }
    for (var j = 0; j < result.length; j++) {
      if (week == result[j]) {
        return true;
      } else if (j == result.length - 1) {
        return false;
      }
    }
  },
  /** 获取星期几 */
  getWeekday:function(){
    var that = this;
    var weekday = (new Date()).getDay();
    var WEEKDAY;
    switch(weekday){
      case 0: WEEKDAY = '日';break;
      case 1: WEEKDAY = '一';break;
      case 2: WEEKDAY = '二';break;
      case 3: WEEKDAY = '三';break;
      case 4: WEEKDAY = '四';break;
      case 5: WEEKDAY = '五';break;
      case 6: WEEKDAY = '六';break;
    }
    that.setData({
      weekday:weekday,
      WEEKDAY:WEEKDAY,
    })
  },
  /** 跳转登录页面 */
  goLogin:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  },

  goBind:function(){
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
  goMessage:function(){
    wx.navigateTo({
      url: 'message/message',
    })
  },
  /** 显示课表详细内容 */
  displayCourseInfo: function (e) {
    var indexNum = e.currentTarget.dataset.num;
    var data = this.data.course;
    var course = null
    for(let i=0;i<data.length;i++){
      if(data[i].indexNum == indexNum){
        course = data[i]
      }
    }
    if(course == null){
      app.msg("获取信息失败")
      return
    }
    wx.navigateTo({
      url: "/pages/course/info/info?data=" + encodeURIComponent(JSON.stringify(course)),
    })
  },
  /** 获取banner信息 */
  getBanner:function(){
    var that = this;
    app.httpRequest({
      url: 'banner/getListByBid',
      needLogin:false,
      data:{
        bid:1
      },
      success:function(res){
        if(res.data.status == 1001){
          var indicatorDots = true;
          if (res.data.data.data.length<=1){
            indicatorDots = false;
          }
          var banner = res.data.data.data
          for(var i=0;i<banner.length;i++){
            banner[i].img_src = that.data.imgDomain + banner[i].img_src
          }
          that.setData({
            banner:banner,
            indicatorDots: indicatorDots
          })
        }
      }
    })
  },
  /** 点击banner */
  bannerClick:function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var banner_type = that.data.banner[index].type;
    if(banner_type == 1){
      var url = that.data.banner[index].href;
      wx.navigateTo({
        url: url,
      })
    }
  },
  //获取考试列表
  getMyExam: function (e) {
    var that = this;
    var my_exams = wx.getStorageSync("my_exams");
    if(my_exams){
      for(let i =0;i<my_exams.length;i++){
        if(my_exams[i].days >= 0){
          that.setData({
            my_exam: my_exams,
            displayExam: true,
          });
          break;
        }
      }
      return
    }
    that.setData({
      displayExam: false,
    });
  },
  //计算两个日期的天数
  dateDiff: function (date1, date2) {
    var start_date = new Date(date1.replace(/-/g, "/"));
    var end_date = new Date(date2.replace(/-/g, "/"));
    var days = start_date.getTime() - end_date.getTime();
    var day = parseInt(days / (1000 * 60 * 60 * 24));
    return day;
  },
  goExam:function(e){
    wx.navigateTo({
      url: '../tools/exam/exam?currentTab=1',
    })
  },
  close_tips(){
    var time = (new Date).getTime()
    this.setData({
      add_tips:false
    })
    wx.setStorageSync('add_my_tips', time)
  },

  //获取毒鸡汤
  getSoul: function () {
    var list = wx.getStorageSync('souls')
    var soulsUpdate = wx.getStorageSync('soul_update')
    var that = this
    var soul = false
    var time = Math.floor((new Date).getTime() / 1000)
    that.setData({
      likeSoul:false
    })

    if(!list || time > soulsUpdate + 60 * 60){
      app.requestSouls().then((data) => {
        list = data.data
        wx.setStorageSync('souls', list)
        wx.setStorageSync('soul_update', time)
        soul = list[Math.floor(Math.random() * list.length)]
        that.setData({
          soul: soul
        })
      }).catch((message) => {
        console.log('毒鸡汤' + message)
      })
    }else{
      soul = list[Math.floor(Math.random() * list.length)]
      that.setData({
        soul: soul
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
    let stu_id = wx.getStorageSync('user_id')
    app.likeSoul(id,stu_id).then((data) => {
      let soul = that.data.soul
      soul.like_count = soul.like_count + 1;
      that.setData({
        likeSoul: true,
        soul: soul
      })
    }).catch((message) => {
      app.msg(res.data.message)
    })
  },

  goSoul:function(){
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
        })
        app.promiseRequest({
          url: 'course/getList'
        }).then((data) => {
          wx.hideLoading()
          app.msg('切换成功', 'success')
          _this.setData({
            tmpClass:''
          })
          wx.removeStorageSync('tmp_class')
          wx.setStorageSync('course', data.data.course);
          wx.setStorageSync('train', data.data.train_course);
        }).catch((error) => {
          app.msg(error.message)
        })
      }
    })
  }
})
