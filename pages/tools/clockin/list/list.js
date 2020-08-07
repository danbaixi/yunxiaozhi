const app = getApp()
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
    app.isLogin('/'+this.route).then(function(){
      _this.getList()
      _this.getDays()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getDay:function(){

  },
  //获取月打卡记录
  getList: function () {
    let _this = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.httpRequest({
      url: 'clockin/getListForMonth',
      data: {
        state:_this.data.getState,
        stu_id: _this.data.stu_id,
        year: _this.data.year,
        month: _this.data.month
      },
      success: function (res) {
        wx.hideLoading()
        if(res.data.status == -1){
          app.msg(res.data.message)
          return
        }
        _this.setData(res.data.data)
      }
    })
  },
  // 计算每月有多少天
  getThisMonthDays() {
    return new Date(this.data.year, this.data.month, 0).getDate();
  },
  // 计算每月第一天是星期几
  getFirstDayOfWeek() {
    return new Date(Date.UTC(this.data.year, this.data.month-1, 1)).getDay();
  },
  getDays:function(){
    let len = this.getThisMonthDays()
    let dayStart = this.getFirstDayOfWeek()
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