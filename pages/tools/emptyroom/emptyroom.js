const app = getApp()
const {
  getFloors,
  initEmptyRoom,
  getEmptyRoomV2
} = require('../../api/other')
const {
  isDebug,
  isTest
} = require('../../../utils/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      area: ['西校区','北校区'],
      floor: [],
      weekly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      week: ['星期一', '星期二', '星期三', '星期四', '星期五'],
      section: ['1-2节', '3-4节', '1-4节', '5-6节', '7-8节', '5-8节', '9-10节', '11-12节', '9-12节']
    },
    selected: {
      area: 0,
      floor: 0,
      weekly: 0,
      week: 0,
      section: 0
    },
    titles: {
      area: '校区',
      floor: '教学楼',
      weekly: '周数',
      week: '星期',
      section: '节数'
    },
    openStatus: 1,
    openTips: "",
    initErr: false,
    initMessage: '好像遇到了问题，请联系客服解决',
    t: '',
    selectColumn: '',
    showSelect: false,
    code: '',
    queryCount: 0, // 查询次数
    list: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var functionStatus = app.getConfig('functions.emptyroom')
    if (!functionStatus || functionStatus.status == 0) {
      that.setData({
        openStatus: functionStatus.status,
        openTips: functionStatus.tips
      })
      return
    }
    that.init()
    const domain = that.getDomain()
    const date = new Date()
    const week = date.getDay()
    const weekly = that.getNowWeekly()
    that.setData({
      domain,
      'selected.weekly': weekly,
      'selected.week': week == 0 || week == 6 ? 0 : week - 1
    })
    that.getFloors(that.data.selected.area)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  //获取教学楼
  getFloors: function (area) {
    const that = this
    getFloors({
      area: Number(area) + 1
    }).then((res) => {
      if (res.status == 0) {
        that.setData({
          'form.floor': res.data,
          'selected.floor': 0
        })
        return
      }
      app.msg('获取教学楼失败，请重试')
    })
  },

  //获取当前周
  getNowWeekly: function () {
    var date = new Date();
    let termDate = app.getConfig('nowTerm.date')
    if (termDate === false) {
      termDate = '2020-03-02'
    }
    let data = termDate.split('-')
    let [year, month, day] = [data[0], data[1], data[2]]
    var start = new Date(year, month - 1, day);
    var left_time = parseInt((date.getTime() - start.getTime()) / 1000);
    var days = parseInt(left_time / 3600 / 24);
    var week = Math.floor(days / 7) + 1;
    if (week > 20 || week <= 0) {
      return 0;
    } else {
      return week - 1;
    }
  },

  init() {
    const that = this
    initEmptyRoom().then(res => {
      if (res.status != 0) {
        throw new Error(res.message)
      }
      that.setData({
        ...res.data
      })
    }).catch(err => {
      console.log(err)
      that.setData({
        initErr: true,
        initMessage: err.message || '暂时无法使用，请联系客服'
      })
    })
  },
  getDomain() {
    if (isDebug) {
      if (isTest) {
        return 'https://www.yunxiaozhi.cn/test/public/api/'
      }
      // return 'http://localhost/yxz_v1/public/index.php/api/'
      return 'http://localhost/yunxiaozhi/public/index.php/api/'
    }
    return 'https://www.yunxiaozhi.cn/v1/public/api/'
  },

  //获取空教室
  getList: function () {
    const that = this
    if (that.data.code == '') {
      app.msg('请输入验证码')
      return
    }
    let {area, floor, weekly, week, section } = that.data.selected
    area = Number(area) + 1
    if (area == 2) {
      area = 3
    }
    floor = floor == 0 ? '' : that.data.form.floor[floor].id
    const data = {
      area,
      floor,
      weekly: weekly + 1,
      week: week + 1,
      section: section,
      cookie: that.data.cookie,
      code: that.data.code,
    }
    getEmptyRoomV2(data).then(res => {
      if (res.status == 6001) {
        // 验证码错误
        that.refreshCode()
        return
      }
      if (res.status != 0) {
        that.setData({
          list: null
        })
        app.msg('暂无记录')
        return
      }
      app.msg("查询成功")
      // 分组
      const list = {}
      res.data.map(item => {
        const room = {
          name: item.name,
          number: item.number
        }
        if (!list[item.pid] || !list[item.pid].list) {
          list[item.pid] = {
            floor: item.floor,
            list: [room]
          }
        } else {
          list[item.pid].list.push(room)
        }
      })
      that.setData({
        list,
        queryCount: that.data.queryCount + 1
      })
      if (that.data.queryCount % 8 == 0) {
        // 刷新验证码
        that.refreshCode()
      }
    }).catch(err => {
      console.error(err)
      app.msg(err.message || '查询失败')
    })
  },

  select(e) {
    const column = e.currentTarget.dataset.column
    this.setData({
      showSelect: true,
      selectColumn: column
    })
  },

  closeSelectPopup() {
    this.setData({
      showSelect: false
    })
  },

  selectItem(e) {
    const index = e.currentTarget.dataset.index
    const selected = this.data.selected
    if (index == selected[this.data.selectColumn]) {
      return
    }
    selected[this.data.selectColumn] = index
    this.setData({
      selected,
      showSelect: false
    })
    if (this.data.selectColumn == 'area') {
      // 更新教学楼
      this.getFloors(selected[this.data.selectColumn])
    }
  },

  refreshCode() {
    const t = new Date().getTime()
    this.setData({
      t,
      code: ''
    })
  },

  viewName(e) {
    app.msg(e.currentTarget.dataset.name)
  }
})