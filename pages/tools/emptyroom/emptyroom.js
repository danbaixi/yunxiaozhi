const app = getApp()
const { getFloors } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areas:[
      '西校区',
      '北校区'
    ],
    floors:[],
    weeklys:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    weeks: ['星期一', '星期二', '星期三', '星期四','星期五'],
    sections: ['1-2节', '3-4节', '1-4节', '5-6节', '7-8节', '5-8节', '9-10节', '11-12节', '9-12节',],
    area:0,
    floor:0,
    weekly:0,
    week:0,
    section:0,
    openStatus:1,
    openTips:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var functionStatus = app.getConfig('functions.emptyroom')
    if(!functionStatus || functionStatus.status == 0){
      that.setData({
        openStatus:functionStatus.status,
        openTips: functionStatus.tips
      })
      return
    }
    var date = new Date()
    var week = date.getDay()
    var weekly = that.getNowWeekly()
    that.setData({
      weekly: weekly,
      week: week == 0 || week == 6 ? 0 : week - 1
    })
    that.getFloors(that.data.area, function (data) {
      that.setData({
        floors: data,
        floor:0
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //选择校区
  selectArea:function(e){
    var that = this
    var area = e.detail.value
    that.getFloors(area,function(data){
      that.setData({
        area:e.detail.value,
        floors: data,
        floor:0
      })
    })
  },

  //选择教学楼
  selectFloor:function(e){
    this.setData({
      floor: e.detail.value,
    })
  },

  selectWeekly: function (e) {
    this.setData({
      weekly: e.detail.value,
    })
  },

  selectWeek: function (e) {
    this.setData({
      week: e.detail.value,
    })
  },

  selectSection: function (e) {
    this.setData({
      section: e.detail.value,
    })
  },

  //获取教学楼
  getFloors:function(area,callback){
    getFloors({
      area: Number(area)+1
    }).then((res) => {
      if(res.status == 0){
        callback(res.data)
      }
    })
  },

  //获取当前周
  getNowWeekly: function () {
    var date = new Date();
    let termDate = app.getConfig('nowTerm.date')
    if(termDate === false){
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
      return week-1;
    }
  },

  //获取空教室
  getList:function(){
    var title = this.data.areas[this.data.area] + '>' + this.data.floors[this.data.floor]['name'] + ' 第' + (this.data.weekly+1) + '周 ' + this.data.weeks[this.data.week] + ' ' + this.data.sections[this.data.section] 
    wx.navigateTo({
      url: '/pages/tools/emptyroom/list/list?area=' + this.data.area + '&floor=' + this.data.floors[this.data.floor].id + '&week=' + this.data.week + '&weekly=' + (Number(this.data.weekly)+1) + '&section=' + this.data.section + '&title=' + title,
    })
  }
})