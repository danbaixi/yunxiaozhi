const app = getApp()
const colors = require('../../../utils/colors')
const course = require('../../../utils/course')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fiter:0,
    fiters:['全部','必修','选修','统考','非统考','自定义'],
    counts:[0,0,0,0,0,0],
    courses:[],
    displayCourses:[],
    displayCount:0,
    toggleDelay:false,
    tmpClass:null,
    courseTerm:null,
    terms:[],
    termIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    let tmpClass = wx.getStorageSync('tmp_class')
    let courseStu = wx.getStorageSync('course_stu')
    let userId = app.getUserId()
    let courseTerm = course.getNowCourseTerm()
    this.setData({
      tmpClass: tmpClass,
      courseStu: courseStu,
      userId: userId,
      courseTerm: courseTerm
    })
    this.getTerms()
    this.getData()
    this.getCounts()
    this.setData({
      fiter:0
    })
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
    let data = wx.getStorageSync('course')
    let courses = []
    for(let i = 0;i<data.length;i++){
      let item = data[i]
      if(!item.course_weekly){
        continue
      }
      let course_item = {
        'course_teacher': item.course_teacher,
        'course_weekly': item.course_weekly,
        'course_week': util.num2Week(item.course_week),
        'course_section': item.course_section,
        'course_danshuang': item.course_danshuang,
        'course_address': util.formatAddress(item.course_address),
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
    let displayCourses = []
    if(index == this.data.fiter){
      return
    }
    let courses = this.data.courses
    for(let i=0;i<courses.length;i++){
      let display = this.displayCourse(index,courses[i])
      if(display){
        displayCourses.push(courses[i])
      }
      courses[i].display = display
    }
    this.setData({
      toggleDelay:displayCourses.length > 0,
      fiter:index,
      courses:courses,
      displayCourses:displayCourses,
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
  getCounts:function(){
    let courses = wx.getStorageSync('course')
    let counts = [0,0,0,0,0,0]
    let oldName = ''
    for(let i=0;i<courses.length;i++){
      let course = courses[i]
      if(course.course_name == oldName || !course.course_weekly){
        continue
      }
      oldName = course.course_name
      if(course.course_category && course.course_category.indexOf('必修课') != -1){
        counts[1]++
      }
      if(course.course_category && course.course_category.indexOf('任选课') != -1){
        counts[2]++
      }
      if(course.course_method == '统考'){
        counts[3]++
      }else{
        counts[4]++
      }
      if(course.course_type == 2){
        counts[5]++
      }
      counts[0]++
    }
    this.setData({
      counts:counts
    })
  },
  addCourse:function(e){
    let id = e.currentTarget.dataset.id
    if(id){
      wx.navigateTo({
        url: '/pages/course/add/add?id=' + id + '&from=list',
      })
      return
    }
    let nowTerm = app.getConfig('nowTerm.term')

    if(this.data.courseTerm.term != nowTerm){
      app.msg("学期都结束了，你还要添加课程？")
      return
    }
    wx.navigateTo({
      url: '/pages/course/add/add?from=list',
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
  },
  changeClass:function(){
    wx.navigateTo({
      url: '/pages/setClass/setClass',
    })
  },
  //获取学期
  getTerms:function(){
    let _this = this
    let stu_id = wx.getStorageSync('user_id')
    let classname = _this.data.tmpClass && _this.data.tmpClass.name ? _this.data.tmpClass.name : ''
    if(stu_id == '' && classname == ''){
      let term = course.getNowCourseTerm()
      _this.setData({
        terms:[term]
      })
      return
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.promiseRequest({
      url:'data/getTermsByClassname',
      data:{
        stu_id: stu_id,
        classname: classname
      },
      needLogin:false,
    }).then((result) =>{
      wx.hideLoading()
      let terms = result.data
      let termIndex = 0
      if(_this.data.courseTerm){
        terms.forEach((element,index) => {
          if(element.term == _this.data.courseTerm.term){
            termIndex = index
          } 
        });
      }
      _this.setData({
        terms: result.data,
        termIndex:termIndex
      })
    })
  },
  //获取当前学期的课表
  getNowTermCourse:function(){
    app.httpRequest({
      url: 'data/getCourseFromSchool',
      data: {
        number: number,
        className: name
      },
      needLogin:false,
      success: function (res) {
        wx.hideLoading()
        if (res.data.status !== 0) {
          app.msg(res.data.message)
          return
        }
        wx.setStorageSync('tmp_class', tmpClass)
        wx.setStorageSync('course', res.data.data.course)
        wx.switchTab({
          url: '/pages/course/course'
        })
      }
    })
  },
  //切换学期
  changeTerm:function(e){
    let _this = this
    let index = e.detail.value
    let term = _this.data.terms[index]
    let nowTerm = course.getNowTerm()
    let stu_id = app.getUserId()
    let tmp_class = wx.getStorageSync('tmp_class')
    if(stu_id == '' && !tmp_class){
      return
    }
    let url = '', data = { term: term.term },needLogin = false
    if(!stu_id || tmp_class){
      url = 'data/getCourseByClassname'
      data.classname = tmp_class.name
      if(term == nowTerm.term){
        url = 'data/getCourseFromSchool'
      }
    }else{
      url = 'course/getList'
      needLogin = true
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.promiseRequest({
      url:url,
      data:data,
      needLogin:needLogin
    }).then((result) =>{
      wx.hideLoading()
      wx.setStorageSync('course', result.data.course)
      wx.setStorageSync('course_term', term)
      let courseTerm = course.getNowCourseTerm()
      _this.setData({
        courseTerm: courseTerm
      })
      _this.getData()
      _this.getCounts()
    }).catch((error)=>{
      app.msg(error.message)
    })
  }
})