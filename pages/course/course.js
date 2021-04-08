var colors = require('../../utils/colors.js')
const TIMES = require('../../utils/course-time.js')
const courseFn = require('../../utils/course')
const util = require('../../utils/util')
const { checkCourseInWeek,setUpdateTime, canUpdate, getNotice, noticeClickEvent } = require('../../utils/common')
const { updateCourse, getCourseList } = require('../api/course')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    zhou: ['一', '二', '三', '四', '五', '六','日'],
    zhou_num: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周', '第9周', '第10周', '第11周', '第12周', '第13周', '第14周', '第15周', '第16周', '第17周', '第18周', '第19周', '第20周'],
    now_week:1,
    now_day:[1,2,3,4,5,6,7],
    now_month:1,
    course: [],
    train_course_id:0,
    list_is_display:false,
    sheet_visible: false,
    toggleDelay:false,//延迟加载
    ad:{
      display:false,
      week:7,
      jie:1,
      jieshu:2,
      background:"#6ed4e6",
      color:"#fff",
      title:"这是广告位置欢迎投放广告",
      font_size:10,
      type:1,
      url:"",
      content:""
    },
    login:true,
    tmpClass:'',
    display_course_time:0,
    area:0,
    course_time:[],
    startDays:['周日','周一'],
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    onlyThisWeek:true,
    courseGroup:{},
    showMoreCourse:false,
    moreCourseList:[],
    internet_course_time:false,
    fileUrl: app.globalData.fileUrl,
    courseFileUrl: 'https://yunxiaozhi-1251388077.cos.ap-guangzhou.myqcloud.com/course_bg/',
    clickScreenTime:0,
    scrollTop:"",
    courseTerm:null,
    noticeDisplay:false,
    acceptTerms: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.isStop()
    //设置默认参数
    if (wx.getStorageSync('Kopacity') == '') {
      wx.setStorageSync('Kopacity', 90)
    }
    if (wx.getStorageSync('Copacity') == '') {
      wx.setStorageSync('Copacity', 12)
    }
    if (wx.getStorageSync('onlyThisWeek') === ''){
      wx.setStorageSync('onlyThisWeek',true)
    }
    //每周起始日
    var startDay = wx.getStorageSync('start_day') || 1
    var winHeight = wx.getSystemInfoSync().windowHeight;
    that.setData({
      list_is_display: false,
      Kopacity: wx.getStorageSync('Kopacity'),
      Copacity: wx.getStorageSync('Copacity'),
      fontSize: wx.getStorageSync('fontSize'),
      winHeight: winHeight,
      onlyThisWeek: wx.getStorageSync('onlyThisWeek'),
      startDay:startDay,
      colorArrays: colors
    });
    //课表学期
    that.getCourseTerm()
    var week = that.getNowWeek();
    var day = that.getDayOfWeek(week,startDay)
    var zhou_num = that.data.zhou_num;
    var n = zhou_num[week - 1].search(/(本周)/i);
    if (n == -1) {
      zhou_num[week - 1] = zhou_num[week - 1] + "(本周)";
    }

    var month = that.getMonth((week - 1) * 7);

    that.setData({
      now_week: week,
      nowWeek: week,
      zhou_num: zhou_num,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
      now_day: day
    })
    // ad
    var time = (new Date).getTime()
    var score_ad = wx.getStorageSync('score_ad_display');
    if (score_ad == '' || (Math.floor((time - score_ad) / 1000) > app.globalData.adTime * 24 * 60)) {
      if (wx.createInterstitialAd) {
        var interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-fa394b5b086dc048'
        })
        setTimeout(()=>{
          interstitialAd.show()
        },1500)
        wx.setStorageSync('score_ad_display', time)
      } else {
        app.msg("您当前微信版本较低，建议升级到最新版本")
      }
    }
    //获取公告
    that.getCourseNotice()
  },

  onShow:function(){
    let _this = this
    var tmpClass = wx.getStorageSync('tmp_class');//临时设置班级
    //课表学期
    _this.getCourseTerm()
    var week = _this.getNowWeek();
    var startDay = wx.getStorageSync('start_day')
    var day = _this.getDayOfWeek(week,startDay)
    var month = _this.getMonth((week - 1) * 7);
    //获取当前日期
    let {todayMonth, todayDay} =  _this.getTodayDate()
    //获取课表
    _this.getCourse(_this.data.now_week, true, false);
    //获取设置，隐藏上课时间
    _this.getConfigData()
    _this.setData({
      now_day: day,
      now_week: week,
      nowWeek: week,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
      todayMonth,
      todayDay,
      imageUrl: wx.getStorageSync('bg_img'),
      list_is_display: false,
      tmpClass: tmpClass,
      showMoreCourse:false
    })
    //判断背景图片是否存在
    let bg_img = wx.getStorageSync('bg_img')
    if (bg_img){
      let bg_imgs = wx.getStorageSync('bg_imgs')
      const fs = wx.getFileSystemManager()
      fs.access({
        path: bg_img,
        complete: function (res) {
          if (res.errMsg != 'access:ok') {
            //图片被删了，重新下载
            let bg_type = wx.getStorageSync('bg_type')
            let url
            if(!bg_type){
              app.msg("课表背景图片不存在，请重新设置")
              return
            }else if (bg_type == 'diy') {
              url = _this.data.courseFileUrl + wx.getStorageSync('upload_course_bg')
            } else {
              url = _this.data.fileUrl + '/course_bg/' + bg_type + '.jpg'
            }
            if(!url){
              return
            }
            _this.download(url).then((url) => {
              if(bg_type != 'diy'){
                bg_imgs[bg_type] = url
                wx.setStorageSync('bg_imgs', bg_imgs)
              }
              wx.setStorageSync('bg_img', url)
              _this.setData({
                imageUrl: url
              })
            }).catch((error) => {
              app.msg('课表背景文件已被删除，请重新设置')
            })
            return
          }
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('看课表，一个云小智就够了！','course.png',this.route)
  },
  /**
   * 获取第几周后的月份
   */
  getMonth:function(days) {
    let [year,month,day] = this.getTermDate()
    var date = new Date(year,month-1,day);    
    date.setDate(date.getDate() + days);//获取n天后的日期      
    var m = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);        
    return  m;     
  },
    /**
   * 获取第几周后的星期几的日期
   */
  getDay: function (days) {
    let [year, month, day] = this.getTermDate()
    var date = new Date(year, month-1, day);
    date.setDate(date.getDate() + days);//获取n天后的日期      
    var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//获取当前几号，不足10补0    
    return d;
  },
  /**
   * 获取当前周
   */
  getNowWeek:function(){
    var date = new Date();
    let [year, month, day] = this.getTermDate()

    //这里减1，不知道为什么输出的月份比原来的大1..
    var start = new Date(year, month-1, day);
    //计算时间差
    var left_time = parseInt((date.getTime()-start.getTime())/1000);
    //如果从周日算起，需要+1天
    if (this.data.startDay == 0){
      left_time += 24 * 60 * 60
    }

    var days = parseInt(left_time/3600/24);
    var week = Math.floor(days / 7) + 1;
    var result = week
    if(week>20 || week <= 0){
      result = 1;
    }
    return result
  },
  /**
   * 获取课表
   */
  getCourse:function(week,first,animation){
    var that = this;
    if(first === false && week == that.data.now_week) return
    var data = wx.getStorageSync('course');
    //将之前的课表清空
    if (typeof animation != "undefined" && animation){
      that.toggleDelay()
    }
    let courses = [],courseGroup = {}
    if (data.length > 0) {
      var i = 0;
      for(var a=0;a<data.length;a++){
        if (typeof data[a].course_weekly == "undefined") {
          continue
        }
        var tmp = data[a]['course_section'].split("-")
        var jie = tmp[0];
        if (tmp.length == 1) {
          var jieshu = 1
        } else {
          var jieshu = tmp[1] - tmp[0] + 1;
        }
        //格式化上课地点
        data[a]['full_address'] = data[a]['course_address']
        data[a]['course_address'] = util.formatAddress(data[a]['course_address'])
        //将课程通过周次节次分组
        let key = data[a]['course_week'] + '-' + jie
        if(courseGroup[key]){
          courseGroup[key].push(i)
        }else{
          courseGroup[key] = [i]
        }
        
        if(jieshu == 4){
          key = data[a]['course_week'] + '-' + (Number(jie)+2)
          if (courseGroup[key]) {
            courseGroup[key].push(i)
          } else {
            courseGroup[key] = [i]
          }
        }

        let display = false,thisWeek = false //是否是当周课表
        if (checkCourseInWeek(week, data[a])) {
          thisWeek = true
        }
        if(thisWeek || !that.data.onlyThisWeek){
          display = true
        }
        var course = {
          indexNum: i++,
          week: data[a]['course_week'],
          jie: jie,
          jieshu: jieshu,
          name: that.fiterCourseTitle(data[a]['course_name'], jieshu),
          fullName: data[a]['course_name'],
          address:  data[a]['course_address'],
          fullAddress: data[a]['full_address'],
          num: data[a]['num'],
          zhoushu: data[a]['course_weekly'],
          teacher: data[a]['course_teacher'],
          credit: data[a]['course_credit'],
          method: data[a]['course_method'],
          category: data[a]['course_category'],
          type: data[a]['course_type'] ? data[a]['course_type'] : 1,
          id: data[a]['course_id'] ? data[a]['course_id'] : 0,
          danshuang:data[a]['course_danshuang'],
          thisWeek:thisWeek,
          display: display,
          courseNum: 1
        };

        courses.push(course)
      }

      //隐藏存在冲突的课程
      for (let g in courseGroup) {
        if(courseGroup[g].length > 1){
          let hasThisWeek = false
          var index = 0
          for (let i in courseGroup[g]){
            index = courseGroup[g][i]
            if (hasThisWeek === false && courses[index].thisWeek){
              courses[index].display = true
              hasThisWeek = index
            }else{
              courses[index].display = false
            }
          }
          if (hasThisWeek === false && !that.data.onlyThisWeek){
            courses[index].display = true
            hasThisWeek = index
          }
          if(hasThisWeek !== false){
            courses[hasThisWeek].courseNum = courseGroup[g].length
          }
        }
      }
    }

    that.setData({
      course: courses,
      courseGroup: courseGroup
    })

    that.getTrain(week)
  },
  selectWeek:function(week){
    this.getCourse(week,false,true);
    this.getTrain(week);
    var month = this.getMonth((week - 1) * 7);
    this.setData({
      now_week: week,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
    });
    var startDay = wx.getStorageSync('start_day')
    var day = this.getDayOfWeek(week,startDay)
    this.setData({
      now_day: day,
    })
  },
  /**
   * 选择周数
   */
  select:function(e){
    var week = parseInt(e.detail.value)+1;
    this.selectWeek(week)
  },
  /**
   * 显示课表详细内容
   */
  displayCourseInfo:function(e){
    var indexNum = e.currentTarget.dataset.num;
    var display = e.currentTarget.dataset.display;
    var data = this.data.course[indexNum];
    //如果有多个课程则展开
    if (!display && data.courseNum > 1){
      //获取同时间的课程
      let ids = [],courses = []
      let key = data.week + '-' + data.jie
      ids = ids.concat(this.data.courseGroup[key])
      if(data.jieshu == 4){
        key = data.week + '-' + (Number(data.jie) + 2)
        for (let i in this.data.courseGroup[key]){
          let val = this.data.courseGroup[key][i]
          if(ids.indexOf(val) == -1){
            ids.push(val)
          }
        }
      }
      for(let i = 0;i<ids.length;i++){
        let index = ids[i]
        courses.push(this.data.course[index])
      }
      this.setData({
        showMoreCourse:true,
        moreCourseList:courses
      })
      return
    }
    wx.navigateTo({
      url: "info/info?internet_course_time=" + this.data.internet_course_time + "&data=" + encodeURIComponent(JSON.stringify(data)),
    })
    this.setData({
      showMoreCourse: false
    })
  },
  /**
   * 解析周数，将弃用
   */
  ana_week:function(week,weekly,danshuang){
    var result = new Array();
    var temp1 = weekly.split(",");
    var temp2 = new Array();
    for(var i=0;i<temp1.length;i++){
      temp2[i] = temp1[i].split("-");
    }
    var k = 0;//周数
    if(danshuang == 0){
      for(var a =0;a<temp1.length;a++){
        if(temp2[a].length ==2){
          for (var start = parseInt(temp2[a][0]);start<=temp2[a][1];start++){
            result[k++] = start;
          }
        }else{
          result[k++] = parseInt(temp2[a][0]);
        }
      }
    }else{
      for (var a = 0; a < temp1.length; a++) {
        if (temp2[a].length == 2) {
          for (var start = parseInt(temp2[a][0]); start <= temp2[a][1]; start++) {
            if(danshuang == 1){
              if (start % 2 != 0) {
                result[k++] = start++;
              }
            }else if(danshuang == 2){
              if (start % 2 == 0) {
                result[k++] = start++;
              }
            }
          }
        } else {
          let weekNum = parseInt(temp2[a][0])
          if((danshuang == 1 && weekNum % 2 == 1) || (danshuang == 2 && weekNum % 2 == 0)){
            result[k++] = weekNum;
          }
        }
      }
    }
    for(var j=0;j<result.length;j++){
      if(week == result[j]){
        return true;
      }else if(j==result.length-1){
        return false;
      }
    }
    return false
  },
  /**
   * 是否为实训周
   */
  getTrain:function(week){
    var train = wx.getStorageSync('train');
    var result = new Array();
    var a = 0;
    for (var i = 0; i < train.length; i++) {
      var train_week = train[i]['train_weekly'].split("-");
      if (train_week.length == 2) {
        for (var j = parseInt(train_week[0]); j <= parseInt(train_week[1]); j++) {
          result[a++] = j;
        }
      } else {
        result[a++] = parseInt(train_week[0]);
      }
      //判断
      for (var j = 0; j < result.length; j++) {
        if (week == result[j]) {
          this.setData({
            train_course_id:train[i]['course_id'],
          });
          return;
        }else if(i == train.length-1 && j == result.length-1){
          this.setData({
            train_course_id: 0,
          })
        }
      }
       var result = [];
       a = 0;
    }
  },
  /**
   * 实训周详情
   */
  train:function(e){
    var id = e.currentTarget.dataset.id;
    var train = wx.getStorageSync('train');
    for(var i=0;i<train.length;i++){
      if(id == train[i]['course_id']){
        var zhoushu = train[i]['train_weekly'];
        var name = train[i]['train_name'];
        var credit = train[i]['train_credit'];
        var train_class = train[i]['train_class'];
        var teacher = train[i]['train_teacher'];
        wx.showModal({
          title: name,
          showCancel: false,
          content: '周数：' + zhoushu + '\n\n老师：' + teacher + '\n\n类型：' + train_class + '\n\n学分：' + credit,
        })
      }
    }

  },

  //获取课表
  getCourseListRequest(){
    let that = this
    getCourseList().then((res) => {
      if(res.status == 0){
        wx.setStorageSync('course', res.data.data.course);
        wx.setStorageSync('train', res.data.data.train_course);
        that.onShow()
      }
    })
  },

  //更新课表
  updateCourseRequest(){
    let that = this
    updateCourse().then((res) => {
      if (res.status == 0) {
        that.getCourseListRequest()
        setUpdateTime('course')
        //切换为当前学期
        courseFn.setCourseToNowTerm()
        app.msg("更新成功", 'success')
        return
      }
      if(res.status == 1005){
        //再获取一遍
        that.updateCourseRequest()
      }else{
        app.msg(res.message)
      }
    })
  },

  /**
   * 对话框确认按钮点击事件
   */
  update: function (e) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      app.msg("请先登录")
      return
    }
    if(!that.data.acceptTerms){
      app.msg("请先接受使用条款")
      return
    }
    that.setData({
      list_is_display: false
    })
    const canUpdateResult = canUpdate('course')
    if(canUpdateResult !== true){
      app.msg(canUpdateResult)
      return
    }
    that.setData({
      updatingCourse: false
    })
    wx.showLoading({
      title: '更新中',
      mask: true
    })
    wx.removeStorageSync('tmp_class')
    that.updateCourseRequest()
  },
  
  //是否显示列表
  listDisplay:function(){
    var list = this.data.list_is_display;
    if(list == 0){
      this.setData({
        list_is_display:true,
      });
    }else if(list == 1){
      this.setData({
        list_is_display: false,
      })
    }
  },
  //设置透明度
  sliderchange: function (e) {
    var type = e.currentTarget.dataset.type;
    var data = e.detail.value;
    switch(type){
      case "frime": this.setData({ Kopacity: data }); wx.setStorageSync('Kopacity', data);break;
      case "course": this.setData({ Copacity: data }); wx.setStorageSync('Copacity', data);break;
      case "font": this.setData({ fontSize: data }); wx.setStorageSync('fontSize', data);break;
    };
  },
  //获取当天日期，课表显示高亮
  getTodayDate:function(){
    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();
    return {
      todayMonth:month+1,
      todayDay:day
    }
  },

  getCourseNotice:function(){
    let notice = getNotice('course')
    let noticeDisplay = true
    if(!notice){
      noticeDisplay = false
    }else{
      let notice_time_course = wx.getStorageSync('notice_time_course')
      if(notice_time_course >= notice.add_time || notice.display == 0){
        noticeDisplay = false
      }
    }
    this.setData({
      noticeDisplay: noticeDisplay,
      notice: notice
    })
  },

  closeNotice:function(){
    let now = parseInt(new Date().getTime() / 1000)
    wx.setStorageSync('notice_time_course', now)
    this.setData({
      noticeDisplay: false
    })
  },

  clickNotice:function(){
    noticeClickEvent(this.data.notice)
  },

  hideMask:function(){
    this.setData({
      list_is_display: false
    })
  },

  getCourseList(){
    var user_id = wx.getStorageSync('user_id')
    app.httpRequest({
      url: 'course/getList',
      data: {
        stu_id: user_id,
      },
      success: function (res) {
        if (res.data.status == 1001) {
          wx.setStorageSync('course', res.data.data.course);
        } else {
          app.msg(res.data.message)
        }
      },
    })
  },

  closeAd:function(){
    var ad = this.data.ad
    ad.display = false
    this.setData({
      ad:ad
    })
    //记录时间，24小时内不再显示广告
    wx.setStorageSync('close_ad_time', (new Date()).getTime())
  },
  goAd:function(){
    var ad = this.data.ad
    var self = this
    ad.url = encodeURIComponent(ad.url)
    wx.navigateTo({
      url: '/pages/ad/ad?ad=' + JSON.stringify(this.data.ad),
      success:function(){
        ad.url = decodeURIComponent(ad.url)
        self.setData({
          ad: ad
        })
      }
    })
  },
  getAd:function(){
    var self = this
    var time = (new Date()).getTime()
    var close_ad_time = wx.getStorageSync('close_ad_time')
    var user_id = wx.getStorageSync('user_id')
    if (close_ad_time == '' || Math.floor((time - close_ad_time) / 1000) > 24 * 60 *60){
      wx.removeStorageSync('close_ad_time')
      app.httpRequest({
        url: "ad/getAd",
        needLogin: false,
        data:{
          user_id:user_id
        },
        success: function (res) {
          if (res.data.status == 0) {
            self.setData({
              ad: res.data.data
            })
          }
        }
      })
    }
  },
  toggleDelay() {
    var that = this;
    that.setData({
      toggleDelay: true
    })
    setTimeout(function () {
      that.setData({
        toggleDelay: false
      })
    }, 1000)
  },

  //处理中文标点符号，课程名称过长
  fiterCourseTitle:function(title,jieshu){
    title = title.replace(/\uff08/,'(')
    title = title.replace(/\uff09/,')')
    var length = 10
    if(title.length > length && jieshu < 4){
      return title.substr(0,length) + '...'
    }else{
      return title
    }
  },
  
  getConfigData:function(){
    if (!app.getUserId()){
      return
    }
    var that = this
    var display_course_time = wx.getStorageSync('display_course_time')
    var area = wx.getStorageSync('user_area')
    if (display_course_time === '' || area === ''){
      app.httpRequest({
        url: 'user/getareainfo',
        success: function (res) {
          if (res.data.status != 0) {
            app.msg(res.data.message)
            return
          }
          that.setData({
            area:res.data.data.area,
            display_course_time: res.data.data.display,
            internet_course_time: res.data.data.internet_course_time //上网课时间
          })
          wx.setStorageSync('display_course_time',res.data.data.display)
          wx.setStorageSync('user_area',res.data.data.area)
          that.displayTime()
        }
      })
    }else{
      that.setData({
        display_course_time: display_course_time,
        area: area,
        internet_course_time: 0
      })
      that.displayTime()
    }
  },

  //显示上课时间
  displayTime:function(){
    if(this.data.display_course_time == 0){
      return
    }
    let times = util.deepCopyArray(TIMES)

    if(this.data.area == '' || this.data.area == 0){
      app.msg("您未设置校区，无法显示上课时间")
      return
    }
    //先判断今天是否有课，没课显示默认的
    var week = (new Date()).getDay()
    if(week == 0 || week == 6){
      this.setData({
        course_time : times[this.data.area - 1]
      })
      return
    }

    var courses = wx.getStorageSync('course');
    for(var i=0;i<courses.length;i++){
      if (typeof courses[i].course_weekly == "undefined"){
        continue
      }
      var inWeek = checkCourseInWeek(this.data.now_week, courses[i])
      if (inWeek && courses[i]['course_week'] == week){
        var jie = courses[i]['course_section'].split("-")[0];
        var jieshu = courses[i]['course_section'].split("-")[1] - courses[i]['course_section'].split("-")[0] + 1;
        //格式化上课地点
        courses[i]['course_address'] = courses[i]['course_address'].replace('-', '_')//把-换成_
        var temp = courses[i]['course_address'].split('_');
        var address;
        if (temp.length > 1) {
          address = temp[0] + temp[1];
        } else {
          address = temp[0];
        }
        var course = {
          week: courses[i]['course_week'],
          jie: jie,
          jieshu: jieshu,
          name: courses[i]['course_name'],
          address: address,
          zhoushu: courses[i]['course_weekly'],
        };
        var tmpName = course.address.split("楼")
        if (tmpName.length == 1) {
          continue
        }
        var floor = tmpName[0]
        var floorNum = tmpName[1].substr(0, 1)
        //西校区
        if(this.data.area == 1){
          if(course.jie == 3 && course.jieshu == 2 || course.jie == 1 && course.jieshu == 4){
            //有争议的时间，暂不显示

            // if((floor == '思齐' || floor == '至善' || floor == '信达') && (floorNum >= 2 && floorNum <= 4)){
            //   //3-4节连上
            //   times[0][2][0] = "10:10"
            //   times[0][2][1] = ""
            //   times[0][3][0] = ""
            //   times[0][3][1] = "11:40"
            // }else if (floor == '博雅' || floor == '德艺' || floor == '躬行') {
            //   //3-4节分开上
            //   times[0][2][0] = "10:20"
            //   times[0][2][1] = "11:05"
            //   times[0][3][0] = "11:10"
            //   times[0][3][1] = "11:55"
            // }
          }
        }else if(this.data.area == 2){
          //北校区
          if((course.jie == 3 && course.jieshu == 2 || course.jie == 1 && course.jieshu == 4) && floorNum > 4){
            //楼层>4的情况，三四节分开上
            // times[1][2][0] = "10:20"
            // times[1][2][1] = "11:05"
            // times[1][3][0] = "11:10"
            // times[1][3][1] = "11:55"
          }
        }
        
      }
    }
    this.setData({
      course_time: times[this.data.area - 1]
    })
  },

  //获取一周的日期
  getDayOfWeek:function(week,startDay){
    var day = []
    if(startDay === "0"){
      for (var i = -1; i < 6; i++) {
        var days = (week - 1) * 7 + i;
        day.push(this.getDay(days))
      }
      this.setData({
        zhou:['日','一', '二', '三', '四', '五', '六']
      })
    }else{
      for (var i = 0; i < 7; i++) {
        var days = (week - 1) * 7 + i;
        day.push(this.getDay(days))
      }
      this.setData({
        zhou:['一', '二', '三', '四', '五', '六','日']
      })
    }
    return day
  },

  //设置起始日
  setStartDay:function(e){
    let val = e.detail.value
    this.setData({
      startDay:val
    })
    wx.setStorageSync('start_day',val)
    let week = this.data.now_week
    let day = this.getDayOfWeek(week,val)
    let zhou_num = this.data.zhou_num
    let n = zhou_num[week - 1].search(/(本周)/i);
    if (n == -1) {
      zhou_num[week - 1] = zhou_num[week - 1] + "(本周)";
    }
    let month = this.getMonth((week - 1) * 7);

    this.setData({
      startDay:val,
      now_week: week,
      now_day: day,
      zhou_num: zhou_num,
      list_is_display:0,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
    })
    this.getCourse(week, true, false)
  },

  displayOnlyWeek:function(){
    let result = !this.data.onlyThisWeek
    this.setData({
      onlyThisWeek: result
    })
    wx.setStorageSync('onlyThisWeek',result)
    this.getCourse(this.data.now_week, true, false);
  },
  hideMoreCourse:function(){
    this.setData({
      showMoreCourse:false
    })
  },

  /**
   * 页面跳转
   */

  // 设置背景
  setBg:function(){
    const device = wx.getSystemInfoSync()
    wx.navigateTo({
      url: `/pages/course/setBg/setBg?from=index&height=${device.windowHeight}&width=${device.windowWidth}`,
    })
  },

  // 课程管理
  courseList:function(){
    wx.navigateTo({
      url: '/pages/course/list/list',
    })
  },

  // 登录提示
  loginTips:function(){
    wx.navigateTo({
      url: '/pages/loginTips/loginTips',
    })
  },

  // 分享课表
  shareCourse:function(){
    if(!app.getUserId()){
      app.msg("你还没有登录哦")
      return
    }
    wx.navigateTo({
      url: '/pages/course/share/share?term=' + this.data.courseTerm.term + '&term_name=' + this.data.courseTerm.name,
    })
  },

  // 设置时间
  setTime:function(){
    if (!app.getUserId()) {
      app.msg("你还没有登录哦")
      return
    }
    wx.navigateTo({
      url: '/pages/course/setTime/setTime',
    })
  },

  touchStart: function(e) {
    this.setData({
      "touch.x": e.changedTouches[0].clientX,
      "touch.y": e.changedTouches[0].clientY,
    });
  },
  touchEnd: function(e) {
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    let time = new Date().getTime()
    if(time - this.data.clickScreenTime < 1000){
      app.msg("不要操作那么快啦！")
      return
    }
    this.switchWeek(x,y)
  },
  switchWeek: function(x,y) {
    var direction = util.getTouchData(x,y,this.data.touch.x,this.data.touch.y)
    var week = this.data.now_week
    if(direction == ""){
      return
    }else if(direction == "left"){
      week++
    }else if(direction == "right"){
      week--
    }
    this.setData({
      scrollTop: 0
    })
    if(week < 1){
      app.msg("已经是第一周啦！")
      return
    }else if(week > 20){
      app.msg("已经是最后一周啦！")
      return
    }
    this.setData({
      clickStatus: 'finish',
      finishX: x,
      finishY: y,
      clickScreenTime: (new Date().getTime())
    })
    let _this = this
    setTimeout(function(){
      _this.setData({
        clickStatus: ''
      })
    },500)
    this.selectWeek(week)
  },

  getCourseTerm:function(){
    let nowTerm = courseFn.getNowCourseTerm()
    let thisTerm = app.getConfig('nowTerm.term')
    let userTerm = wx.getStorageSync('course_stu')
    this.setData({
      courseTerm: nowTerm,
      thisTerm: thisTerm,
      userTerm: userTerm
    })
  },
  //获取当前学期开学时间
  getTermDate:function(){
    let date = this.data.courseTerm ? this.data.courseTerm.term_date : this.data.thisTerm.date
    if(!date){
      date = '2020-09-07'
    }
    return date.split('-')
  },
  //下载背景
  download:function(url){
    let _this = this
    let promise = new Promise((resolve,reject) => {
      wx.downloadFile({
        url: url,
        success: function (res) {
          if (res.statusCode === 200) {
            console.log(res.tempFilePath)
            const fs = wx.getFileSystemManager()
            _this.checkMaxSize().then((result) => {
              if(result){
                fs.saveFile({
                  tempFilePath: res.tempFilePath,
                  success(res) {
                    return resolve(res.savedFilePath)
                  },
                  fail(res) {
                    console.log(res)
                    return reject('保存失败，请联系客服解决')
                  }
                })
              }
            })
            
          } else {
            return reject('下载失败')
          }
        }
      })
    })
    return promise
  },
  //判断缓存文件是否>10M，预留4m空间
  checkMaxSize:function(){
    let maxSize = (10-2) * 1024 * 1024 / 2
    let promise = new Promise((resolve) => {
      wx.getSavedFileList({
        success(res) {
          let files = res.fileList
          let total = 0
          for (let i = 0; i < files.length; i++) {
            total = total + files[i].size
          }
          if (total > maxSize) {
            for (let i = 0; i < files.length; i++) {
              wx.removeSavedFile({
                filePath: files[i].filePath
              })
            }
          }
          return resolve(true)
        }
      })
    })
    return promise
  },
  //是否停用
  isStop:function(){
    let setting = app.getConfig('functions.course')
    this.setData({
      courseConfig: setting
    })
  },
  updateCourseModal(){
    if(!app.getUserId()){
      app.msg("请先登录")
      return
    }
    this.setData({
      list_is_display: false,
      updatingCourse: true
    })
  },
  closeUpdateCourseModal(){
    this.setData({
      updatingCourse: false
    })
  },
  acceptTerms:function(e){
    this.setData({
      acceptTerms: true
    })
  }
})