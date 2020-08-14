const app = getApp()
const TIMES = require('../../../utils/course-time.js')
const courseFn = require('../../../utils/course')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sameCount:0,
    showStudent:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = JSON.parse(decodeURIComponent(options.data))
    let internet_course_time = options.internet_course_time || 1
    //判断是否是本班课程
    var tmp_class = wx.getStorageSync('tmp_class')
    var course_stu = wx.getStorageSync('course_stu')
    if (tmp_class == "" && !course_stu && data.type == 1) {
      this.setData({
        showStudent: true
      })
      this.getStudent(data)
    }
    var area = wx.getStorageSync('user_area')
    var time, week
    var jie = parseInt(data.jie)
    var jieshu = parseInt(data.jieshu)

    if (internet_course_time){
      if(jieshu == 2){
        time = TIMES[2][jie - 1][0] + '~' + TIMES[2][jie][1]
      }else if(jieshu == 4){
        time = TIMES[2][jie - 1][0] + '~' + TIMES[2][jie+2][1]
      }else{
        time = TIMES[2][jie - 1][0] + '~' + TIMES[2][jieshu-1][1]
      }
    }else if(area == 1){
      //正常情况
      if (jieshu == 2) {
        if(jie < 5) {
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1] + ',' + TIMES[0][jie][0] + '~' + TIMES[0][jie][1]
        }else{
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie][1]
        }
        
      } else if (jieshu == 4) {
        if(jie < 5){
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1] + ',' + TIMES[0][jie][0] + '~' + TIMES[0][jie][1] + '、' + TIMES[0][jie + 1][0] + '~' + TIMES[0][jie + 1][1] + ',' + TIMES[0][jie + 2][0] + '~' + TIMES[0][jie + 2][1]
        }else{
          time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie][1] + '、' + TIMES[0][jie + 1][0] + '~' + TIMES[0][jie + 2][1]
        }
        
      } else if (jieshu == 1) {
        time = TIMES[0][jie - 1][0] + '~' + TIMES[0][jie - 1][1]
      } else {
        time = "获取失败"
      }

    }else if(area == 2 && jie > 0){
      time = jieshu == 2 ? (TIMES[1][jie - 1][0] + '~' + TIMES[1][jie - 1][1] + ',' + TIMES[1][jie][0] + '~' + TIMES[1][jie][1]) : (TIMES[1][jie - 1][0] + "~" + TIMES[1][jie + jieshu - 2][1])
    }
    

    switch (parseInt(data.week)) {
      case 1: week = '周一'; break;
      case 2: week = '周二'; break;
      case 3: week = '周三'; break;
      case 4: week = '周四'; break;
      case 5: week = '周五'; break;
    }

    var section = week + ' ' + jie + '-' + (jie + jieshu - 1) + '节';

    data.section = section
    data.time = time

    this.setData({
      area:area,
      course:data
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  rest:function(){
    wx.navigateTo({
      url: '../../article/article?src=' + encodeURIComponent('http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100000581&idx=1&sn=6ef90448df9ac2d4930fa3b15aa8399e&chksm=6a35b9415d423057df293f498fe3027b2ede3fe46000e69fc1a713a90eb7f894aabe416d7fa2#rd'),
    })
  },

  setTime:function(){
    wx.navigateTo({
      url: '../setTime/setTime',
    })
  },

  getStudent:function(data){
    var that = this
    var section = data.jie + '-' + (parseInt(data.jie) + parseInt(data.jieshu) - 1)
    let courseTerm = courseFn.getNowCourseTerm()
    app.httpRequest({
      url: "course/getSameCourseStudent",
      data:{
        term:courseTerm.term,
        name:(data.fullName || data.name),
        weekly:data.zhoushu,
        section:section,
        teacher:data.teacher,
        address: data.fullAddress,
        week:data.week,
        category:data.category
      },
      success:function(res){
        if(res.data.status == 0){
          that.setData({
            sameCount:res.data.data
          })
        }
      }
    })
  },

  goStudents:function(){
    wx.navigateTo({
      url: 'students/students?data=' + encodeURIComponent(JSON.stringify(this.data.course)),
    })
  },

  edit:function(){
    if(this.data.course.id == 0){
      app.msg('获取课程信息失败，请先更新课表')
      return
    }
    wx.navigateTo({
      url: '/pages/course/add/add?id=' + this.data.course.id + '&from=info',
    })
  }
})