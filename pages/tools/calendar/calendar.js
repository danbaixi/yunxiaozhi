const app = getApp();
const ccFile = require('../../../utils/calendar-converter.js')
const calendarConverter = new ccFile.CalendarConverter();
const {
  getCalendarList
} = require('../../api/other')
const {
  getGradeList
} = require('../../../utils/common')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekly: ['日', '一', '二', '三', '四', '五', '六'],
    colors: [
      "153,50,204",
      "65,105,225",
      "60,179,113",
      "235,201,19",
      "255,127,80",
      "32,178,170",
      "230,83,178",
      "55,87,184",
      "138,83,83",
      "196,126,39",
      "145,168,69",
      "224,93,93",
      "111,105,172",
      "56,163,165",
      "30,144,255",
      "205,133,63",
    ],
    rowCount: 5,
    events: {},
    clickButton: '',
    loading: true,
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    semester: [],
    semesterIndex: 0,
    selectEventIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const date = new Date()
    const now_year = date.getFullYear()
    const now_month = date.getMonth() + 1
    const now_day = date.getDate()
    const { windowHeight } = wx.getSystemInfoSync()
    this.setData({
      now_year: now_year,
      now_month: now_month,
      year: now_year,
      month: now_month,
      now_day: now_day,
      windowHeight
    })
    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('最新出炉的白云校历', 'calendar.png', this.route)
  },

  // 获取数据
  async getData() {
    try {
      await this.getCalendarData()
      this.getDayData()
      this.getWeeks()
    } catch (err) {
      console.log(err)
      app.msg('获取失败，请重试')
    }
  },

  // 获取校历数据
  getCalendarData: function () {
    const that = this
    return getCalendarList().then((res) => {
      const data = res.data.calendar;
      const semester = res.data.semester;
      const events = {}
      const calendar = []
      // 事件按[年月]分组
      for (let i = 0; i < data.length; i++) {
        const stemp = data[i].startDate.split('-');
        const sYear = parseInt(stemp[0])
        const sMonth = parseInt(stemp[1])
        const sKey = `${sYear}${sMonth}`
        const start = [sYear, sMonth, parseInt(stemp[2])];

        const etemp = data[i].endDate.split('-');
        const eYear = parseInt(etemp[0])
        const eMonth = parseInt(etemp[1])
        const eKey = `${eYear}${eMonth}`
        const end = [eYear, eMonth, parseInt(etemp[2])];

        let dayCount = this.eventDayCount(start, end)
        const event = {
          semester: data[i].semester,
          title: data[i].title,
          start: start,
          end: end,
          dayCount,
        }
        calendar.push(event)
        if (!events[sKey]) {
          events[sKey] = []
        }
        events[sKey].push(event)
        if (sKey != eKey) {
          if (!events[eKey]) {
            events[eKey] = []
          }
          events[eKey].push(event)
        }
      }
      that.setData({
        calendar, // 保留原数据用于计算周次
        events,
        semester: semester,
        loading: false
      })
    })
  },

  // 计算每月有多少天
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  // 计算每月第一天是星期几
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  // 计算两个日期天数差
  eventDayCount(start, end) {
    const d1 = new Date(start[0] + '/' + start[1] + '/' + start[2])
    const d2 = new Date(end[0] + '/' + end[1] + '/' + end[2])
    const diff = parseInt((d2 - d1) / 1000 / 60 / 60 / 24)
    return diff + 1
  },
  // 获取农历
  getExt(date) {
    const {
      year,
      month,
      day
    } = date
    const d = new Date(year, month - 1, day)
    const dEx = calendarConverter.solar2lunar(d)
    let ext = ""
    if (dEx.lunarFestival != "") {
      ext = dEx.lunarFestival
    } else if (dEx.lunarDay === "初一") {
      ext = dEx.lunarMonth + "月"
    } else {
      ext = dEx.lunarDay
    }
    return ext
  },
  getDayData: function (year, month) {
    year = year || this.data.now_year
    month = month || this.data.now_month
    // 日期
    const days = [];
    // 获取上个月的空日期长度
    const emptyGrids = this.getFirstDayOfWeek(year, month);
    // 获取上个月剩余日期
    // 上个月天数
    const preYear = month == 1 ? year - 1 : year
    const preMonth = month == 1 ? 12 : month - 1
    const preMonthDayCount = this.getThisMonthDays(preYear, preMonth)
    if (emptyGrids > 0) {
      for (let i = 0; i < emptyGrids; i++) {
        const d = {
          year: preYear,
          month: preMonth,
          day: preMonthDayCount - i,
          events: []
        }
        d.ext = this.getExt(d)
        days.unshift(d)
      }
    }
    const dayCount = new Date(year, month, 0).getDate();
    const firstDay = new Date(Date.UTC(year, month - 1, 1)).getDay();
    let rowCount = 5;
    if (firstDay == 6 || firstDay >= 5 && dayCount == 31) {
      rowCount = 6;
    }
    const nextMonthCount = rowCount * 7 - dayCount - emptyGrids;
    for (let i = 0; i < dayCount; i++) {
      const d = {
        year: year,
        month: month,
        day: i + 1,
        events: []
      }
      d.ext = this.getExt(d)
      days.push(d)
    }
    if (nextMonthCount > 0) {
      const nextYear = month == 12 ? year + 1 : year
      const nextMonth = month == 12 ? 1 : month + 1
      for (let i = 0; i < nextMonthCount; i++) {
        const d = {
          year: nextYear,
          month: nextMonth,
          day: i + 1,
          events: [],
        }
        d.ext = this.getExt(d)
        days.push(d)
      }
    }
    // 当月事件
    const thisMonthEvents = this.data.events[`${year}${month}`] || []
    if (thisMonthEvents) {
      // 分配到每天
      for (let i = 0; i < thisMonthEvents.length; i++) {
        const event = thisMonthEvents[i]
        // 事件开始日期下标
        let eventDayCount = event['dayCount']
        let startIndex = event['start'][2] + emptyGrids - 1
        // 不在本月开始
        if (event['start'][1] != month) {
          if (emptyGrids == 0) {
            startIndex = 0
            eventDayCount = event['end'][2]
          } else {
            // 放不下的情况
            if (eventDayCount - (emptyGrids + event['end'][2]) > 0) {
              startIndex = 0
              eventDayCount = emptyGrids + event['end'][2]
            } else {
              startIndex = event['start'][2] - (preMonthDayCount - emptyGrids) - 1
            }
          }
        }
        // 不在本月结束
        if (event['end'][1] != month) {
          if (nextMonthCount == 0) {
            eventDayCount = dayCount - event['start'][2] + 1
          } else {
            // 放不下的情况
            if (event['end'][2] > nextMonthCount) {
              eventDayCount = dayCount - event['start'][2] + 1 + nextMonthCount
            } else {
              eventDayCount = dayCount - event['start'][2] + 1 + event['end'][2]
            }
          }
        }
        for (let j = startIndex; j < (eventDayCount + startIndex); j++) {
          if (!days[j]['position']) {
            days[j]['position'] = []
          }
          // 存储位置，用于选中圆角
          if (j == startIndex) {
            days[j]['position'][i] = 'start'
          }else if (j == (eventDayCount + startIndex - 1)) {
            days[j]['position'][i] = 'end'
          }else {
            days[j]['position'][i] = 'mid'
          }
          days[j]['events'].push(i)
        }
      }
    }
    this.setData({
      rowCount, //设置行数
      dayCount, //该月天数
      days, //日期
      thisMonthEvents //该月的全部事件
    })
    wx.hideLoading()
    this.setTerm()
  },

  // 切换
  switch() {
    this.getDayData()
    this.getWeeks()
    this.setEventPosition()
  },

  //上个月、下个月的实现
  alterMonth: function (e) {
    let now_year = parseInt(this.data.now_year);
    let now_month = parseInt(this.data.now_month);
    const type = e.currentTarget.dataset.type
    let clickButton = ''
    if (type == 'add') {
      clickButton = 'right'
      now_year = now_month == 12 ? now_year + 1 : now_year
      now_month = now_month == 12 ? 1 : now_month + 1
    } else if (type == 'reduce') {
      clickButton = 'left'
      now_year = now_month == 1 ? now_year - 1 : now_year
      now_month = now_month == 1 ? 12 : now_month - 1
    }
    this.setData({
      selectEventIndex: -1,
      now_month,
      now_year,
      clickButton
    })
    this.switch()
  },

  // 计算出周次
  getWeeks: function () {
    const that = this;
    const now_year = that.data.now_year;
    const now_month = that.data.now_month;
    const week = [];
    const semester = that.data.semester;
    const calendar = that.data.calendar;
    const start = [],
      end = [];
    for (let a = 0; a < semester.length; a++) {
      for (let b = 0; b < calendar.length; b++) {
        if (calendar[b].semester == semester[a].semester) {
          if (calendar[b].title.indexOf('正式上课') != -1) {
            start[a] = calendar[b].start;
          } else if (calendar[b].title == '考试周' || calendar[b].title.indexOf('统考') > -1) {
            end[a] = calendar[b].end;
          }
        }
      }
    }
    //判断当月是属于哪个学期的
    let xq_num = -1;
    for (let c = 0; c < start.length; c++) {
      const d1 = new Date(start[c][0] + '/' + start[c][1] + '/' + start[c][2])
      const d2 = new Date(end[c][0] + '/' + end[c][1] + '/' + end[c][2])
      const d3 = new Date(now_year, now_month, 0);
      const d4 = new Date(now_year, now_month - 1, 1);
      const diff1 = parseInt((d3 - d1) / 1000 / 60 / 60 / 24);
      const diff2 = parseInt((d2 - d4) / 1000 / 60 / 60 / 24);
      if (diff1 >= 0 && diff2 >= 0) {
        xq_num = c;
        break;
      }
    }
    if (xq_num < 0) {
      for (let i = 0; i < that.data.rowCount; i++) {
        week.push('假期');
      }
    } else {
      const startTime = start[xq_num];
      const endTime = end[xq_num];
      const d1 = new Date(startTime[0] + '/' + startTime[1] + '/' + startTime[2]);
      const d2 = new Date(endTime[0] + '/' + endTime[1] + '/' + endTime[2]);
      const d3 = new Date(now_year + '/' + now_month + '/1');
      const diff1 = parseInt((d3 - d1) / 1000 / 60 / 60 / 24);
      const diff2 = parseInt((d2 - d3) / 1000 / 60 / 60 / 24);
      if (diff1 < 0 && diff2 < 0) {
        for (let i = 0; i < that.data.rowCount; i++) {
          week.push('假期');
        }
      } else {
        // 当月的第一天是星期几
        const nowWeek = that.getFirstDayOfWeek(now_year, now_month)
        // 第一个星期五的日期
        const firstSat = 6 - nowWeek;
        if (now_month == startTime[1]) {
          let tmp = 1;
          for (let i = 0; i < that.data.rowCount; i++) {
            const SatDate = firstSat + i * 7;
            if (SatDate < startTime[2]) {
              week.push('假期');
            } else {
              week.push('第' + tmp + '周');
              tmp++;
            }
          }
        } else {
          const oDate1 = new Date(now_year, now_month, firstSat);
          const oDate2 = new Date(startTime[0], startTime[1], startTime[2]);
          const iDays = parseInt(oDate1 - oDate2) / 1000 / 60 / 60 / 24;
          let firstWeek = Math.ceil(iDays / 7);
          if (now_month == endTime[1]) {
            for (let i = 0; i < that.data.rowCount; i++) {
              const SatDate = firstSat + i * 7;
              if (SatDate < endTime[2] + 7) {
                week.push('第' + firstWeek + '周');
                firstWeek++;
              } else {
                week.push('假期');
              }
            }
          } else {
            for (let i = 0; i < that.data.rowCount; i++) {
              week.push('第' + firstWeek + '周');
              firstWeek++;
            }
          }
        }
      }
    }
    that.setData({
      weekData: week,
    })
  },

  seleteDate: function (e) {
    let date = e.detail.value
    let arr = date.split('-')
    let year = parseInt(arr[0])
    let month = parseInt(arr[1])
    this.setData({
      now_month: month,
      now_year: year,
    })
    this.switch()
  },

  //判定学期
  setTerm: function () {
    let year = this.data.now_year
    let month = this.formatMonth(this.data.now_month)
    let date = `${year}-${month}-01`
    let semester = this.data.semester
    let d = new Date(date)
    for (let i = 0, len = semester.length; i < len; i++) {
      let s = new Date(semester[i].date + '-01')
      if (d >= s) {
        this.setData({
          semesterIndex: i
        })
        return
      }
    }
  },

  //选择学期
  seleteTerm: function (e) {
    let index = e.detail.value
    let semester = this.data.semester[index]
    let [year, month] = semester.date.split('-')
    this.setData({
      semesterIndex: index,
      now_month: this.formatMonth(month),
      now_year: year
    })
    this.switch()
  },

  //格式化月份
  formatMonth: function (month) {
    month = Number(month)
    if (month < 10) {
      return '0' + month
    }
    return '' + month
  },

  // 获取学期
  getSemester() {
    const semester = this.data.semester
    let termNum = semester.map(s => s.semester)
    getGradeList(termNum).then((grades) => {
      for (let i in semester) {
        if (grades[semester[i].semester] != '未知') {
          semester[i].title += `(${grades[semester[i].semester]})`
        }
      }
      this.setData({
        semester
      })
    })
  },

  // 选择事件
  selectEvent(e) {
    this.setData({
      selectEventIndex: e.currentTarget.dataset.index
    })
    this.setEventPosition()
  },

  // 选择日期
  clickDate(e) {
    const index = e.currentTarget.dataset.index
    const events = this.data.days[index].events
    if (events.length == 0) {
      return
    }
    const selectEventIndex = events[0]
    this.setData({
      selectEventIndex
    })
    this.setEventPosition()
  },

  // 事件定位
  setEventPosition() {
    const index = this.data.selectEventIndex > -1 ? this.data.selectEventIndex : 0
    const query = wx.createSelectorQuery()
    query.select('#event-list').node()
    query.exec((res) => {
      const scrollView = res[0].node;
      scrollView.scrollIntoView(`#event-${index}`)
    })
  }
})