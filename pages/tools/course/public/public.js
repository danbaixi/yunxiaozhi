const { getPublicCourseList } = require('../../../api/course')
const { backPage,getGradeList } = require('../../../../utils/common')
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
    let that = this
    app.isLogin('/' + that.route).then(function (res) {
      that.getList()
    })
  },

  //更新
  update:function(){
    app.msg('选修课暂不支持更新')
    return
  },

  getList:function(){
    let _this = this
    getPublicCourseList()
      .then((res) => {
        if (res.status == 0) {
          _this.setData({
            course: res.data.course,
            term: res.data.term,
            loading: false
          })
          if(res.data.term){
            getGradeList(res.data.term).then((grades) => {
              let termNum = Object.keys(res.data.term)
              termNum.sort((x,y) => y - x)
              for(let i of termNum){
                res.data.term[i] += `(${grades[i]})`
              }
              _this.setData({
                termNum,
                term: res.data.term
              })
            })
          }
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