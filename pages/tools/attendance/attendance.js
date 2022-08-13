const app = getApp()
const { backPage, canUpdate,setUpdateTime,getGradeList } = require('../../../utils/common')
const { getAttendanceList, updateAttendanceList } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xq: [],
    attendance:[],
    num:0,
    showModal: false,
    input_focus: 0,
    update_time:null,
    isNull:false,
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options){
      this.setData({
        from:options.from
      })
    }
    this.getData()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
    this.update()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('点击查询个人考勤记录', 'attendance.png', this.route)
  },

  /**
   * 对话框确认按钮点击事件
   */
  update: function (e) {
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    const that = this
    const canUpdateResult = canUpdate('attendance')
    if(canUpdateResult !== true){
      app.msg(canUpdateResult)
      return
    }
    wx.showLoading({
      title: "更新中",
      mask: true
    })
    updateAttendanceList().then((res) => {
      wx.hideLoading()
      if (res.status == 0) {
        app.msg('更新了' + res.data + '条记录')
        setUpdateTime('attendance')
        setTimeout(function () {
          that.onLoad()
        }, 2000)
      }
    })
  },

  backPageBtn: function () {
    backPage(this.data.from)
  },

  // 获取数据
  getData:function(){
    let that = this
    getAttendanceList().then((res) => {
      if (res.status == 0) {
        res.data.loading = false
        res.data.isNull = res.data.attendance.length == 0
        that.setData(res.data)
        if(res.data.attendance.length > 0){
          getGradeList(Object.values(res.data.term)).then((list) => {
            that.setData({
              grade: list
            })
          })
        }
      }
    })
  }
})