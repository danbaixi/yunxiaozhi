const { getTrainCourseList, updateTrainCourse } = require('../../../api/course')
const { backPage } = require('../../../../utils/common')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    loading: true,
    showDetail:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from: options.from
    })
    this.getList()
  },

  //更新
  update:function(){
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    let _this = this
    wx.showLoading({
      title: '更新中...',
      mask: true
    })
    updateTrainCourse()
      .then((res) => {
        app.msg(res.message)
        if(res.status == 0){
          _this.setData(res.data)
        }
      })
  },

  getList:function(){
    let _this = this
    getTrainCourseList().then((res) => {
      if (res.status == 0) {
        _this.setData({
          course: res.data.course,
          term: res.data.term,
          loading: false
        })
      }
    })
  },

  backPageBtn: function () {
    backPage(this.data.from)
  },
  //查看详情
  viewDetail:function(e){
    let detailIndex = e.currentTarget.dataset.index
    this.setData({
      detailIndex: detailIndex,
      showDetail: true
    })
  },
  //hide
  hideModal:function(){
    this.setData({
      showDetail: false
    })
  }
})