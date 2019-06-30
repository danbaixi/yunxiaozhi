var app = getApp()
var md5 = require('../../utils/md5.js');
var util = require('../../utils/util.js');
const { $Toast } = require('../../dist/base/index');
Page({
  data: {
    tools_1: [
      {
        name: '学业成绩',
        url: '../tools/score/score',
        icon: '../assets/imgs/apps_icon/query_score.png'
      },
      {
        name: '学习报告',
        url: '../tools/score/ana/ana',
        icon: '../assets/imgs/apps_icon/query_report.png'
      },
      {
        name: '校园时光',
        url: '../my/time/time',
        icon: '../assets/imgs/apps_icon/time.png'
      },
      {
        name: '考勤记录',
        url: '../tools/attendance/attendance',
        icon: '../assets/imgs/apps_icon/query_attendance.png'
      },
      {
        name: '我的考试',
        url: '../tools/exam/exam',
        icon: '../assets/imgs/apps_icon/apps_exam.png'
      },
      {
        name: '一键评教',
        url: '../tools/assess/assess',
        icon: '../assets/imgs/apps_icon/apps_assess.png'
      },
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
    ],
    tools_2:[
      {
        name: '党建工作',
        url: '../tools/dangjian/dangjian',
        icon: '../assets/imgs/apps_icon/dangjian.png'
      },
      {
        name: '谁去拿外卖',
        url: '../tools/who/who',
        icon: '../assets/imgs/apps_icon/who.png'
      }
    ],
    tab:1,
    news_loading:false,
    course_loading:false,
    message_loading:false,
    message:'暂无公告',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
  },

  onLoad: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })

    })
    if(wx.getStorageSync('showRedDot') != 1){
      wx.showTabBarRedDot({
        index: 2
      })
    }
  },
  onShow:function(){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    that.setData({
      user_id: user_id,
    })
    if (wx.getStorageSync('news')) {
      that.setData({
        news_list: wx.getStorageSync('news')
      })
    }
    that.getBanner();//获取Banner
    // that.getMessage();//获取公告
    that.getNowWeek();//获取第几周
    that.getWeekday();//获取星期几
    that.getCourse(that.data.now_week);//获取课表
    // that.getNewsList();//获取新闻
    that.getMyExam();//获取我的考试
  },

  /** 下拉刷新 */
  onPullDownRefresh:function(){
    var that = this;
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.setData({
      news_list: [],
    });
    wx.removeStorageSync('news');
    that.getBanner();
    that.getMyExam();
    // that.getMessage();
    // that.getNewsList();
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
    var that = this;
    var src = "http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/course_";
    var num = parseInt(Math.random() * 3) + 1;
    var imageUrl = src + num + '.jpg';
    return {
      title: '白云帅哥美女都在用的小程序！',
      path: 'pages/course/course',
      imageUrl: imageUrl,
    }
  },
  /** 打开应用 */
  openTool:function(e){
    var that = this;
    var url = e.currentTarget.dataset.url;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id && url != "../tools/calendar/calendar" && url !="../tools/who/who") {
      $Toast({ content: "请先登录", type: "warning" });
      return;
    }
    wx.navigateTo({
      url: url,
    })
  },
  /** 滑动切换tab */
  bindChange: function (e) {
    var that = this;
    if(that.data.tab == 1){
      var tab = 2;
    }else{
      var tab = 1;
    }
    that.setData({ 
      currentTab: e.detail.current,
      tab:tab,
    });
  }, 
  /** 获取当前周 */
  getNowWeek: function () {
    var that = this;
    var date = new Date();
    var year = app.globalData.start_year;
    var month = app.globalData.start_month;
    var day = app.globalData.start_day;
    //这里减1，不知道为什么输出的月份比原来的大1..
    var start = new Date(year, month - 1, day);
    //计算时间差
    var left_time = parseInt((date.getTime() - start.getTime()) / 1000);
    var days = parseInt(left_time / 3600 / 24);
    var week = Math.floor(days / 7) + 1;
    if (week > 20) {
      var now_week = 20;
    } else {
      var now_week = week;
    }
    that.setData({
      now_week:now_week,
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
        if (that.ana_week(week, data[a]['course_weekly'], data[a]['course_danshuang']) && data[a]['course_week'] == that.data.weekday) {
          var jie = data[a]['course_section'].split("-")[0];
          var jieshu = data[a]['course_section'].split("-")[1] - data[a]['course_section'].split("-")[0] + 1;
          //格式化上课地点
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
        course: courses,
        course_length:courses.length
      });
    } else {
      that.setData({ course: null });
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
    var index;
    for(var i=0;i<data.length;i++){
      if(data[i]['indexNum'] == indexNum){
        index = i;
        break;
      }
    }
    var jieshu = data[index]['jie'] + '-' + (parseInt(data[index]['jie']) + parseInt(data[index]['jieshu']) - 1) + '节';
    var week;
    switch (parseInt(data[index]['week'])) {
      case 1: week = '周一'; break;
      case 2: week = '周二'; break;
      case 3: week = '周三'; break;
      case 4: week = '周四'; break;
      case 5: week = '周五'; break;
    }
    var jieshu = week + ' ' + jieshu;
    wx.navigateTo({
      url: "../course/info/info?name=" + data[index]['name'] + "&zhoushu=" + data[index]['zhoushu'] + "&jieshu=" + jieshu + "&teacher=" + data[index]['teacher'] + "&xuefen=" + data[index]['credit'] + "&category=" + data[index]['category'] + "&method=" + data[index]['method'] + "&address=" + data[index]['address'],
    })
  },
  /** 获取公告 */
  // getMessage:function(){
  //   var that = this;
  //   wx.request({
  //     url: app.globalData.domain + '/wx/getMessage.php',
  //     data:{
  //       message_type:'1'
  //     },
  //     success:function(res){
  //       if(res.data.code == 1001){
  //         that.setData({
  //           message:res.data.data[0].message,
  //         })
  //       }
  //     }
  //   })
  // },
  /** 获取banner信息 */
  getBanner:function(){
    var that = this;
    wx.request({
      url: app.globalData.domain + 'banner/getListByBid',
      data:{
        bid:1
      },
      success:function(res){
        if(res.data.status == 1001){
          var indicatorDots = true;
          if (res.data.data.data.length<=1){
            indicatorDots = false;
          }
          that.setData({
            banner_display:res.data.data.status==1?true:false,
            banner:res.data.data.data,
            indicatorDots: indicatorDots
          })
        }else{
          that.setData({
            banner_display: false,
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
      $Toast.hide();
      that.setData({
        my_exam: my_exams,
        myExamIsNull: false,
      });
    }else{
      that.setData({
        myExamIsNull: true,
      });
    }
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
  }
})
