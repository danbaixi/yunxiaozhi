const app = getApp()
var colors = require('../../../utils/colors.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fiter:0,
    fiters:['全部','必修课','选修课','统考科目','非统考科目','自定义课程'],
    courses:[],
    displayCourses:[],
    displayCount:0,
    toggleDelay:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tmpClass = wx.getStorageSync('tmp_class')
    if(tmpClass){
      app.msg("不能管理非本班的课表")
      setTimeout(function(){
        wx.switchTab({
          url: '/pages/course/course',
        })
      },1000)
      return
    }
    this.getData()
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
  getData:function(){
    var data = wx.getStorageSync('course')
    var courses = []
    for(let i = 0;i<data.length;i++){
      var item = data[i]
      let course_item = {
        'course_teacher': item.course_teacher,
        'course_weekly': item.course_weekly,
        'course_week': app.num2Week(item.course_week),
        'course_section': item.course_section,
        'course_danshuang': item.course_danshuang,
        'course_address': app.formatAddress(item.course_address),
      }
      if(courses[item.num-1]){
        courses[item.num-1].items.push(course_item)
      }else{
        let course = {
          'course_id': item.course_id,
          'course_num': item.course_num,
          'course_name': item.course_name,
          'course_credit': item.course_credit,
          'course_hours': item.course_hours,
          'course_category': item.course_category,
          'course_method': item.course_method,
          'course_teachMethod': item.course_teachMethod,
          'course_type': item.course_type,
          'num': item.num-1,
          'display': true,
          'items': [course_item]
        }
        courses[item.num-1] = course
      }
    }
    this.setData({
      toggleDelay:(courses.length > 0),
      colors:colors,
      courses:courses,
      displayCourses:courses,
      displayCount:courses.length
    })
    this.stopAnimation()
  },
  fiterCourse:function(e){
    let index = e.currentTarget.dataset.index
    let displayCount = 0
    let displayCourses = []
    if(index == this.data.fiter){
      return
    }
    let courses = this.data.courses
    for(let i=0;i<courses.length;i++){
      let display = this.displayCourse(index,courses[i])
      if(display){
        displayCourses.push(courses[i])
        displayCount++
      }
      courses[i].display = display
    }
    this.setData({
      toggleDelay:displayCount > 0,
      fiter:index,
      courses:courses,
      displayCourses:displayCourses,
      displayCount:displayCount
    })
    this.stopAnimation()
  },
  displayCourse:function(index,course){
    switch(index){
      case 0:return true;break
      case 1:
        if(course.course_category && course.course_category.indexOf('必修课') != -1){
          return true;
        }
        return false
        break
      case 2:
        if(course.course_category && course.course_category.indexOf('任选课') != -1){
          return true;
        }
        return false
        break
      case 3:
        if(course.course_method == '统考'){
          return true
        }
        return false
        break
      case 4:
        if(course.course_method != '统考'){
          return true
        }
        return false
        break
      case 5:
        if(course.course_type == 2){
          return true
        }  
        return false
        break
    }
  },
  addCourse:function(e){
    let id = e.currentTarget.dataset.id
    if(id){
      wx.navigateTo({
        url: '/pages/course/add/add?id=' + id,
      })
    }
    wx.navigateTo({
      url: '/pages/course/add/add',
    })
  },
  stopAnimation:function(){
    if(this.data.toggleDelay){
      setTimeout(()=>{
        this.setData({
          toggleDelay:false
        })
      },1000)
    }
  }
})