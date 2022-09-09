var colors = require('../../utils/colors.js')
const TIMES = require('../../utils/course-time.js')
const courseFn = require('../../utils/course')
import course from '../../utils/course'
import {
  deepCopyArray,
  formatAddress
} from '../../utils/util'
const {
  checkCourseInWeek,
  setUpdateTime,
  canUpdate,
  getNotice,
  noticeClickEvent
} = require('../../utils/common')
const {
  updateCourse,
  getCourseList,
  getAreaInfo
} = require('../api/course')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    colorArrays: colors,
    zhou: ['一', '二', '三', '四', '五', '六', '日'],
    weekCount: 20, // 周数量
    showWeekList: false, // 显示周数弹窗
    courseList: [], // 课程列表
    now_week: 1, // 选中周
    now_day: [1, 2, 3, 4, 5, 6, 7],
    now_month: 1,
    train_course_id: 0,
    showSetting: false,
    login: true,
    tmpClass: '',
    display_course_time: 0,
    area: 0,
    course_time: [],
    startDays: ['周日', '周一'],
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    onlyThisWeek: true,
    courseGroup: {},
    showMoreCourse: false,
    moreCourseList: [],
    internet_course_time: false,
    fileUrl: app.globalData.fileUrl,
    courseFileUrl: 'https://yunxiaozhi-1251388077.cos.ap-guangzhou.myqcloud.com/course_bg/',
    clickScreenTime: 0,
    scrollTop: "",
    courseTerm: null,
    noticeDisplay: false,
    acceptTerms: false,
    showUpdate: false, // 显示更新弹窗
    updateCourseStatus: false, // 正在更新课表状态
    updateList: [], // 更新记录
    updateMaxCount: 3, // 最多更新次数
    updateStatus: app.globalData.updateStatus,
    showShare: false, // 分享课表
    firstEntry: true, // 首次进入
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const winHeight = wx.getSystemInfoSync().windowHeight;
    this.setData({
      winHeight: winHeight,
      imageUrl: wx.getStorageSync('bg_img')
    })
    // 加载课表
    this.loadCourse()
    // 功能状态
    this.isStop()
    // 设置默认参数
    this.initCourseConfig()
    //获取公告
    this.getCourseNotice()
    // ad
    this.initAd()
    //获取设置，隐藏上课时间
    this.getConfigData()
    // 判断背景图片是否存在
    this.bgIsExist()
  },

  onShow: function () {
    const refresh = wx.getStorageSync('refresh_course')
    if (refresh && !this.data.firstEntry) {
      this.loadCourse()
      this.setData({
        showSetting: false,
        showMoreCourse: false
      })
      wx.removeStorageSync('refresh_course')
    }
    const refreshBg = wx.getStorageSync('refresh_course_bg')
    if (refreshBg) {
      this.setData({
        showSetting: false,
        imageUrl: wx.getStorageSync('bg_img')
      })
      wx.removeStorageSync('refresh_course_bg')
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.showShare) {
      let className = ''
      if (this.data.tmpClass) {
        className = this.data.tmpClass.name
      } else {
        className = wx.getStorageSync('user_info')['stu_class']
      }
      const path = `/pages/course/share/share?class_name=${className}&term=${this.data.courseTerm.term}&term_name=${this.data.courseTerm.name}&term_date=${this.data.courseTerm.term_date}`
      // console.log(path)
      return {
        title: `点击查看${className}的课表`,
        path,
        imageUrl: 'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77JpsbMIEeKeaD54MUVydoyuJbYJS6fZR2UO7f3lhoibXichN3YLeZYlRaZCfP9FV9OmdnxicVRBQJ5TQ/0?wx_fmt=png'
      }
    }
    return app.share('看课表，一个云小智就够了！', 'course.png', this.route)
  },

  // 初始化默认参数
  initCourseConfig() {
    let Kopacity = wx.getStorageSync('Kopacity')
    let Copacity = wx.getStorageSync('Copacity')
    let onlyThisWeek = wx.getStorageSync('onlyThisWeek')
    if (Kopacity == '') {
      Kopacity = 90
      wx.setStorageSync('Kopacity', Kopacity)
    }
    if (Copacity == '') {
      Copacity = 12
      wx.setStorageSync('Copacity', Copacity)
    }
    if (onlyThisWeek === '') {
      onlyThisWeek = true
      wx.setStorageSync('onlyThisWeek', onlyThisWeek)
    }
    this.setData({
      Kopacity,
      Copacity,
      onlyThisWeek
    })
  },

  initAd() {
    const time = (new Date).getTime()
    const score_ad = wx.getStorageSync('score_ad_display');
    if (score_ad == '' || (Math.floor((time - score_ad) / 1000) > app.globalData.adTime * 24 * 60)) {
      if (wx.createInterstitialAd) {
        var interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-fa394b5b086dc048'
        })
        setTimeout(() => {
          interstitialAd.show()
        }, 1500)
        wx.setStorageSync('score_ad_display', time)
      } else {
        app.msg("您当前微信版本较低，建议升级到最新版本")
      }
    }
  },

  // 加载课表
  async loadCourse() {
    try {
      await this.getCourseTerm()
      const week = this.getNowWeek();
      const startDay = wx.getStorageSync('start_day') || 1
      const day = this.getDayOfWeek(week, startDay)
      const month = this.getMonth((week - 1) * 7);
      //临时设置班级
      const tmpClass = wx.getStorageSync('tmp_class');
      //获取当前日期
      let {
        todayMonth,
        todayDay
      } = this.getTodayDate()
      this.setData({
        startDay,
        now_day: day,
        now_week: week,
        thisWeek: week,
        now_month: month,
        now_month_number: month / 1, // 当前月份数字类型，用于数字运算
        tmpClass,
        todayMonth,
        todayDay,
        firstEntry: false
      })
      // 获取课表
      if (!wx.getStorageSync('course') && wx.getStorageSync('login_session')) {
        await this.getCourseListRequest()
      }
      this.getCourseList()
    } catch (e) {
      app.msg('获取课表失败')
      return
    }
  },

  /**
   * 获取第几周后的月份
   */
  getMonth: function (days) {
    let [year, month, day] = this.getTermDate()
    var date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days); //获取n天后的日期      
    var m = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    return m;
  },
  /**
   * 获取第几周后的星期几的日期
   */
  getDay: function (days) {
    let [year, month, day] = this.getTermDate()
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days); //获取n天后的日期      
    const d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate(); //获取当前几号，不足10补0    
    return d;
  },
  /**
   * 获取当前周
   */
  getNowWeek: function () {
    const date = new Date();
    let [year, month, day] = this.getTermDate()
    const start = new Date(year, month - 1, day);
    //计算时间差
    let left_time = parseInt((date.getTime() - start.getTime()) / 1000);
    //如果从周日算起，需要+1天
    if (this.data.startDay == 0) {
      left_time += 24 * 60 * 60
    }

    const days = parseInt(left_time / 3600 / 24);
    const week = Math.floor(days / 7) + 1;
    let result = week
    if (week > 20 || week <= 0) {
      result = this.data.now_week;
    }
    return result
  },
  /**
   * 获取课表
   */
  getCourse: function (week, first, animation) {
    var that = this;
    if (first === false && week == that.data.now_week) return
    var data = wx.getStorageSync('course');
    //将之前的课表清空
    if (typeof animation != "undefined" && animation) {
      that.toggleDelay()
    }
    let courses = [],
      courseGroup = {}
    if (data.length > 0) {
      var i = 0;
      for (var a = 0; a < data.length; a++) {
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
        data[a]['course_address'] = formatAddress(data[a]['course_address'])
        //将课程通过周次节次分组
        let key = data[a]['course_week'] + '-' + jie
        if (courseGroup[key]) {
          courseGroup[key].push(i)
        } else {
          courseGroup[key] = [i]
        }

        if (jieshu == 4) {
          key = data[a]['course_week'] + '-' + (Number(jie) + 2)
          if (courseGroup[key]) {
            courseGroup[key].push(i)
          } else {
            courseGroup[key] = [i]
          }
        }

        let display = false,
          thisWeek = false //是否是当周课表
        if (checkCourseInWeek(week, data[a])) {
          thisWeek = true
        }
        if (thisWeek || !that.data.onlyThisWeek) {
          display = true
        }
        var course = {
          indexNum: i++,
          week: data[a]['course_week'],
          jie: jie,
          jieshu: jieshu,
          name: that.fiterCourseTitle(data[a]['course_name'], jieshu),
          fullName: data[a]['course_name'],
          address: data[a]['course_address'],
          fullAddress: data[a]['full_address'],
          num: data[a]['num'],
          zhoushu: data[a]['course_weekly'],
          teacher: data[a]['course_teacher'],
          credit: data[a]['course_credit'],
          method: data[a]['course_method'],
          category: data[a]['course_category'],
          type: data[a]['course_type'] ? data[a]['course_type'] : 1,
          id: data[a]['course_id'] ? data[a]['course_id'] : 0,
          danshuang: data[a]['course_danshuang'],
          thisWeek: thisWeek,
          display: display,
          courseNum: 1
        };

        courses.push(course)
      }

      //隐藏存在冲突的课程
      for (let g in courseGroup) {
        if (courseGroup[g].length > 1) {
          let hasThisWeek = false
          var index = 0
          for (let i in courseGroup[g]) {
            index = courseGroup[g][i]
            if (hasThisWeek === false && courses[index].thisWeek) {
              courses[index].display = true
              hasThisWeek = index
            } else {
              courses[index].display = false
            }
          }
          if (hasThisWeek === false && !that.data.onlyThisWeek) {
            courses[index].display = true
            hasThisWeek = index
          }
          if (hasThisWeek !== false) {
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
  getCourseList() {
    const data = wx.getStorageSync('course');
    if (!data) {
      return
    }
    const courseList = []
    for (let weekIndex = 0; weekIndex < this.data.weekCount; weekIndex++) {
      let courses = [],
        courseGroup = {}
      let week = weekIndex + 1
      for (let a = 0; a < data.length; a++) {
        if (typeof data[a].course_weekly == "undefined") {
          continue
        }
        const tmp = data[a]['course_section'].split("-")
        const jie = tmp[0];
        let jieshu = 1
        if (tmp.length != 1) {
          jieshu = tmp[1] - tmp[0] + 1;
        }
        //格式化上课地点
        data[a]['full_address'] = data[a]['course_address']
        data[a]['course_address'] = formatAddress(data[a]['course_address'])
        //将课程通过周次节次分组
        let key = data[a]['course_week'] + '-' + jie
        if (courseGroup[key]) {
          courseGroup[key].push(a)
        } else {
          courseGroup[key] = [a]
        }

        if (jieshu == 4) {
          key = data[a]['course_week'] + '-' + (Number(jie) + 2)
          if (courseGroup[key]) {
            courseGroup[key].push(a)
          } else {
            courseGroup[key] = [a]
          }
        }
        let display = false
        //是否是当周课表
        let thisWeek = checkCourseInWeek(week, data[a])
        if (thisWeek || !this.data.onlyThisWeek) {
          display = true
        }
        const course = {
          week: data[a]['course_week'],
          jie: jie,
          jieshu: jieshu,
          name: this.fiterCourseTitle(data[a]['course_name'], jieshu),
          fullName: data[a]['course_name'],
          address: data[a]['course_address'],
          fullAddress: data[a]['full_address'],
          num: data[a]['num'],
          zhoushu: data[a]['course_weekly'],
          teacher: data[a]['course_teacher'],
          credit: data[a]['course_credit'],
          method: data[a]['course_method'],
          category: data[a]['course_category'],
          type: data[a]['course_type'] ? data[a]['course_type'] : 1,
          id: data[a]['course_id'] ? data[a]['course_id'] : 0,
          danshuang: data[a]['course_danshuang'],
          thisWeek,
          display,
          courseNum: 1,
        };
        courses.push(course)
      }
      //隐藏存在冲突的课程
      for (let g in courseGroup) {
        if (courseGroup[g].length == 1) {
          continue
        }
        let hasThisWeek = false
        let index = 0
        for (let i in courseGroup[g]) {
          index = courseGroup[g][i]
          if (!hasThisWeek && courses[index].thisWeek) {
            courses[index].display = true
            hasThisWeek = index
          } else {
            courses[index].display = false
          }
        }
        if (!hasThisWeek && !this.data.onlyThisWeek) {
          courses[index].display = true
          hasThisWeek = index
        }
        if (hasThisWeek) {
          courses[hasThisWeek].courseNum = courseGroup[g].length
        }
      }
      courseList.push({
        courses,
        courseGroup
      })
    }
    this.setData({
      courseList
    })
  },
  selectWeek(week) {
    const month = this.getMonth((week - 1) * 7);
    this.setData({
      now_week: week,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
    });
    const startDay = wx.getStorageSync('start_day')
    const day = this.getDayOfWeek(week, startDay)
    this.setData({
      now_day: day,
    })
  },
  /**
   * 选择周数
   */
  select: function (e) {
    var week = parseInt(e.currentTarget.dataset.index) + 1;
    this.selectWeek(week)
    this.hideWeekList()
  },
  /**
   * 显示课表详细内容
   */
  displayCourseInfo: function (e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    const {
      courses,
      courseGroup
    } = this.data.courseList[this.data.now_week - 1];
    const course = type === 'more' ? this.data.moreCourseList[index] : courses[index]
    //如果有多个课程则展开
    if (course.courseNum > 1 && type !== 'more') {
      //获取同时间的课程
      let ids = [],
        moreCourse = []
      let key = course.week + '-' + course.jie
      ids = ids.concat(courseGroup[key])
      if (course.jieshu == 4) {
        key = course.week + '-' + (Number(course.jie) + 2)
        for (let i in courseGroup[key]) {
          let val = courseGroup[key][i]
          if (ids.indexOf(val) == -1) {
            ids.push(val)
          }
        }
      }
      for (let i = 0; i < ids.length; i++) {
        let index = ids[i]
        moreCourse.push(courses[index])
      }
      this.setData({
        showMoreCourse: true,
        moreCourseList: moreCourse
      })
      return
    }
    wx.navigateTo({
      url: "info/info?internet_course_time=" + this.data.internet_course_time + "&data=" + encodeURIComponent(JSON.stringify(course)),
    })
    this.setData({
      showMoreCourse: false
    })
  },
  /**
   * 解析周数，将弃用
   */
  ana_week: function (week, weekly, danshuang) {
    var result = new Array();
    var temp1 = weekly.split(",");
    var temp2 = new Array();
    for (var i = 0; i < temp1.length; i++) {
      temp2[i] = temp1[i].split("-");
    }
    var k = 0; //周数
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
          let weekNum = parseInt(temp2[a][0])
          if ((danshuang == 1 && weekNum % 2 == 1) || (danshuang == 2 && weekNum % 2 == 0)) {
            result[k++] = weekNum;
          }
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
    return false
  },
  /**
   * 是否为实训周
   */
  getTrain: function (week) {
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
            train_course_id: train[i]['course_id'],
          });
          return;
        } else if (i == train.length - 1 && j == result.length - 1) {
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
  train: function (e) {
    var id = e.currentTarget.dataset.id;
    var train = wx.getStorageSync('train');
    for (var i = 0; i < train.length; i++) {
      if (id == train[i]['course_id']) {
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
  getCourseListRequest() {
    return getCourseList().then((res) => {
      wx.setStorageSync('course', res.data.course)
      wx.setStorageSync('train', res.data.train_course)
    })
  },

  //更新课表
  updateCourseRequest() {
    let that = this
    const updateList = that.data.updateList
    updateList.push(0)
    that.setData({
      updateList,
      updateCourseStatus: true
    })
    updateCourse().then((res) => {
      if (res.status == 0) {
        updateList[updateList.length - 1] = 1
        that.setData({
          updateList,
          updateCourseStatus: false
        })
        that.getCourseListRequest()
        setUpdateTime('course')
        //切换为当前学期
        courseFn.setCourseToNowTerm()
        //切换成当周
        let week = that.getNowWeek()
        that.selectWeek(week)
        that.setData({
          now_week: week
        })
        app.msg("更新成功", 'success')
        setTimeout(() => {
          that.hideUpdate()
        }, 1000);
        return
      }
      return reject('更新失败')
    }).catch(err => {
      //再获取一遍
      updateList[updateList.length - 1] = -1
      that.setData({
        updateList
      })
      if (updateList.length >= that.data.updateMaxCount) {
        // 更新次数上限还是失败
        app.msg('更新失败，请重试！')
        that.setData({
          updateCourseStatus: false
        })
        return
      }
      app.msg('更新失败，3秒后再次更新')
      setTimeout(() => {
        that.updateCourseRequest()
      }, 3000);
      console.log(err)
    })
  },

  /**
   * 对话框确认按钮点击事件
   */
  update() {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      app.msg("请先登录")
      return
    }
    if (!that.data.acceptTerms) {
      app.msg("请先接受使用条款")
      return
    }
    that.setData({
      showSetting: false
    })
    const canUpdateResult = canUpdate('course')
    if (canUpdateResult !== true) {
      app.msg(canUpdateResult)
      return
    }
    that.setData({
      updatingCourse: false,
      updateList: []
    })
    wx.removeStorageSync('tmp_class')
    that.updateCourseRequest()
  },

  //是否显示列表
  listDisplay: function () {
    var list = this.data.showSetting;
    if (list == 0) {
      this.setData({
        showSetting: true,
      });
    } else if (list == 1) {
      this.setData({
        showSetting: false,
      })
    }
  },
  //设置透明度
  sliderchange: function (e) {
    var type = e.currentTarget.dataset.type;
    var data = e.detail.value;
    switch (type) {
      case "frime":
        this.setData({
          Kopacity: data
        });
        wx.setStorageSync('Kopacity', data);
        break;
      case "course":
        this.setData({
          Copacity: data
        });
        wx.setStorageSync('Copacity', data);
        break;
      case "font":
        this.setData({
          fontSize: data
        });
        wx.setStorageSync('fontSize', data);
        break;
    };
  },
  //获取当天日期，课表显示高亮
  getTodayDate: function () {
    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();
    return {
      todayMonth: month + 1,
      todayDay: day
    }
  },

  getCourseNotice: function () {
    let notice = getNotice('course')
    let noticeDisplay = true
    if (!notice) {
      noticeDisplay = false
    } else {
      let notice_time_course = wx.getStorageSync('notice_time_course')
      if (notice_time_course >= notice.add_time || notice.display == 0) {
        noticeDisplay = false
      }
    }
    this.setData({
      noticeDisplay: noticeDisplay,
      notice: notice
    })
  },

  closeNotice: function () {
    let now = parseInt(new Date().getTime() / 1000)
    wx.setStorageSync('notice_time_course', now)
    this.setData({
      noticeDisplay: false
    })
  },

  clickNotice: function () {
    noticeClickEvent(this.data.notice)
  },

  hideMask: function () {
    this.setData({
      showSetting: false
    })
  },

  closeAd: function () {
    var ad = this.data.ad
    ad.display = false
    this.setData({
      ad: ad
    })
    //记录时间，24小时内不再显示广告
    wx.setStorageSync('close_ad_time', (new Date()).getTime())
  },

  //处理中文标点符号，课程名称过长
  fiterCourseTitle: function (title, jieshu) {
    title = title.replace(/\uff08/, '(')
    title = title.replace(/\uff09/, ')')
    var length = 10
    if (title.length > length && jieshu < 4) {
      return title.substr(0, length) + '...'
    } else {
      return title
    }
  },

  getConfigData: function () {
    if (!app.getUserId()) {
      return
    }
    var that = this
    var display_course_time = wx.getStorageSync('display_course_time')
    var area = wx.getStorageSync('user_area')
    if (display_course_time === '' || area === '') {
      getAreaInfo().then((res) => {
        if (res.status == 0) {
          that.setData({
            area: res.data.area,
            display_course_time: res.data.display,
            internet_course_time: res.data.internet_course_time //上网课时间
          })
          wx.setStorageSync('display_course_time', res.data.display)
          wx.setStorageSync('user_area', res.data.area)
          that.displayTime()
        }
      })
    } else {
      that.setData({
        display_course_time: display_course_time,
        area: area,
        internet_course_time: 0
      })
      that.displayTime()
    }
  },

  //显示上课时间
  displayTime: function () {
    if (this.data.display_course_time == 0) {
      return
    }
    let times = deepCopyArray(TIMES)

    if (this.data.area == '' || this.data.area == 0) {
      app.msg("您未设置校区，无法显示上课时间")
      return
    }
    //先判断今天是否有课，没课显示默认的
    var week = (new Date()).getDay()
    if (week == 0 || week == 6) {
      // 周末显示周一的
      week = 1
      // this.setData({
      //   course_time : times[this.data.area - 1]
      // })
      // return
    }

    var courses = wx.getStorageSync('course');
    for (var i = 0; i < courses.length; i++) {
      if (typeof courses[i].course_weekly == "undefined") {
        continue
      }
      var inWeek = checkCourseInWeek(this.data.now_week, courses[i])
      if (inWeek && courses[i]['course_week'] == week) {
        var jie = courses[i]['course_section'].split("-")[0];
        var jieshu = courses[i]['course_section'].split("-")[1] - courses[i]['course_section'].split("-")[0] + 1;
        //格式化上课地点
        courses[i]['course_address'] = courses[i]['course_address'].replace('-', '_') //把-换成_
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
        if (this.data.area == 1) {
          if (course.jie == 3 && course.jieshu == 2 || course.jie == 1 && course.jieshu == 4) {
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
        } else if (this.data.area == 2) {
          //北校区
          if ((course.jie == 3 && course.jieshu == 2 || course.jie == 1 && course.jieshu == 4) && floorNum > 4) {
            //楼层>4的情况，三四节分开上
            times[1][2][0] = "10:20"
            times[1][2][1] = "11:05"
            times[1][3][0] = "11:15"
            times[1][3][1] = "12:00"
          }
        }

      }
    }
    this.setData({
      course_time: times[this.data.area - 1]
    })
  },

  //获取一周的日期
  getDayOfWeek: function (week, startDay) {
    var day = []
    if (startDay === "0") {
      for (var i = -1; i < 6; i++) {
        var days = (week - 1) * 7 + i;
        day.push(this.getDay(days))
      }
      this.setData({
        zhou: ['日', '一', '二', '三', '四', '五', '六']
      })
    } else {
      for (var i = 0; i < 7; i++) {
        var days = (week - 1) * 7 + i;
        day.push(this.getDay(days))
      }
      this.setData({
        zhou: ['一', '二', '三', '四', '五', '六', '日']
      })
    }
    return day
  },

  //设置起始日
  setStartDay: function (e) {
    let val = e.detail.value
    this.setData({
      startDay: val
    })
    wx.setStorageSync('start_day', val)
    let week = this.data.now_week
    let day = this.getDayOfWeek(week, val)
    let month = this.getMonth((week - 1) * 7);

    this.setData({
      startDay: val,
      now_week: week,
      now_day: day,
      showSetting: 0,
      now_month: month,
      now_month_number: month / 1, // 当前月份数字类型，用于数字运算
    })
  },

  displayOnlyWeek: function () {
    let result = !this.data.onlyThisWeek
    this.setData({
      onlyThisWeek: result
    })
    wx.setStorageSync('onlyThisWeek', result)
    this.getCourseList()
  },
  hideMoreCourse: function () {
    this.setData({
      showMoreCourse: false
    })
  },

  /**
   * 页面跳转
   */

  // 设置背景
  setBg: function () {
    const device = wx.getSystemInfoSync()
    wx.navigateTo({
      url: `/pages/course/setBg/setBg?from=index&height=${device.windowHeight}&width=${device.windowWidth}`,
    })
  },

  // 课程管理
  courseList: function () {
    wx.navigateTo({
      url: '/pages/course/list/list',
    })
  },

  // 登录提示
  loginTips: function () {
    wx.navigateTo({
      url: '/pages/loginTips/loginTips',
    })
  },

  // 分享课表
  shareCourse: function () {
    if (!app.getUserId()) {
      app.msg("你还没有登录哦")
      return
    }
    const course = wx.getStorageSync('course')
    if (!course || course.length == 0) {
      app.msg('当前没有课表')
      return
    }
    this.setData({
      showSetting: false,
      showShare: true
    })
  },

  // 设置时间
  setTime: function () {
    if (!app.getUserId()) {
      app.msg("你还没有登录哦")
      return
    }
    wx.navigateTo({
      url: '/pages/course/setTime/setTime',
    })
  },

  getCourseTerm: function () {
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
  getTermDate: function () {
    let date = this.data.courseTerm ? this.data.courseTerm.term_date : this.data.thisTerm.date
    if (!date) {
      date = '2020-09-07'
    }
    return date.split('-')
  },
  //下载背景
  download: function (url) {
    let _this = this
    let promise = new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success: function (res) {
          if (res.statusCode === 200) {
            console.log(res.tempFilePath)
            const fs = wx.getFileSystemManager()
            _this.checkMaxSize().then((result) => {
              if (result) {
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
  checkMaxSize: function () {
    let maxSize = (10 - 2) * 1024 * 1024 / 2
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
  isStop: function () {
    let setting = app.getConfig('functions.course')
    this.setData({
      courseConfig: setting
    })
  },
  closeUpdateCourseModal() {
    this.setData({
      updatingCourse: false
    })
  },
  acceptTerms: function (e) {
    this.setData({
      acceptTerms: true
    })
  },

  //判断背景图片是否存在
  bgIsExist: function () {
    let _this = this
    let bg_img = wx.getStorageSync('bg_img')
    if (bg_img) {
      let bg_imgs = wx.getStorageSync('bg_imgs')
      const fs = wx.getFileSystemManager()
      fs.access({
        path: bg_img,
        complete: function (res) {
          if (res.errMsg != 'access:ok') {
            //图片被删了，重新下载
            let bg_type = wx.getStorageSync('bg_type')
            let url
            if (!bg_type) {
              app.msg("课表背景图片不存在，请重新设置")
            } else if (bg_type == 'diy') {
              url = _this.data.courseFileUrl + wx.getStorageSync('upload_course_bg')
            } else {
              url = _this.data.fileUrl + '/course_bg/' + bg_type + '.jpg'
            }
            if (!url) {
              return
            }
            _this.download(url).then((url) => {
              if (bg_type != 'diy') {
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
  // 显示更新
  showUpdate() {
    if (!app.getUserId()) {
      app.msg("请先登录")
      return
    }
    this.setData({
      showSetting: false,
      showUpdate: true
    })
  },
  // 隐藏更新
  hideUpdate() {
    this.setData({
      showUpdate: false,
      updateList: []
    })
  },

  // 隐藏分享
  hideShare() {
    this.setData({
      showShare: false
    })
  },

  confirmShareCourse() {
    setTimeout(() => {
      this.hideShare()
    }, 100);
  },

  hideSetting() {
    this.setData({
      showSetting: false
    })
  },

  showWeekList() {
    this.setData({
      showWeekList: true
    })
  },

  hideWeekList() {
    this.setData({
      showWeekList: false
    })
  },

  changeWeek(e) {
    const index = e.detail.current
    this.selectWeek(index + 1)
  }
})