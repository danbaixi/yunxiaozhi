const app = getApp()
const util = require('../../../../utils/util')
const { getClockInListByMonth } = require('../../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weeks: ['MON','TUE','WEB','THU','FRI','SAT','SUN'],
    year:0,
    month:0,
    days:[],
    list:[],
    getState:1,
    active:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    let stu_id = options.stu_id || 0
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    _this.setData({
      stu_id:stu_id,
      year:year,
      month:month
    })
    app.isLogin(this.route).then(function(){
      _this.getList()
      _this.getDays()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const _this = this
    return {
      path: _this.route + '?stu_id=' + app.getUserId(),
      title: '点击查看我的早起记录'
    }
  },

  //获取月打卡记录
  getList: function () {
    let _this = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getClockInListByMonth({
      state:_this.data.getState,
      stu_id: _this.data.stu_id,
      year: _this.data.year,
      month: _this.data.month
    }).then((res) => {
      wx.hideLoading()
      if(res.status == 0){
        _this.setData(res.data)
      }
    })
  },

  getDays:function(){
    let len = util.getThisMonthDays(this.data.year,this.data.month)
    let dayStart = util.getFirstDayOfWeek(this.data.year,this.data.month)
    dayStart = dayStart == 0 ? 7 : dayStart
    let days = new Array(len+dayStart-1).fill(0)
    let num = 1
    for(let i=dayStart-1;i<days.length;i++){
      if(num < 10){
        days[i] = '0' + num
      }else{
        days[i] = '' + num
      }
      num++
    }
    this.setData({
      days:days
    })
  },

  setMonth:function(e){
    let year = this.data.year
    let month = this.data.month
    let type = e.currentTarget.dataset.type
    if(type == 'next'){
      month++
    }else{
      month--
    }
    if(month > 12){
      year++
      month = 1
    }
    if(month < 1){
      year--
      month = 12
    }
    this.setData({
      year:year,
      month:month,
      getState:0,
      list:[]
    })
    this.getDays()
    this.getList()
    this.setData({
      active:-1
    })
  }
})